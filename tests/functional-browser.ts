import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, unlink } from 'node:fs/promises';
import { chromium } from '@playwright/test';

process.env.NODE_ENV = 'test';
process.env.MAIL_TRANSPORT = 'json';
process.env.BOOTSTRAP_ADMIN_EMAIL = 'admin@campus.test';
process.env.COOKIE_SECURE = 'false';
process.env.PUBLIC_URL = 'http://127.0.0.1:3004';

const { createApp } = await import('../server/src/app.js');
const { initDb, closeDb, query } = await import('../server/src/db.js');
const { getCapturedMail, clearCapturedMail } = await import('../server/src/mail.js');

await initDb();
const server = createServer(createApp());
await new Promise<void>((resolve) => server.listen(3004, '127.0.0.1', resolve));
await mkdir('test-results/showcase', { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox', '--js-flags=--max-old-space-size=256']
});
const adminContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
// Keep the student's complete high-value workflow on a phone-sized viewport.
// This exercises the same labels and actions used on desktop without introducing
// CSS-coupled selectors into the business-flow assertions.
const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
const recruiterContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const adminPage = await adminContext.newPage();
const studentPage = await studentContext.newPage();
const recruiterPage = await recruiterContext.newPage();
let context = adminContext;
let page = adminPage;
const origin = 'http://127.0.0.1:3004';
const appNav: Record<string, string> = {
  '/opportunities': 'Opportunities', '/applications': 'Applications', '/profile': 'My profile',
  '/companies': 'Companies', '/approvals': 'Recruiter access', '/hackathons': 'Hackathons'
};
const run = `ui-e2e-${Date.now().toString(36)}`;
const studentEmail = `demo-student-${run.slice(-4)}@campus.test`;
const recruiterEmail = `demo-recruiter-${run.slice(-4)}@campus.test`;
const studentRoll = `UI-${Date.now().toString(36).toUpperCase()}`;
const companyName = `Demo Systems ${run.slice(-4)}`;
const recruiterCompanyName = `Demo Recruiter Co ${run.slice(-4)}`;
const companyCode = `UI-${Date.now().toString(36).toUpperCase()}`;
const errors: string[] = [];
const failedImages: string[] = [];
const mobileLayoutIssues = new Set<string>();
const checks: string[] = [];
const createdOpportunityIds = new Set<number>();
const createdCompanyIds = new Set<number>();
for (const trackedPage of [adminPage, studentPage, recruiterPage]) {
  trackedPage.on('pageerror', (error) => errors.push(error.message));
  trackedPage.on('response', (response) => {
    if (response.request().resourceType() === 'image' && response.status() >= 400) failedImages.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
}
for (const trackedPage of [adminPage, studentPage, recruiterPage]) trackedPage.on('response', async (response) => {
  if (!response.url().startsWith(`${origin}/api/`) || response.status() < 200 || response.status() >= 300) return;
  const request = response.request();
  if (request.method() !== 'POST' && request.method() !== 'PUT') return;
  try {
    const body = await response.json();
    if (request.url().includes('/api/opportunities') && typeof body.id === 'number') createdOpportunityIds.add(body.id);
    if (request.url().includes('/api/hackathons') && typeof body.opportunity_id === 'number') createdOpportunityIds.add(body.opportunity_id);
    if (request.url().includes('/api/companies') && typeof body.id === 'number') createdCompanyIds.add(body.id);
  } catch { /* Empty or non-JSON successful responses need no cleanup ID. */ }
});

function pass(label: string) { checks.push(label); console.log('PASS', label); }
async function selectRole(role: string) {
  await page.getByRole('tab', { name: role, exact: true }).tap();
}
async function requestOtp(email: string) {
  // `admin@campus.test` is a shared, known fake test identity; reset only its
  // short-lived verification challenge/cooldown so reruns are deterministic.
  await query('DELETE FROM otp_challenges WHERE email=:email', { email });
  await query('DELETE FROM otp_email_locks WHERE email=:email', { email });
  await page.getByLabel('Email address').fill(email);
  const continueButton = page.getByRole('button', { name: 'Continue with email' });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent?.includes('Continue with email')) as HTMLButtonElement | undefined;
    return Boolean(button && !button.disabled);
  });
  await continueButton.tap();
  await page.getByLabel('6-digit verification code').waitFor();
  const mail = getCapturedMail().filter((message) => message.to === email).at(-1);
  assert(mail, `Controlled test email was not captured for ${email}`);
  await page.getByLabel('6-digit verification code').fill(mail.code);
  await page.getByRole('button', { name: 'Verify and continue' }).tap();
}
async function login(email: string, role: string) {
  if (new URL(page.url()).pathname !== '/login') await page.goto(`${origin}/login`);
  await selectRole(role);
  await requestOtp(email);
  await page.waitForURL(`${origin}/`);
  await page.getByRole('heading', { name: /Good|Overview|Welcome|Hello|dashboard/i }).first().waitFor();
  await page.waitForLoadState('networkidle');
}
async function gotoApp(path: string) {
  const label = appNav[path];
  assert(label, `No shell link mapped for ${path}`);
  const quickNav = page.getByRole('navigation', { name: 'Quick navigation' });
  const quickLink = quickNav.getByRole('link', { name: label, exact: true });
  if (await quickLink.count()) {
    await quickLink.tap();
    await page.waitForURL(`${origin}${path}`);
    return;
  }
  const navButton = page.getByRole('button', { name: 'Open navigation' });
  const openedDrawer = (await navButton.count()) > 0 && (await navButton.getAttribute('aria-expanded')) !== 'true';
  if (openedDrawer) {
    await navButton.tap();
    assert.equal(await navButton.getAttribute('aria-expanded'), 'true', 'Mobile navigation must expose its expanded state');
  }
  const link = openedDrawer
    ? page.getByRole('dialog', { name: 'Placement workspace' }).getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true })
    : page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true });
  await link.tap();
  await page.waitForURL(`${origin}${path}`);
  if (openedDrawer) await page.waitForFunction(() => document.querySelector('button[aria-label="Open navigation"]')?.getAttribute('aria-expanded') === 'false');
}
async function checkRoleWidthMatrix(routes: Array<[string, string | RegExp]>, role: string) {
  for (const width of [320, 360, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [path, title] of routes) {
      await page.goto(`${origin}${path}`);
      await page.getByRole('heading', { name: title, exact: typeof title === 'string' }).first().waitFor();
      const audit = await page.evaluate(() => {
        const root = document.querySelector('main') ?? document.body;
        const controls = [...root.querySelectorAll<HTMLElement>('button,a[href],input:not([type="hidden"]),select,textarea')]
          .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
          .map((element) => {
            const isAssociatedInput = element instanceof HTMLInputElement && ['checkbox', 'radio', 'file'].includes(element.type);
            const isCompositeField = element.parentElement?.tagName === 'LABEL' && element.parentElement.classList.contains('search-box') || element.parentElement?.tagName === 'LABEL' && element.parentElement.classList.contains('filter-select');
            const target = isAssociatedInput || isCompositeField ? (element.closest('label') || element) : element;
            const box = target.getBoundingClientRect();
            let scrollableX = false;
            for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              if (parent.scrollWidth > parent.clientWidth + 1 && /(auto|scroll)/.test(style.overflowX)) { scrollableX = true; break; }
            }
            return { name: element.getAttribute('aria-label') || target.textContent?.trim() || element.getAttribute('name') || element.tagName, width: box.width, height: box.height, left: box.left, right: box.right, scrollableX };
          });
        const tables = [...root.querySelectorAll('table')].map((table) => {
          const headers = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() || '');
          const labels = [...table.querySelectorAll('tbody tr')].flatMap((row) => [...row.querySelectorAll('td')].map((cell, index) => ({ expected: headers[index] || 'Actions', actual: cell.getAttribute('data-label') || '' })));
          return { headers, labels };
        });
        return { viewport: innerWidth, pageWidth: document.documentElement.scrollWidth, controls, tables };
      });
      if (audit.pageWidth > audit.viewport + 1) mobileLayoutIssues.add(`${role} ${path} ${width}px: page width ${audit.pageWidth}px exceeds viewport`);
      for (const control of audit.controls) {
        const name = control.name.replace(/\s+/g, ' ').slice(0, 45);
        if (control.width < 44 || control.height < 44) mobileLayoutIssues.add(`${role} ${path} ${width}px: target "${name}" is ${Math.round(control.width)}×${Math.round(control.height)}px`);
        if ((control.left < -1 || control.right > width + 1) && !control.scrollableX) mobileLayoutIssues.add(`${role} ${path} ${width}px: target "${name}" extends beyond viewport`);
      }
      for (const table of audit.tables) {
        if (table.headers.length === 0) mobileLayoutIssues.add(`${role} ${path} ${width}px: table has no column headers`);
        for (const cell of table.labels) if (!cell.actual || cell.actual !== cell.expected) mobileLayoutIssues.add(`${role} ${path} ${width}px: table cell label "${cell.actual}" does not match header "${cell.expected}"`);
      }
    }
    pass(`${role} critical routes fit without horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
}
async function auditMobileDialog(label: string) {
  const dialog = page.getByRole('dialog').last();
  const beforeCount = mobileLayoutIssues.size;
  const metrics = await dialog.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const activeInside = node.contains(document.activeElement);
    const smallControls = [...node.querySelectorAll<HTMLElement>('button,input,select,textarea')]
      .filter((element) => element.getClientRects().length)
      .flatMap((element) => {
        const isAssociatedChoice = element instanceof HTMLInputElement && ['checkbox','radio','file'].includes(element.type);
        const target = isAssociatedChoice ? (element.closest('label') || element) : element;
        const box = target.getBoundingClientRect();
        return box.width < 44 || box.height < 44 ? [{ label: element.getAttribute('aria-label') || target.textContent?.trim() || element.tagName, width: Math.round(box.width), height: Math.round(box.height) }] : [];
      });
    const hasScrollableRegion = [node, ...node.querySelectorAll<HTMLElement>('*')].some((element) => {
      const style = getComputedStyle(element);
      return element.scrollHeight > element.clientHeight + 1 && /(auto|scroll)/.test(`${style.overflowY} ${style.overflow}`);
    });
    const needsScroll = [node, ...node.querySelectorAll<HTMLElement>('*')].some((element) => element.scrollHeight > element.clientHeight + 1);
    return { width: rect.width, height: rect.height, activeInside, smallControls, needsScroll, hasScrollableRegion };
  });
  if (metrics.width > 390 || metrics.height > 844) mobileLayoutIssues.add(`${label} dialog exceeds 390×844: ${JSON.stringify({width:metrics.width,height:metrics.height})}`);
  if (!metrics.activeInside) mobileLayoutIssues.add(`${label} dialog did not receive initial focus`);
  for (const control of metrics.smallControls) mobileLayoutIssues.add(`${label} dialog target "${control.label}" is ${control.width}×${control.height}px`);
  if (metrics.needsScroll && !metrics.hasScrollableRegion) mobileLayoutIssues.add(`${label} dialog content exceeds its viewport without a scrollable region`);
  if (mobileLayoutIssues.size === beforeCount) pass(`${label} dialog fits, receives focus, and has 44px controls`);
  else console.log(`MOBILE_DIALOG_ISSUES ${label}`, JSON.stringify([...mobileLayoutIssues].slice(beforeCount)));
}
async function logout() {
  await page.getByRole('button', { name: 'Sign out', exact: true }).tap();
  await page.waitForFunction(() => location.pathname === '/login' || Boolean(document.querySelector('.landing-page')));
  if (new URL(page.url()).pathname !== '/login') await page.goto(`${origin}/login`);
}
async function cleanup() {
  // Remove only identities and records carrying this run's generated IDs/prefix.
  const users = await query<any>('SELECT id,email FROM users WHERE email IN (:student,:recruiter)', { student: studentEmail, recruiter: recruiterEmail });
  const userIds = users.map((row) => Number(row.id));
  const recruiterCompany = (await query<any>('SELECT company_id FROM users WHERE email=:email', { email: recruiterEmail }))[0];
  const studentRows = userIds.length ? await query<any>(`SELECT id,user_id FROM students WHERE user_id IN (${userIds.map((_, i) => `:u${i}`).join(',')})`, Object.fromEntries(userIds.map((id, i) => [`u${i}`, id]))) : [];
  const studentIds = studentRows.map((row) => Number(row.id));

  for (const userId of userIds) {
    const files = await query<any>('SELECT stored_name FROM uploads WHERE owner_user_id=:id', { id: userId });
    for (const file of files) await unlink(`storage/uploads/${file.stored_name}`).catch(() => {});
    await query('DELETE FROM uploads WHERE owner_user_id=:id', { id: userId });
  }
  if (studentIds.length) {
    const binds = Object.fromEntries(studentIds.map((id, i) => [`s${i}`, id]));
    const inStudents = studentIds.map((_, i) => `:s${i}`).join(',');
    await query(`DELETE FROM hackathon_registrations WHERE student_id IN (${inStudents})`, binds);
    await query(`DELETE FROM placements WHERE application_id IN (SELECT id FROM applications WHERE student_id IN (${inStudents}))`, binds);
    await query(`DELETE FROM internships WHERE application_id IN (SELECT id FROM applications WHERE student_id IN (${inStudents}))`, binds);
    await query(`DELETE FROM applications WHERE student_id IN (${inStudents})`, binds);
    await query(`DELETE FROM certificates WHERE student_id IN (${inStudents})`, binds);
    await query(`DELETE FROM student_phone_numbers WHERE student_id IN (${inStudents})`, binds);
  }
  for (const id of createdOpportunityIds) {
    await query('DELETE FROM hackathon_registrations WHERE hackathon_id IN (SELECT id FROM hackathons WHERE opportunity_id=:id)', { id });
    await query('DELETE FROM hackathons WHERE opportunity_id=:id', { id });
    await query('DELETE FROM applications WHERE opportunity_id=:id', { id });
    await query('DELETE FROM opportunities WHERE id=:id', { id });
  }
  if (studentIds.length) {
    const binds = Object.fromEntries(studentIds.map((id, i) => [`s${i}`, id]));
    const inStudents = studentIds.map((_, i) => `:s${i}`).join(',');
    await query(`DELETE FROM hackathon_registrations WHERE student_id IN (${inStudents})`, binds);
  }
  for (const email of [studentEmail, recruiterEmail]) {
    await query('DELETE FROM otp_challenges WHERE email=:email', { email });
    await query('DELETE FROM otp_email_locks WHERE email=:email', { email });
    await query('DELETE FROM users WHERE email=:email', { email });
  }
  for (const id of createdCompanyIds) await query('DELETE FROM companies WHERE id=:id AND company_code=:code', { id, code: companyCode });
  await query('DELETE FROM companies WHERE company_code=:code', { code: companyCode });
  if (recruiterCompany?.company_id != null) await query('DELETE FROM companies WHERE id=:id AND name=:name', { id: recruiterCompany.company_id, name: recruiterCompanyName });
}

try {
  const departments = await query<any>('SELECT id,name,code FROM departments ORDER BY id');
  assert(departments.length > 0, 'Oracle must provide at least one registration department');
  const dept = departments[0];

  await login('admin@campus.test', 'Placement team');
  await checkRoleWidthMatrix([
    ['/',/Good (morning|afternoon|evening),/], ['/opportunities','Opportunity management'], ['/applications','Applications'],
    ['/students','Student directory'], ['/companies','Companies'], ['/certificates','Certificates'],
    ['/hackathons','Hackathons'], ['/outcomes','Outcomes'], ['/approvals','Recruiter access'], ['/reports','Placement reports']
  ], 'placement team');
  await gotoApp('/companies');
  await page.getByRole('button', { name: 'Add company' }).tap();
  await auditMobileDialog('Create company');
  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Company code').fill(companyCode);
  await page.getByLabel('Industry').fill('Software');
  await page.getByLabel('Contact email').fill(`${run}@campus.test`);
  await page.getByLabel('Website').fill('https://example.com');
  await page.getByRole('button', { name: 'Save company' }).tap();
  await page.getByText(companyName, { exact: true }).waitFor();
  pass('placement team creates company through the company form');

  const companyRow = page.getByRole('row').filter({ hasText: companyName });
  await companyRow.getByRole('button', { name: 'Edit' }).tap();
  await auditMobileDialog('Edit company');
  await page.getByLabel('Industry').fill('Software and AI');
  await page.getByRole('button', { name: 'Save company' }).tap();
  await page.getByRole('row').filter({ hasText: companyName }).getByText('Software and AI').waitFor();
  pass('placement team edits company information');

  const makeOpportunity = async (title: string, type: 'placement' | 'internship') => {
    await gotoApp('/opportunities');
    await page.getByRole('button', { name: 'Create opportunity' }).tap();
    await auditMobileDialog('Create opportunity');
    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Role').fill(type === 'internship' ? 'Engineering Intern' : 'Software Engineer');
    const opportunityForm = page.getByRole('dialog', { name: 'Create opportunity' });
    const formSelects = opportunityForm.getByRole('combobox');
    assert.equal(await formSelects.count(), 3, 'Admin opportunity form should expose type, status, and company comboboxes');
    await formSelects.nth(0).selectOption(type);
    await formSelects.nth(1).selectOption('open');
    await formSelects.nth(2).selectOption({ label: companyName });
    await page.getByLabel('Employment type').fill(type === 'internship' ? 'Internship' : 'Full-time');
    await page.getByLabel('Annual CTC (₹) / monthly stipend (₹)').fill(type === 'internship' ? '40000' : '1200000');
    await page.getByLabel('Location').fill('Bengaluru');
    const deadline = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 16);
    await page.getByLabel('Application deadline').fill(deadline);
    await page.getByLabel('Minimum CGPA').fill('7');
    await page.getByLabel('Maximum active backlogs').fill('0');
    await page.getByLabel('Description').fill(`UI end-to-end test role ${title}`);
    await page.getByLabel('Eligible department codes').fill(dept.code);
    await page.getByLabel('Required skills').fill('SQL, TypeScript');
    await page.getByRole('button', { name: 'Save opportunity' }).tap();
    await page.getByRole('heading', { name: 'Opportunity management' }).waitFor();
    await page.getByText(title, { exact: true }).waitFor();
  };

  const placementTitle = 'Demo Software Engineer';
  const internshipTitle = 'Demo Engineering Internship';
  const withdrawTitle = 'Demo Withdraw Workflow';
  await makeOpportunity(placementTitle, 'placement');
  pass('placement team creates open opportunity with skill and department requirements');
  await page.getByRole('button', { name: new RegExp(placementTitle) }).first().tap();
  await page.getByRole('button', { name: 'Edit opportunity' }).tap();
  await page.getByLabel('Required skills').fill('SQL, TypeScript, Oracle');
  await page.getByLabel('Eligible department codes').fill(dept.code);
  await page.getByRole('button', { name: 'Save opportunity' }).tap();
  await page.getByRole('heading', { name: 'Opportunity management' }).waitFor();
  pass('placement team edits opportunity eligibility and required skills');

  await makeOpportunity(internshipTitle, 'internship');
  await makeOpportunity(withdrawTitle, 'placement');

  context = studentContext;
  page = studentPage;
  await page.goto(`${origin}/login`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Create account', exact: true }).tap();
  await page.getByLabel('Full name').fill('Demo Student');
  await page.getByLabel('Email address').fill(studentEmail);
  await page.getByLabel('Roll number').fill(studentRoll);
  await page.getByLabel('Department').selectOption(String(dept.id));
  await page.getByRole('button', { name: 'Create account with email' }).tap();
  await page.getByLabel('6-digit verification code').waitFor();
  const studentMail = getCapturedMail().filter((message) => message.to === studentEmail).at(-1);
  assert(studentMail, 'Student registration OTP was not captured');
  await page.getByLabel('6-digit verification code').fill(studentMail.code);
  await page.getByRole('button', { name: 'Verify and continue' }).tap();
  await page.waitForURL(`${origin}/`);
  await page.getByRole('heading', { name: /Good|Overview|Welcome|Hello|dashboard/i }).first().waitFor();
  pass('student registers and verifies email through the UI');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'test-results/showcase/student-dashboard-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => {
    const trigger = document.querySelector('button[aria-label="Open navigation"]');
    const sidebar = document.querySelector<HTMLElement>('aside[aria-label="Placement workspace"]');
    return trigger?.getAttribute('aria-expanded') === 'false'
      && Boolean(sidebar?.inert || sidebar?.getAttribute('aria-hidden') === 'true')
      && (!sidebar || sidebar.getBoundingClientRect().right <= 1);
  });
  await page.screenshot({ path: 'test-results/showcase/dashboard-mobile.png' });

  await checkRoleWidthMatrix([
    ['/',/Good (morning|afternoon|evening),/], ['/opportunities','Find your next opportunity'], ['/applications','Applications'], ['/profile','My profile'],
    ['/certificates','Certificates'], ['/hackathons','Hackathons'], ['/outcomes','Outcomes']
  ], 'student');

  await gotoApp('/profile');
  await page.getByRole('heading', { name: 'My profile' }).waitFor();
  await page.getByLabel('Full name').fill('Demo Student');
  await page.getByLabel('Batch').fill('2027');
  await page.getByLabel('CGPA').fill('9.2');
  await page.getByLabel('Active backlogs').fill('0');
  await page.getByLabel('Personal email').fill('');
  await page.getByLabel('Phone numbers').fill('+919876543210, +919876543211');
  await page.getByLabel('Skills').fill('SQL, TypeScript, Oracle');
  const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nUI E2E test document\n%%EOF') });
  const resumeUploadResponse = page.waitForResponse((response) => new URL(response.url()).pathname.includes('/uploads') && response.request().method() === 'POST');
  // The resume is the first of two file inputs in profile order (resume, Aadhaar);
  // the visible Upload label wraps the input but Playwright label resolution does
  // not trigger its React change handler in this nested-label markup.
  await page.locator('input[type="file"]').first().setInputFiles(pdf('ui-resume.pdf'));
  const resumeResponse = await resumeUploadResponse;
  assert(resumeResponse.ok(), `Demo resume upload returned HTTP ${resumeResponse.status()}`);
  const resumeUpload = await resumeResponse.json() as { url?: string };
  assert.match(resumeUpload.url || '', /^\/api\/uploads\//, 'resume upload returns a protected portal URL');
  await page.waitForFunction((expected) => document.querySelector<HTMLInputElement>('input[placeholder="Uploaded resume URL"]')?.value === expected, resumeUpload.url);
  await page.getByRole('button', { name: 'Save profile' }).tap();
  await page.getByText('Profile changes saved.').waitFor();
  await page.getByRole('heading', { name: 'My profile', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/showcase/profile-mobile.png' });
  assert.match(await page.getByPlaceholder('Uploaded resume URL').inputValue(), /^\/api\/uploads\//, 'resume upload is linked to profile');
  await page.getByRole('button', { name: 'Add', exact: true }).tap();
  await auditMobileDialog('Add certificate');
  await page.getByRole('dialog').getByLabel('Certificate name').fill('Demo Cloud Certificate');
  await page.getByRole('dialog').getByLabel('Issuer').fill('Demo Learning Institute');
  await page.getByRole('dialog').getByLabel('Completion date').fill('2026-10-15');
  await page.getByRole('dialog').getByLabel('Credential ID').fill('DEMO-CERT-01');
  await page.getByRole('dialog').getByLabel('Certificate file').setInputFiles(pdf('ui-certificate.pdf'));
  await page.getByRole('dialog').getByRole('button', { name: 'Save certificate' }).tap();
  await page.getByText('Demo Cloud Certificate', { exact: true }).waitFor();
  const credentialTabPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: 'View credential' }).tap();
  const credentialTab = await credentialTabPromise;
  await credentialTab.waitForLoadState('load');
  assert(credentialTab.url().startsWith(`${origin}/api/uploads/`), 'credential view link opens the protected uploaded PDF');
  await credentialTab.close();
  await page.getByRole('button', { name: 'Delete certificate' }).tap();
  await page.getByText('No certificates added').waitFor();
  pass('student edits profile, uploads a resume, adds/views/deletes a PDF certificate, and saves blank optional email');

  const applyFor = async (title: string) => {
    await gotoApp('/opportunities');
    await page.getByLabel('Opportunity type').selectOption(title === internshipTitle ? 'internship' : 'placement');
    await page.getByLabel('Search opportunities').fill(title);
    await page.getByText(title, { exact: true }).waitFor();
    if (title === placementTitle) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.getByRole('button', { name: new RegExp(title) }).first().tap();
      await page.getByRole('dialog').getByRole('heading', { name: title }).waitFor();
      await page.screenshot({ path: 'test-results/showcase/job-detail-desktop.png' });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.setViewportSize({ width: 390, height: 844 });
    }
    await page.getByRole('button', { name: new RegExp(title) }).first().tap();
    await page.getByRole('dialog').getByRole('heading', { name: title }).waitFor();
    const drawerBox = await page.getByRole('dialog').boundingBox();
    const applyBox = await page.getByRole('button', { name: 'Apply for this role' }).boundingBox();
    if (!drawerBox || drawerBox.width > 390 || drawerBox.height > 844) mobileLayoutIssues.add(`Opportunity drawer exceeds 390×844 for "${title}": ${JSON.stringify(drawerBox)}`);
    if (!applyBox || applyBox.height < 44 || applyBox.y + applyBox.height > 844) mobileLayoutIssues.add(`Apply action for "${title}" lacks a reachable 44px mobile target: ${JSON.stringify(applyBox)}`);
    if (!await page.evaluate(() => { const active = document.activeElement; return Boolean(active && document.querySelector('[role="dialog"]')?.contains(active)); })) mobileLayoutIssues.add(`Opportunity drawer for "${title}" did not receive keyboard focus`);
    await page.getByRole('button', { name: 'Apply for this role' }).tap();
    await page.getByRole('status').filter({ hasText: 'Application submitted' }).waitFor();
    if (title === placementTitle) await page.screenshot({ path: 'test-results/showcase/apply-mobile.png' });
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
  };
  await applyFor(placementTitle);
  pass('student searches, filters by type, opens opportunity details, and applies');
  await applyFor(internshipTitle);
  await gotoApp('/applications');
  const appliedPlacement = page.getByRole('row').filter({ hasText: placementTitle });
  await appliedPlacement.getByRole('button', { name: /Withdraw/ }).waitFor();
  await gotoApp('/opportunities');
  await page.getByLabel('Opportunity type').selectOption('placement');
  await page.getByLabel('Search opportunities').fill(withdrawTitle);
  await page.getByRole('button', { name: new RegExp(withdrawTitle) }).first().tap();
  await page.getByRole('button', { name: 'Apply for this role' }).tap();
  await page.getByRole('status').filter({ hasText: 'Application submitted' }).waitFor();
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await gotoApp('/applications');
  const withdrawRow = page.getByRole('row').filter({ hasText: withdrawTitle });
  await withdrawRow.getByRole('button', { name: /Withdraw/ }).tap();
  await withdrawRow.getByText('withdrawn', { exact: true }).waitFor();
  pass('student withdraws an active application through the applications table');

  context = adminContext;
  page = adminPage;
  await gotoApp('/applications');
  const stagePlacement = page.getByRole('row').filter({ hasText: placementTitle });
  await stagePlacement.getByRole('button', { name: /^Screening/ }).tap();
  await stagePlacement.getByRole('button', { name: /^Interview/ }).tap();
  await stagePlacement.getByRole('button', { name: /^Select/ }).tap();
  await stagePlacement.getByRole('button', { name: /Record outcome/ }).tap();
  await auditMobileDialog('Record placement outcome');
  await page.getByRole('dialog').getByLabel('Role').fill('Graduate Software Engineer');
  await page.getByRole('dialog').getByLabel('Offer description').fill('UI end-to-end selected placement record.');
  await page.getByRole('dialog').getByLabel('Annual CTC (₹)').fill('1200000');
  await page.getByRole('dialog').getByLabel('Offer date').fill('2026-11-09');
  await page.getByRole('dialog').getByRole('button', { name: 'Record outcome' }).tap();
  await page.getByText('Placement outcome recorded.').waitFor();
  pass('placement team moves application through screening, interview, selection, and records placement outcome');

  const internshipRow = page.getByRole('row').filter({ hasText: internshipTitle });
  await internshipRow.getByRole('button', { name: /^Screening/ }).tap();
  await internshipRow.getByRole('button', { name: /^Interview/ }).tap();
  await internshipRow.getByRole('button', { name: /^Select/ }).tap();
  await internshipRow.getByRole('button', { name: /Record outcome/ }).tap();
  await auditMobileDialog('Record internship outcome');
  await page.getByRole('dialog').getByLabel('Role').fill('Engineering Intern');
  await page.getByRole('dialog').getByLabel('Start date').fill('2026-12-01');
  await page.getByRole('dialog').getByLabel('End date').fill('2027-02-01');
  await page.getByRole('dialog').getByRole('button', { name: 'Record outcome' }).tap();
  await page.getByText('Internship outcome recorded.').waitFor();
  pass('placement team records selected internship outcome through its UI form');

  context = recruiterContext;
  page = recruiterPage;
  await page.goto(`${origin}/login`);
  await page.getByRole('button', { name: 'Create account', exact: true }).tap();
  await page.getByRole('tab', { name: 'Recruiter', exact: true }).tap();
  await page.getByLabel('Full name').fill('Demo Recruiter');
  await page.getByLabel('Email address').fill(recruiterEmail);
  await page.getByLabel('Company name').fill(recruiterCompanyName);
  await page.getByRole('button', { name: 'Create account with email' }).tap();
  await page.getByLabel('6-digit verification code').waitFor();
  const recruiterMail = getCapturedMail().filter((message) => message.to === recruiterEmail).at(-1);
  assert(recruiterMail, 'Recruiter registration OTP was not captured');
  await page.getByLabel('6-digit verification code').fill(recruiterMail.code);
  await page.getByRole('button', { name: 'Verify and continue' }).tap();
  await page.getByText(/awaiting placement-team approval/i).waitFor();
  pass('recruiter registers through the UI and receives pending approval state');

  context = adminContext;
  page = adminPage;
  await gotoApp('/approvals');
  const pending = page.getByRole('row').filter({ hasText: recruiterEmail });
  await pending.getByRole('button', { name: 'Approve' }).tap();
  await pending.waitFor({ state: 'detached' });
  pass('placement team approves pending recruiter through the access screen');
  await page.screenshot({ path: 'test-results/ui-functional-approvals.png', fullPage: true });

  context = recruiterContext;
  page = recruiterPage;
  await login(recruiterEmail, 'Recruiter');
  await checkRoleWidthMatrix([
    ['/',/Good (morning|afternoon|evening),/], ['/opportunities','Opportunity management'], ['/applications','Applications'], ['/hackathons','Hackathons'],
    ['/companies','Companies'], ['/outcomes','Outcomes'], ['/reports','Placement reports']
  ], 'recruiter');
  await gotoApp('/companies');
  await page.getByRole('heading', { name: 'Companies' }).waitFor();
  await page.getByText(recruiterCompanyName, { exact: true }).waitFor();
  await gotoApp('/opportunities');
  await page.getByRole('button', { name: 'Create opportunity' }).tap();
  const recJob = `${run} Recruiter Created Role`;
  await page.getByLabel('Title').fill(recJob);
  await page.getByLabel('Role').fill('Product Engineer');
  await page.getByLabel('Application deadline').fill(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 16));
  await page.getByLabel('Description').fill('Recruiter UI workflow job.');
  await page.getByLabel('Required skills').fill('React, SQL');
  await page.getByLabel('Eligible department codes').fill(dept.code);
  await page.getByRole('button', { name: 'Save opportunity' }).tap();
  await page.getByText(recJob, { exact: true }).waitFor();
  pass('approved recruiter creates an opportunity for its registered company');

  await gotoApp('/hackathons');
  await page.getByRole('button', { name: 'Create hackathon' }).tap();
  await auditMobileDialog('Create hackathon');
  const hackathonTitle = 'Demo Buildathon';
  const start = new Date(Date.now() + 15 * 86400000);
  const deadline = new Date(Date.now() + 10 * 86400000);
  const end = new Date(Date.now() + 16 * 86400000);
  const localInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  await page.getByLabel('Title').fill(hackathonTitle);
  await page.getByLabel('Mode').selectOption('hybrid');
  await page.getByLabel('Location').fill('Bengaluru and online');
  await page.getByLabel('Start date').fill(localInput(start));
  await page.getByLabel('End date').fill(localInput(end));
  await page.getByLabel('Application deadline').fill(localInput(deadline));
  await page.getByLabel('Team size').fill('4');
  await page.getByLabel('Description').fill('UI end-to-end hackathon workflow.');
  await page.getByRole('button', { name: 'Publish hackathon' }).tap();
  await page.getByText(hackathonTitle, { exact: true }).waitFor();
  pass('approved recruiter creates a hackathon through the event form');

  context = studentContext;
  page = studentPage;
  await gotoApp('/hackathons');
  const event = page.getByRole('article').filter({ hasText: hackathonTitle });
  await event.getByRole('button', { name: 'Register team' }).tap();
  await auditMobileDialog('Register team');
  await page.getByLabel('Team name').fill('Demo Team');
  await page.getByRole('dialog').getByRole('button', { name: 'Register team' }).tap();
  await page.getByText('Your team is registered.').waitFor();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await event.getByRole('button', { name: 'Registrations' }).tap({ timeout: 1500 }).catch(() => {});
  const registrationDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: `${hackathonTitle} registrations` }) });
  await registrationDialog.getByText('Demo Team', { exact: true }).waitFor();
  pass('student registers a hackathon team and views its registration');
  await page.screenshot({ path: 'test-results/ui-functional-hackathon.png', fullPage: true });

  console.log('BROWSER_ERRORS', JSON.stringify(errors));console.log('FAILED_IMAGES', JSON.stringify(failedImages));
  console.log('MOBILE_LAYOUT_ISSUES', JSON.stringify([...mobileLayoutIssues]));
  assert.deepEqual(errors, [], 'UI workflow has no uncaught browser errors');
  pass('all exercised UI flows have no uncaught browser errors');
  assert.deepEqual(failedImages, [], 'UI workflows have no failed image assets');
  pass('all exercised UI routes load their image assets');
  assert.deepEqual([...mobileLayoutIssues], [], 'Responsive pages must fit, keep controls reachable, and meet 44px target size');
  pass('all role routes fit each width and keep 44px controls reachable');
  console.log(`FUNCTIONAL BROWSER RESULT: ${checks.length} checks passed; external email was not sent.`);
} catch (error) {
  await page.screenshot({ path: 'test-results/ui-functional-failure.png', fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser.close();
  await cleanup().catch((error) => { console.error('UI workflow cleanup issue:', (error as Error).message); process.exitCode = 1; });
  clearCapturedMail();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await closeDb();
}
