import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

process.env.NODE_ENV = 'test';
process.env.MAIL_TRANSPORT = 'json';
process.env.COOKIE_SECURE = 'false';
process.env.PUBLIC_URL = 'http://127.0.0.1:3005';

const { createApp } = await import('../server/src/app.js');
const { initDb, closeDb, query } = await import('../server/src/db.js');
const { getCapturedMail, clearCapturedMail } = await import('../server/src/mail.js');

const base = 'http://127.0.0.1:3005';
const email = 'student@campus.test';
const routes = [
  { name: 'dashboard', path: '/', heading: /^Good (morning|afternoon|evening),/ },
  { name: 'opportunities', path: '/opportunities', heading: 'Find your next opportunity' },
  { name: 'applications', path: '/applications', heading: 'Applications' }
];
let server;
let browser;
const report = { viewport: { width: 320, height: 844 }, routes: [], note: 'Selectors and geometry only; no page text or user data recorded.' };

try {
  await initDb();
  await query('DELETE FROM otp_challenges WHERE email=:email', { email });
  await query('DELETE FROM otp_email_locks WHERE email=:email', { email });
  server = createServer(createApp());
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(3005, '127.0.0.1', resolve);
  });
  await mkdir('test-results/showcase', { recursive: true });
  browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox', '--js-flags=--max-old-space-size=256']
  });
  const context = await browser.newContext({ viewport: { width: 320, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => report.pageErrors ??= [error.message]);

  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Student', exact: true }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByLabel('6-digit verification code').waitFor();
  const message = getCapturedMail().filter(item => item.to === email).at(-1);
  assert(message, 'Controlled test OTP was not captured in memory');
  await page.getByLabel('6-digit verification code').fill(message.code);
  clearCapturedMail();
  await page.getByRole('button', { name: 'Verify and continue' }).click();
  await page.waitForURL(`${base}/`);
  await page.getByRole('heading', { name: routes[0].heading }).first().waitFor();

  for (const route of routes) {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`${base}${route.path}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: route.heading }).first().waitFor();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.getByRole('heading', { name: route.heading }).first().waitFor({ state: 'visible' });
    const geometry = await page.evaluate(() => {
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const selector = element => {
        const classes = typeof element.className === 'string' ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 4).join('.') : '';
        return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${classes ? `.${classes}` : ''}`;
      };
      const metrics = (element, viewportWidth) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const parent = element.parentElement;
        const parentRect = parent?.getBoundingClientRect();
        return {
          selector: selector(element),
          rect: { left: Math.round(rect.left * 10) / 10, right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10 },
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          parent: parent ? { selector: selector(parent), width: Math.round(parentRect.width * 10) / 10, clientWidth: parent.clientWidth } : null,
          css: { minWidth: style.minWidth, width: style.width, maxWidth: style.maxWidth, flex: style.flex, flexBasis: style.flexBasis, gridTemplateColumns: style.gridTemplateColumns, whiteSpace: style.whiteSpace, position: style.position, overflowX: style.overflowX }
        };
      };
      const main = document.querySelector('main');
      const viewportWidth = Math.round((visualViewport?.width ?? innerWidth) * 10) / 10;
      const rootCandidates = [document.documentElement, document.body, main, ...document.querySelectorAll('header, nav')].filter(Boolean);
      const elements = [...(main ?? document.body).querySelectorAll('*')].filter(visible);
      const candidates = [...new Set([...rootCandidates, ...elements])]
        .map(element => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ element, rect }) => rect.right > viewportWidth + 1 || (element.scrollWidth > element.clientWidth + 1 && element.matches('html,body,main,header,nav,[class*="toolbar"],[class*="heading"]')))
        .filter(({ element }) => {
          const style = getComputedStyle(element);
          return !(element.closest('table') || element.closest('[data-radix-portal]') || style.position === 'fixed' && (element.matches('aside,[role="dialog"]') || style.left === 'auto'));
        })
        .map(({ element }) => ({ ...metrics(element, viewportWidth), overflowBy: Math.round(Math.max(element.getBoundingClientRect().right - viewportWidth, element.scrollWidth - element.clientWidth) * 10) / 10 }))
        .sort((a, b) => b.overflowBy - a.overflowBy)
        .slice(0, 15);
      return {
        viewportWidth,
        layoutViewportWidth: innerWidth,
        document: { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
        body: { clientWidth: document.body.clientWidth, scrollWidth: document.body.scrollWidth },
        main: main ? { clientWidth: main.clientWidth, scrollWidth: main.scrollWidth, rectWidth: Math.round(main.getBoundingClientRect().width * 10) / 10 } : null,
        candidates
      };
    });
    const entry = { name: route.name, path: route.path, ...geometry, screenshot: `test-results/showcase/mobile320-${route.name}.png` };
    report.routes.push(entry);
    await page.screenshot({ path: entry.screenshot, fullPage: false });
    console.log(JSON.stringify({ route: route.path, widths: { viewport: geometry.viewportWidth, document: geometry.document.scrollWidth, body: geometry.body.scrollWidth, main: geometry.main?.scrollWidth }, candidates: geometry.candidates.slice(0, 5) }));
  }
  await writeFile('test-results/showcase/mobile320-diagnostics.json', `${JSON.stringify(report, null, 2)}\n`);
} finally {
  clearCapturedMail();
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(() => resolve()));
  await closeDb().catch(() => {});
}
