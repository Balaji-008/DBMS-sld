// Editable five-slide Amrita Placement Portal showcase. Run only after QA freeze and render-slot approval.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pptxgen from 'pptxgenjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
const out = path.join(__dirname, 'amrita-placement-portal-showcase.pptx');
const logo = path.join(root, 'client/public/brand/amrita-logo-trimmed.png');
const capture = path.join(root, 'test-results/showcase/dashboard-mobile.png');
const applyCapture = path.join(root, 'test-results/showcase/apply-mobile.png');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Amrita Bengaluru DBMS project';
pptx.subject = 'Amrita Bengaluru placements portal and Oracle DBMS implementation';
pptx.title = 'Placements, connected. — Amrita Placement Portal';
pptx.company = 'Amrita Bengaluru';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'en-IN'
};
pptx.defineSlideMaster({
  title: 'LIGHT', background: { color: content.palette.ivory },
  objects: [
    { rect: { x: 0.55, y: 7.12, w: 12.23, h: 0.015, line: { color: 'D8CFC2', transparency: 100 }, fill: { color: 'D8CFC2' } } },
    { text: { text: 'AMRITA PLACEMENT PORTAL  /  BENGALURU CAMPUS', options: { x: 0.58, y: 7.18, w: 8.6, h: 0.16, fontFace: 'Aptos', fontSize: 8, color: content.palette.muted, charSpacing: 0.8, margin: 0 } } }
  ],
  slideNumber: { x: 12.25, y: 7.15, color: content.palette.muted, fontFace: 'Aptos', fontSize: 9 }
});
const C = content.palette;
const shape = (slide, type, x, y, w, h, fill, line = fill, opts = {}) => slide.addShape(type, {
  x, y, w, h, rectRadius: 0.12,
  fill: { color: fill }, line: { color: line, transparency: line === fill ? 100 : 0, width: 1 }, ...opts
});
const txt = (slide, text, x, y, w, h, size, color = C.ink, opts = {}) => slide.addText(text, {
  x, y, w, h, fontFace: 'Aptos', fontSize: size, color,
  margin: 0, breakLine: false, valign: 'mid', fit: 'shrink',
  paraSpaceAfterPt: 0, ...opts
});
const heading = (slide, kicker, title, sub = '') => {
  txt(slide, kicker.toUpperCase(), 0.65, 0.40, 10.9, 0.24, 9, C.wine, { bold: true, charSpacing: 1.8 });
  txt(slide, title, 0.65, 0.76, 11.95, 0.58, 27, C.ink, { bold: true, fontFace: 'Aptos Display' });
  if (sub) txt(slide, sub, 0.66, 1.40, 11.8, 0.38, 12, C.muted);
};
const box = (slide, x, y, w, h, fill = C.white, line = 'E3DACE') => {
  shape(slide, pptx.ShapeType.roundRect, x, y, w, h, fill, line, { radius: 0.12, line: { color: line, width: 0.8 } });
};
const sourceNote = (slide, label) => txt(slide, label, 0.66, 6.84, 11.8, 0.18, 8.2, C.muted, { italic: true });
const pngSize = file => {
  const b = fs.readFileSync(file);
  if (b.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error(`Expected PNG capture: ${file}`);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};
const addPngContain = (slide, file, x, y, w, h, altText) => {
  const d = pngSize(file);
  const scale = Math.min(w / d.w, h / d.h);
  const iw = d.w * scale;
  const ih = d.h * scale;
  slide.addImage({ path: file, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, altText });
};

// 1 — Product framing; screenshot is supplied only after the QA lane freezes fresh capture.
{
  const s = pptx.addSlide();
  s.background = { color: C.wineDeep };
  shape(s, pptx.ShapeType.ellipse, 8.30, -1.3, 6.0, 6.0, C.wine, C.wine, { fill: { color: C.wine, transparency: 25 } });
  shape(s, pptx.ShapeType.ellipse, 9.2, 4.5, 4.7, 4.7, '512033', '512033', { fill: { color: '512033', transparency: 20 } });
  if (fs.existsSync(logo)) s.addImage({ path: logo, x: 0.72, y: 0.55, w: 2.15, h: 0.48, altText: 'Amrita Bengaluru campus logo' });
  txt(s, 'PLACEMENT WORK,\nIN ONE PORTAL.', 0.78, 1.82, 6.2, 1.62, 34, C.ivory, { bold: true, fontFace: 'Aptos Display', breakLine: false, valign: 'mid', lineSpacingMultiple: 0.92 });
  txt(s, 'Amrita Placement Portal · Bengaluru Campus', 0.82, 3.72, 5.7, 0.34, 17, 'E9D8B8', { bold: true });
  txt(s, 'Student, recruiter and placement-team workflows\nconnected to one Oracle-backed system.', 0.82, 4.30, 5.35, 0.74, 15, C.ivory, { breakLine: false, valign: 'top' });
  // A wine frame makes the supplied white wordmark and live UI image coherent.
  shape(s, pptx.ShapeType.roundRect, 8.00, 0.95, 3.10, 5.82, '5A2035', 'A77F63', { radius: 0.16, line: { color: 'A77F63', width: 1.2 } });
  if (fs.existsSync(capture)) {
    addPngContain(s, capture, 8.20, 1.16, 2.70, 5.08, 'Synthetic student dashboard screenshot');
    txt(s, 'Synthetic Demo Student · QA capture', 8.08, 6.34, 2.94, 0.16, 8, 'F1E3CF', { align: 'center' });
  } else {
    shape(s, pptx.ShapeType.roundRect, 8.21, 1.16, 2.68, 5.08, 'F6F0E5', 'F6F0E5', { radius: 0.10 });
    txt(s, 'MOBILE PRODUCT\nCAPTURE', 8.38, 2.62, 2.34, 0.76, 14, C.wine, { align: 'center', bold: true, charSpacing: 1.0 });
    txt(s, 'QA capture unavailable', 8.36, 3.60, 2.40, 0.40, 10, C.muted, { align: 'center' });
    txt(s, 'Capture unavailable', 8.10, 6.34, 2.90, 0.16, 8.5, 'F1E3CF', { align: 'center', italic: true });
  }
  txt(s, 'DBMS VIVA  /  PRODUCT + IMPLEMENTATION', 0.82, 6.76, 6.6, 0.2, 8.7, 'D7C3A2', { charSpacing: 1.3 });
  s.addNotes('Product framing. Replace the labeled capture placeholder only with the fresh QA-frozen screenshot at test-results/showcase/dashboard-mobile.png. The supplied Amrita logo is used without recoloring.');
}

// 2 — Architecture drawn as native shapes for editing in PowerPoint.
{
  const s = pptx.addSlide('LIGHT');
  heading(s, '01 / Architecture', 'One request path. Clear boundaries.', 'The portal UI, API and Oracle remain distinct; email and SQL Workshop sit on separate paths.');
  const xs = [0.72, 3.75, 6.78, 9.81];
  const fills = [C.wine, '7A5543', 'A87E50', '435A50'];
  content.architecture.forEach((item, i) => {
    box(s, xs[i], 2.23, 2.62, 1.46, fills[i], fills[i]);
    txt(s, String(i + 1).padStart(2, '0'), xs[i] + 0.18, 2.39, 0.42, 0.20, 9, 'E9D8B8', { bold: true, charSpacing: 1 });
    txt(s, item.title, xs[i] + 0.18, 2.73, 2.26, 0.33, 15, C.white, { bold: true });
    txt(s, item.detail, xs[i] + 0.18, 3.14, 2.25, 0.38, 10, C.white, { valign: 'top', breakLine: false });
    if (i < xs.length - 1) {
      s.addShape(pptx.ShapeType.chevron, { x: xs[i] + 2.69, y: 2.78, w: 0.28, h: 0.32, fill: { color: C.gold }, line: { color: C.gold, transparency: 100 } });
    }
  });
  box(s, 1.12, 4.40, 4.75, 1.28, 'FBF8F2', 'E5DCCE');
  txt(s, 'GMAIL SMTP', 1.38, 4.63, 1.55, 0.24, 11, C.wine, { bold: true, charSpacing: 0.8 });
  txt(s, 'Carries OTP messages. Oracle keeps challenge and session state.', 2.95, 4.57, 2.60, 0.62, 11, C.ink, { valign: 'mid' });
  box(s, 6.36, 4.40, 5.76, 1.28, 'FBF8F2', 'E5DCCE');
  txt(s, 'APEX SQL WORKSHOP', 6.63, 4.63, 2.16, 0.24, 11, C.wine, { bold: true, charSpacing: 0.6 });
  txt(s, 'Read-only business-table inspection examples for the viva.', 8.82, 4.57, 2.92, 0.62, 11, C.ink, { valign: 'mid' });
  // Dotted native connectors distinguish these auxiliary paths from record flow.
  s.addShape(pptx.ShapeType.line, { x: 8.05, y: 3.75, w: -3.25, h: 0.55, line: { color: C.gold, width: 1.3, dash: 'dash', beginArrowType: 'none', endArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 11.10, y: 3.76, w: -1.40, h: 0.53, line: { color: C.sage, width: 1.3, dash: 'dash', beginArrowType: 'none', endArrowType: 'triangle' } });
  sourceNote(s, 'Source: README.md · docs/team-viva/DBMS-WALKTHROUGH.md · server/src/ · cloudflare/');
  s.addNotes('Architecture source: React/TypeScript client, Express API with bind variables, Oracle FREEPDB1, Cloudflare Worker and private tunnel. Gmail is mail transport only. APEX examples use read-only business-table access.');
}

// 3 — Relational model, integrity and transaction example.
{
  const s = pptx.addSlide('LIGHT');
  heading(s, '02 / Database design', 'The ER model becomes working relations.', 'Keys and constraints protect the workflow while API joins shape the views.');
  box(s, 0.70, 2.05, 2.24, 2.22, C.wine, C.wine);
  txt(s, `${content.dbms.tableCount} TABLES`, 0.92, 2.42, 1.82, 0.52, 25, C.white, { bold: true, align: 'center', fontFace: 'Aptos Display' });
  txt(s, `${content.dbms.tableCountTag} · counted from\nCREATE TABLE in schema DDL`, 0.91, 3.10, 1.84, 0.50, 9.4, 'F0E4D0', { align: 'center' });
  const rels = content.dbms.groups.map((g, i) => ({
    x: 3.12 + i * 2.38,
    y: 2.05,
    title: g.title,
    rows: g.tables.join('\n')
  }));
  rels.forEach((r, i) => {
    box(s, r.x, r.y, 2.18, 2.22, C.white, 'E4DACD');
    const accent = [C.wine, 'A87E50', C.sage, '7A5543'][i];
    shape(s, pptx.ShapeType.rect, r.x, r.y, 2.18, 0.12, accent, accent);
    txt(s, r.title, r.x + 0.13, r.y + 0.30, 1.92, 0.25, 10, C.wine, { bold: true, charSpacing: 0.8 });
    txt(s, r.rows, r.x + 0.13, r.y + 0.69, 1.94, 1.37, 8.2, C.ink, { bold: true, breakLine: false, valign: 'top', lineSpacingMultiple: 0.97 });
  });
  txt(s, content.dbms.normalization, 0.76, 4.68, 3.95, 0.91, 10.2, C.ink, { valign: 'top', breakLine: false });
  box(s, 4.90, 4.55, 7.30, 1.54, 'FBF8F2', 'E4DACD');
  txt(s, 'INTEGRITY + SQL + TRANSACTIONS', 5.16, 4.73, 6.78, 0.24, 9.6, C.wine, { bold: true, charSpacing: 0.7 });
  txt(s, 'PK / FK / UNIQUE / CHECK protect links, participation and valid values.\nJOIN: Applications → Students → Opportunities → Companies · GROUP BY status · COUNT(*)\nProfile + student + phone replacement commits or rolls back together in the API.', 5.16, 5.06, 6.77, 0.79, 9.2, C.ink, { breakLine: false, valign: 'top', lineSpacingMultiple: 0.98 });
  sourceNote(s, 'Count method: `rg -c "CREATE TABLE" database/001_schema.sql` → 18 [DERIVED]. Source: database/001_schema.sql · database/SCHEMA.md · server/src/db.ts');
  s.addNotes('The displayed table total is derived by counting CREATE TABLE occurrences in database/001_schema.sql. Relationship map is selective, not the entire ER diagram. Opportunity requirements use normalized child relations plus JSON serialization mirrors; placement rows retain a requirements snapshot. Transactions are in the API, not stored procedures.');
}

// 4 — Workflow evidence, with current capture slot reserved for QA.
{
  const s = pptx.addSlide('LIGHT');
  heading(s, '03 / Mobile workflows', 'From opportunity to outcome.', 'The same Oracle-backed workflow supports students, recruiters and the placement team.');
  const flow = [
    ['01', 'Student', 'Profile → eligible opportunity → application'],
    ['02', 'Recruiter', 'Company opportunity → application stage'],
    ['03', 'Placement team', 'Approval → outcomes and reports'],
    ['04', 'Student team', 'Hackathon registration → team list']
  ];
  flow.forEach((it, i) => {
    const y = 2.05 + i * 0.89;
    shape(s, pptx.ShapeType.ellipse, 0.82, y + 0.02, 0.42, 0.42, i === 0 ? C.wine : 'E9DED0', i === 0 ? C.wine : 'E9DED0');
    txt(s, it[0], 0.82, y + 0.12, 0.42, 0.15, 9, i === 0 ? C.white : C.wine, { bold: true, align: 'center' });
    txt(s, it[1], 1.45, y, 1.78, 0.28, 13, C.wine, { bold: true });
    txt(s, it[2], 1.45, y + 0.35, 4.45, 0.35, 11, C.ink);
  });
  box(s, 7.95, 2.00, 2.55, 3.90, 'F0E8DC', 'E1D3C2');
  if (fs.existsSync(applyCapture)) {
    addPngContain(s, applyCapture, 8.10, 2.18, 2.24, 3.50, 'Student application workflow screenshot');
    txt(s, 'Synthetic Demo Student · apply flow', 7.86, 5.71, 2.72, 0.16, 7.8, C.muted, { align: 'center' });
  } else {
    txt(s, 'FRESH MOBILE\nCAPTURE SLOT', 8.11, 3.00, 2.25, 0.72, 13, C.wine, { bold: true, align: 'center', charSpacing: 1.0 });
    txt(s, 'QA all-role matrix pending', 8.10, 4.02, 2.24, 0.50, 9, C.muted, { align: 'center' });
  }
  const qaLabels = { brand: 'brand', 'shell/navigation': 'shell', 'three-role functional/mobile': 'flows', 'public landing + Login privacy': 'device + privacy' };
  const qaSummary = `QA counts [MEASURED]: ${content.qa.gates.map(g => `${g.checks} ${qaLabels[g.label] || g.label}`).join(' · ')}`;
  txt(s, qaSummary, 0.82, 5.63, 6.30, 0.24, 8.1, C.wine, { bold: true });
  txt(s, 'Layout [MEASURED]: 12 CSS widths; 200% text-size emulation at four widths. Browser checks cover exercised journeys, not every validation case.', 0.82, 5.94, 6.32, 0.43, 8.1, C.muted, { valign: 'top', breakLine: false });
  sourceNote(s, 'QA [MEASURED]: public-device-results.json · public-qa-followup.md');
  s.addNotes('Current public-source follow-up: docs/showcase/public-device-results.json was generated at 2026-11-10T19:02:33.937Z for public checkout revision 3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf with frozen Login/Profile privacy-copy edits uncommitted during QA. It passed 20 browser checks [MEASURED]: 19 landing route/layout/motion checks plus one Login privacy-dialog assertion. The landing portion covers 12 CSS viewport widths, computed-font-size emulation at 200% at four widths, screenshot capture, and reduced-motion behavior. The targeted exact-copy assertion applies to Login; Profile was included in the build and source-hash set only. The mobile gates passed typecheck, build, 29 brand/landing, 35 shell/navigation and 43 three-role functional browser checks [MEASURED]. Earlier app gates recorded 87 Oracle integration and 14 email/MIME checks [MEASURED] before the public Login/Profile copy follow-up; they were not rerun by this follow-up. These are automated checks, not performance benchmarks, exhaustive authorization coverage, or institutional placement statistics. Browser emulation is not physical-device certification; 200% text checks are not browser-chrome zoom. Mail used in-process JSON capture, no external email was sent. Reports-screen aggregate values have unverified provenance and are excluded. Sources: docs/showcase/public-device-results.json, tools/egm/public-release/public-qa-followup.md, and .superpowers/sdd/public-release/qa-publish-report.md.');
}

// 5 — DBMS validation and demo close.
{
  const s = pptx.addSlide();
  s.background = { color: C.wineDeep };
  if (logo) s.addImage({ path: logo, x: 0.72, y: 0.45, w: 1.82, h: 0.40, altText: 'Amrita Bengaluru campus logo' });
  txt(s, 'VALIDATE THE MODEL. TRACE THE WORKFLOW.', 0.72, 1.02, 11.9, 0.49, 25, C.ivory, { bold: true, fontFace: 'Aptos Display' });
  txt(s, 'Follow one record through relational rules, SQL and an atomic API operation.', 0.73, 1.62, 11.8, 0.30, 11, 'E9D8B8');
  const checks = [
    { x: 0.75, title: 'INTEGRITY', body: 'Primary and foreign keys connect the student, opportunity and application records. UNIQUE and CHECK rules reject invalid combinations.' },
    { x: 4.82, title: 'QUERY', body: 'Join applications to students, opportunities and companies. Group by status to explain a report result.' },
    { x: 8.89, title: 'TRANSACTION', body: 'A profile update changes related user, student and phone rows together—or rolls the operation back.' }
  ];
  const colors = ['5C263B', '554333', '354A41'];
  checks.forEach((item, i) => {
    box(s, item.x, 2.28, 3.68, 2.46, colors[i], colors[i]);
    txt(s, `0${i + 1}`, item.x + 0.23, 2.54, 0.42, 0.20, 9, 'E6D3B5', { bold: true, charSpacing: 1 });
    txt(s, item.title, item.x + 0.23, 2.96, 3.18, 0.26, 13, 'E8C98F', { bold: true, charSpacing: 0.8 });
    txt(s, item.body, item.x + 0.23, 3.42, 3.20, 0.98, 11, C.ivory, { valign: 'top', breakLine: false });
  });
  txt(s, 'DEMO PATH', 0.78, 5.40, 1.20, 0.20, 9, 'E8C98F', { bold: true, charSpacing: 1.4 });
  txt(s, 'student application → recruiter stage update → APEX read-only query → team handoff', 2.02, 5.34, 10.15, 0.30, 11, C.ivory);
  txt(s, 'Use synthetic demo records. APEX is for read-only inspection; application writes go through the API.', 0.79, 5.86, 11.7, 0.32, 9.4, 'E9D8B8');
  txt(s, 'DBMS VIVA  /  AMRITA PLACEMENT PORTAL', 0.78, 6.82, 6.8, 0.18, 8.5, 'D7C3A2', { charSpacing: 1.2 });
  txt(s, '5', 12.22, 6.82, 0.24, 0.18, 9, 'D7C3A2', { align: 'right' });
  s.addNotes('Close by tracing one application from the student action to the recruiter update, then inspect the resulting business rows with a read-only APEX query. Explain which constraint protects the relationship and where the API transaction groups related writes. Use synthetic demo records and state that the walkthrough covers selected flows rather than every validation case.');
}

await pptx.writeFile({ fileName: out });
