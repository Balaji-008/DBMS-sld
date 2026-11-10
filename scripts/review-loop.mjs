#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, statfsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resultRoot = resolve(root, 'test-results/review-loop');
const MAX_LOG_BYTES = 256 * 1024;
const REPAIR_LIMIT = 3;

const commonInputs = ['package.json', 'package-lock.json', 'node_modules/.package-lock.json', 'client', 'server', 'shared', 'database'];
const gates = {
  typecheck: {
    title: 'TypeScript typecheck', command: ['npm', 'run', 'typecheck'], timeoutMs: 180_000,
    memoryMiB: 768, cpuCount: 2, inputs: [...commonInputs, 'tsconfig.json'], resume: 'source',
  },
  build: {
    title: 'Production build', command: ['npm', 'run', 'build'], timeoutMs: 300_000,
    memoryMiB: 1536, cpuCount: 2, inputs: [...commonInputs, 'tsconfig.json'], resume: 'source',
  },
  integration: {
    title: 'Oracle integration checks', command: ['npm', 'run', 'test:integration'], timeoutMs: 300_000,
    memoryMiB: 2048, cpuCount: 2, inputs: [...commonInputs, 'tests/integration.ts'], resume: 'never',
  },
  'brand-email': {
    title: 'Branded OTP email and local MIME checks', command: ['npm', 'run', 'test:brand-email'], timeoutMs: 90_000,
    memoryMiB: 768, cpuCount: 1, inputs: ['package.json', 'package-lock.json', 'node_modules/.package-lock.json', 'server/src/email-template.ts', 'tests/brand-email.ts', 'client/public/brand'], resume: 'never',
  },
  'brand-browser': {
    title: 'Brand and landing browser checks', command: ['./node_modules/.bin/tsx', 'tests/brand-browser.ts'], timeoutMs: 180_000,
    memoryMiB: 2048, cpuCount: 2, inputs: ['client', 'server', 'shared', 'database', 'tests', 'test-results/amrita-email-preview.html'], resume: 'never',
  },
  'shell-browser': {
    title: 'Navigation and mobile shell browser checks', command: ['./node_modules/.bin/tsx', 'tests/browser.ts'], timeoutMs: 180_000,
    memoryMiB: 2048, cpuCount: 2, inputs: ['client', 'server', 'shared', 'database', 'tests'], resume: 'never',
  },
  'functional-browser': {
    title: 'Three-role mobile functional browser checks', command: ['./node_modules/.bin/tsx', 'tests/functional-browser.ts'], timeoutMs: 300_000,
    memoryMiB: 2560, cpuCount: 2, inputs: ['client', 'server', 'shared', 'database', 'tests'], resume: 'never',
  },
  'public-health': {
    title: 'Deployed public API health', kind: 'public-health', command: ['GET', 'https://dbms.sld.parswanadh.dev/api/health'], timeoutMs: 15_000,
    memoryMiB: 128, cpuCount: 1, inputs: [], resume: 'never',
  },
  'release-artifacts': {
    title: 'Showcase release artifact inventory', kind: 'release-artifacts', command: ['check', 'fixed showcase release files'], timeoutMs: 15_000,
    memoryMiB: 128, cpuCount: 1, inputs: [], resume: 'never',
  },
};
const tasks = {
  app: ['typecheck', 'build', 'integration', 'brand-email'],
  mobile: ['typecheck', 'build', 'brand-browser', 'shell-browser', 'functional-browser'],
  release: ['public-health', 'release-artifacts'],
};
const releaseArtifacts = [
  { path: 'test-results/showcase/landing-mobile.png', signature: 'png' },
  { path: 'test-results/showcase/login-mobile.png', signature: 'png' },
  { path: 'test-results/showcase/dashboard-mobile.png', signature: 'png' },
  { path: '.superpowers/sdd/mobile-showcase/qa-report.md', signature: 'text' },
  { path: 'deliverables/presentation/amrita-placement-portal-showcase.pptx', signature: 'zip' },
  { path: 'deliverables/presentation/amrita-placement-portal-showcase.pdf', signature: 'pdf' },
  { path: 'deliverables/video/amrita-placement-portal-showcase.mp4', signature: 'mp4' },
  { path: 'deliverables/video/amrita-placement-portal-showcase-poster.jpg', signature: 'jpg' },
];

function usage() {
  console.log(`Usage: node scripts/review-loop.mjs --task <app|mobile|release> [--resume] [--dry-run]\n       node scripts/review-loop.mjs --list\n       node scripts/review-loop.mjs --self-check\n       node scripts/review-loop.mjs --media-preflight --expected-working-gib <positive-number>\n\nRuns a fixed, sequential gate list. No command or task data is evaluated as shell input.`);
}

function parseArgs(args) {
  const result = { task: null, resume: false, dryRun: false, list: false, selfCheck: false, mediaPreflight: false, expectedWorkingGiB: null, help: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--task') result.task = args[++i] ?? null;
    else if (arg === '--resume') result.resume = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--list') result.list = true;
    else if (arg === '--self-check') result.selfCheck = true;
    else if (arg === '--media-preflight') result.mediaPreflight = true;
    else if (arg === '--expected-working-gib') {
      const value = Number(args[++i]);
      if (!Number.isFinite(value) || value <= 0 || value > 1000) throw new Error('--expected-working-gib must be a positive number no larger than 1000.');
      result.expectedWorkingGiB = value;
    }
    else if (arg === '--help' || arg === '-h') result.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return result;
}

function isExcluded(rel) {
  const parts = rel.split(sep);
  return parts.some((part) => part === 'node_modules' || part === '.git' || part === 'test-results' || part === 'dist' || part === 'coverage')
    || parts.some((part) => part.startsWith('.env'));
}

async function listFiles(input) {
  const absolute = resolve(root, input);
  if (!absolute.startsWith(`${root}${sep}`) && absolute !== root) throw new Error(`Input escaped repository: ${input}`);
  let info;
  try { info = await stat(absolute); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  if (info.isFile()) {
    const rel = relative(root, absolute);
    if (rel === 'test-results/amrita-email-preview.html') return [rel];
    return isExcluded(rel) ? [] : [rel];
  }
  if (!info.isDirectory()) return [];
  const found = [];
  async function visit(dir) {
    const children = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      const childPath = resolve(dir, child.name);
      const rel = relative(root, childPath);
      if (isExcluded(rel)) continue;
      if (child.isDirectory()) await visit(childPath);
      else if (child.isFile()) found.push(rel);
    }
  }
  await visit(absolute);
  return found;
}

async function inputHash(gate) {
  const files = new Set();
  for (const input of gate.inputs) for (const file of await listFiles(input)) files.add(file);
  const sorted = [...files].sort();
  const hash = createHash('sha256');
  const npmVersion = spawnSync('npm', ['--version'], { encoding: 'utf8', timeout: 1000 }).stdout?.trim() || 'unavailable';
  hash.update(`node=${process.version}\nnpm=${npmVersion}\n`);
  for (const file of sorted) {
    hash.update(file).update('\0');
    await new Promise((resolvePromise, reject) => {
      const stream = createReadStream(resolve(root, file));
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('error', reject);
      stream.on('end', resolvePromise);
    });
    hash.update('\0');
  }
  return { hash: hash.digest('hex'), files: sorted };
}

function redact(text) {
  return text
    .replace(/\b([\w.+-]+)@([\w.-]+\.[A-Za-z]{2,})\b/g, '[email]')
    .replace(/\b(authorization|cookie|set-cookie|password|passwd|secret|token|otp|verification code)\b(["']?\s*[:=]\s*)(["'])([\s\S]{0,256}?)\3/gi, '$1$2[redacted]')
    .replace(/\b(authorization|cookie|set-cookie|password|passwd|secret|token|otp|verification code)\b(["']?\s*[:=]\s*)([^\s,;}"']{1,256})/gi, '$1$2[redacted]')
    .replace(/\b\d{6}\b/g, '[six-digit-code]')
    .replace(/\b(?:sk|ghp|gho|github_pat|xox[baprs])-[-A-Za-z0-9_]{12,}\b/gi, '[credential]');
}

function safeTail(text, limit = 5000) {
  const clean = redact(text);
  return clean.length > limit ? `[tail clipped]\n${clean.slice(-limit)}` : clean;
}

function availableCpuList() {
  try {
    const status = spawnSync('sh', ['-c', "awk '/Cpus_allowed_list/ {print $2}' /proc/self/status"], { encoding: 'utf8', timeout: 1000 });
    const value = status.stdout.trim();
    const ids = [];
    for (const range of value.split(',')) {
      const [from, to = from] = range.split('-').map(Number);
      if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
      for (let id = from; id <= to && ids.length < 2; id += 1) ids.push(id);
      if (ids.length >= 2) break;
    }
    return ids;
  } catch { return []; }
}

function commandFor(gate) {
  const command = [...gate.command];
  const affinity = availableCpuList();
  if (process.platform === 'linux' && affinity.length && spawnSync('taskset', ['-c', affinity.join(','), 'true'], { stdio: 'ignore', timeout: 1000 }).status === 0) {
    return { command: 'taskset', args: ['-c', affinity.join(','), ...command], caps: { cpuAffinity: affinity } };
  }
  return { command: command.shift(), args: command, caps: { cpuAffinity: null } };
}

async function runChild(gate, logPath) {
  if (gate.kind === 'public-health') {
    const started = Date.now();
    try {
      const response = await fetch(gate.command[1], { signal: AbortSignal.timeout(gate.timeoutMs) });
      let health;
      try { health = await response.json(); } catch { health = null; }
      const passed = response.ok && health?.database === 'connected';
      const summary = `HTTP ${response.status}; JSON=${health && typeof health === 'object' ? 'valid' : 'invalid'}; database=${health?.database === 'connected' ? 'connected' : 'not-connected'}; elapsed=${Date.now() - started}ms\n`;
      await writeFile(logPath, summary);
      return { code: passed ? 0 : 1, signal: null, error: null, timedOut: false, caps: { timeoutMs: gate.timeoutMs, memoryMiB: gate.memoryMiB, cpuCount: gate.cpuCount, cgroupMemory: 'not-applicable (short fetch)', cpuQuota: 'not-applicable' }, logPath: relative(root, logPath) };
    } catch (error) {
      const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
      await writeFile(logPath, `${timedOut ? 'health request timed out' : `health request failed: ${error.name}`}\n`);
      return { code: null, signal: null, error: error.name, timedOut, caps: { timeoutMs: gate.timeoutMs, memoryMiB: gate.memoryMiB, cpuCount: gate.cpuCount, cgroupMemory: 'not-applicable (short fetch)', cpuQuota: 'not-applicable' }, logPath: relative(root, logPath) };
    }
  }
  if (gate.kind === 'release-artifacts') {
    const problems = [];
    const checked = [];
    const signatures = {
      png: (bytes) => bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      zip: (bytes) => bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
      pdf: (bytes) => bytes.subarray(0, 5).toString('ascii') === '%PDF-',
      mp4: (bytes) => bytes.subarray(4, 8).toString('ascii') === 'ftyp',
      jpg: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
      text: (bytes) => bytes.length > 0,
    };
    for (const artifact of releaseArtifacts) {
      try {
        const absolute = resolve(root, artifact.path);
        const rel = relative(root, absolute);
        if (rel.startsWith(`..${sep}`) || rel === '..') throw new Error('path escapes repository');
        const info = await stat(absolute);
        if (!info.isFile() || info.size === 0) throw new Error('not a non-empty regular file');
        const header = await new Promise((resolvePromise, reject) => {
          const chunks = [];
          const stream = createReadStream(absolute, { start: 0, end: 15 });
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolvePromise(Buffer.concat(chunks)));
        });
        if (!signatures[artifact.signature](header)) throw new Error(`invalid ${artifact.signature} file signature`);
        checked.push({ path: artifact.path, bytes: info.size });
      } catch (error) { problems.push(`${artifact.path}: ${error.message}`); }
    }
    const report = problems.length
      ? `ARTIFACT CHECK FAIL (${problems.length}/${releaseArtifacts.length} missing or invalid)\n${problems.join('\n')}\n`
      : `ARTIFACT CHECK PASS (${checked.length} fixed release files; sizes in bytes)\n${checked.map((item) => `${item.path}: ${item.bytes}`).join('\n')}\n`;
    await writeFile(logPath, report);
    return { code: problems.length ? 1 : 0, signal: null, error: null, timedOut: false, caps: { timeoutMs: gate.timeoutMs, memoryMiB: gate.memoryMiB, cpuCount: gate.cpuCount, cgroupMemory: 'not-applicable (small file checks)', cpuQuota: 'not-applicable' }, logPath: relative(root, logPath) };
  }
  const wrapped = commandFor(gate);
  const hasSystemdRun = process.platform === 'linux' && spawnSync('systemd-run', ['--version'], { stdio: 'ignore', timeout: 1000 }).status === 0;
  const unitName = `placement-review-loop-${process.pid}-${randomUUID().slice(0, 8)}`;
  const childCommand = hasSystemdRun
    ? ['systemd-run', '--user', '--scope', '--collect', '--quiet', `--unit=${unitName}`, `--property=MemoryMax=${gate.memoryMiB}M`, '--property=MemorySwapMax=0', `--property=CPUQuota=${gate.cpuCount * 100}%`, '--', wrapped.command, ...wrapped.args]
    : [wrapped.command, ...wrapped.args];
  const caps = { ...wrapped.caps, nodeHeapMiB: gate.memoryMiB, cgroupMemory: hasSystemdRun ? `${gate.memoryMiB}MiB` : 'unavailable; Node heap cap only', cpuQuota: hasSystemdRun ? `${gate.cpuCount * 100}%` : 'unavailable', timeoutMs: gate.timeoutMs };
  const logChunks = [];
  let logBytes = 0;
  let truncated = false;
  const childEnv = { ...process.env, NODE_OPTIONS: `--max-old-space-size=${gate.memoryMiB}`, NO_COLOR: '1' };
  const child = spawn(childCommand[0], childCommand.slice(1), { cwd: root, env: childEnv, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  let timedOut = false;
  let settled = false;
  const append = (chunk) => {
    const value = Buffer.from(chunk);
    const remaining = MAX_LOG_BYTES - logBytes;
    if (remaining <= 0) { truncated = true; return; }
    const kept = value.subarray(0, remaining);
    logChunks.push(kept);
    logBytes += kept.length;
    if (value.length > remaining) truncated = true;
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  const timer = setTimeout(() => {
    timedOut = true;
    if (hasSystemdRun) spawnSync('systemctl', ['--user', 'stop', `${unitName}.scope`], { stdio: 'ignore', timeout: 6000 });
    try {
      if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
      else child.kill('SIGTERM');
    } catch { /* The process may have exited between the timeout and signal. */ }
    setTimeout(() => {
      if (!settled) {
        try {
          if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL');
          else child.kill('SIGKILL');
        } catch { /* Already exited. */ }
      }
    }, 5000).unref();
  }, gate.timeoutMs);
  const outcome = await new Promise((resolvePromise) => {
    child.on('error', (error) => resolvePromise({ code: null, signal: null, error: error.message }));
    child.on('close', (code, signal) => resolvePromise({ code, signal, error: null }));
  });
  settled = true;
  clearTimeout(timer);
  const log = redact(Buffer.concat(logChunks).toString('utf8'));
  await writeFile(logPath, `${safeTail(log, MAX_LOG_BYTES)}${truncated ? '\n[log capped at 256 KiB]\n' : ''}`);
  return { ...outcome, timedOut, caps, logPath: relative(root, logPath) };
}

async function loadPrevious(runDir) {
  try { return JSON.parse(await readFile(resolve(runDir, 'state.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function writeState(runDir, state) {
  await writeFile(resolve(runDir, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);
}

async function latestRun(taskName) {
  const taskDir = resolve(resultRoot, taskName);
  let entries;
  try { entries = await readdir(taskDir, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const runs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  return runs.length ? resolve(taskDir, runs.at(-1)) : null;
}

function failureExcerpt(state) {
  const failed = state.gates.findLast((gate) => gate.status === 'failed' || gate.status === 'timed-out');
  return failed ? { gate: failed.id, status: failed.status, log: failed.logPath, excerpt: failed.excerpt ?? '' } : null;
}

function canReuse(gate, prior, currentHash) {
  return gate.resume === 'source' && prior?.status === 'passed' && prior.inputHash === currentHash;
}

function mediaDiskCheck(availableGiB, expectedWorkingGiB) {
  const requiredGiB = 4 + expectedWorkingGiB;
  return { availableGiB, expectedWorkingGiB, reserveGiB: 4, requiredGiB, enough: availableGiB >= requiredGiB };
}

async function selfCheck() {
  if (Object.values(tasks).flat().some((id) => !gates[id])) throw new Error('Task references an unknown gate.');
  if (!tasks.app.includes('integration') || !tasks.app.includes('brand-email')) throw new Error('App task must retain the Oracle integration and branded email gates.');
  if (tasks.mobile.join(',') !== 'typecheck,build,brand-browser,shell-browser,functional-browser') throw new Error('Mobile gate order differs from the reviewed sequence.');
  for (const path of ['deliverables/presentation/amrita-placement-portal-showcase.pptx', 'deliverables/presentation/amrita-placement-portal-showcase.pdf', 'deliverables/video/amrita-placement-portal-showcase.mp4', 'deliverables/video/amrita-placement-portal-showcase-poster.jpg']) {
    if (!releaseArtifacts.some((artifact) => artifact.path === path)) throw new Error(`Release artifact path is missing: ${path}`);
  }
  for (const gate of Object.values(gates)) {
    if (!Array.isArray(gate.command) || gate.command.length < 2 || gate.command.some((part) => typeof part !== 'string' || part.startsWith('-'))) throw new Error(`Unsafe command definition: ${gate.title}`);
    if (gate.timeoutMs > 300_000 || gate.timeoutMs < 1000) throw new Error(`Gate has an invalid timeout: ${gate.title}`);
    if (!['source', 'never'].includes(gate.resume)) throw new Error(`Gate has an invalid resume policy: ${gate.title}`);
  }
  if (redact('otp=123456 alice@example.com token=abcdef password="two secret words"') !== 'otp=[redacted] [email] token=[redacted] password=[redacted]') throw new Error('Redaction self-check failed.');
  if (!canReuse(gates.typecheck, { status: 'passed', inputHash: 'same' }, 'same')) throw new Error('Unchanged passing static gate was not reusable.');
  if (canReuse(gates.typecheck, { status: 'passed', inputHash: 'old' }, 'new')) throw new Error('Changed static inputs incorrectly reused a passing gate.');
  if (canReuse(gates['brand-browser'], { status: 'passed', inputHash: 'same' }, 'same')) throw new Error('Runtime-dependent browser gate was incorrectly cacheable.');
  if (canReuse(gates['public-health'], { status: 'passed', inputHash: 'same' }, 'same') || canReuse(gates['release-artifacts'], { status: 'passed', inputHash: 'same' }, 'same')) throw new Error('Release health/artifact gates must be uncached.');
  if (!mediaDiskCheck(8, 4).enough || mediaDiskCheck(7.99, 4).enough) throw new Error('Media disk reserve calculation failed.');
  if (!isExcluded('.env') || !isExcluded('nested/.env.local') || isExcluded('client/src/App.tsx')) throw new Error('Input exclusion self-check failed.');
  if ((await listFiles('.env')).length !== 0) throw new Error('Root environment file must never enter the input list.');

  const probeDir = resolve(resultRoot, 'self-check', `${Date.now()}-${randomUUID().slice(0, 8)}`);
  await mkdir(probeDir, { recursive: true });
  const probe = (command, timeoutMs = 5000) => runChild({
    title: 'Runner wrapper self-check', command, timeoutMs, memoryMiB: 256, cpuCount: 1,
  }, resolve(probeDir, `probe-${randomUUID().slice(0, 6)}.log`));
  try {
    const noop = await probe([process.execPath, '-e', 'process.exit(0)']);
    if (noop.code !== 0 || noop.timedOut) throw new Error(`Guarded no-op did not pass (exit ${noop.code}).`);
    const nonzero = await probe([process.execPath, '-e', 'process.exit(7)']);
    if (nonzero.code !== 7 || nonzero.timedOut) throw new Error(`Guarded nonzero exit did not propagate (exit ${nonzero.code}).`);
    const timeoutStartedAt = Date.now();
    const timeout = await probe([process.execPath, '-e', 'setTimeout(() => {}, 30000)'], 400);
    const timeoutElapsedMs = Date.now() - timeoutStartedAt;
    if (!timeout.timedOut || timeoutElapsedMs > 12_000) throw new Error(`Guarded timeout was not bounded (${timeoutElapsedMs}ms).`);
    console.log(`WRAPPER SELF-CHECK PASS: noop exit=${noop.code}; requested exit=7 propagated as ${nonzero.code}; 400ms timeout stopped in ${timeoutElapsedMs}ms; systemd scope=${noop.caps.cgroupMemory}.`);
  } finally {
    await rm(probeDir, { recursive: true, force: true });
  }
  console.log(`SELF-CHECK PASS: ${Object.keys(gates).length} fixed gates, ${Object.keys(tasks).length} tasks, finite timeouts, redaction, secret-path exclusions, cache policy, and executed wrapper checks.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }
  if (!args.mediaPreflight && args.expectedWorkingGiB !== null) throw new Error('--expected-working-gib is only valid with --media-preflight.');
  if (args.mediaPreflight) {
    if (args.expectedWorkingGiB === null) throw new Error('--media-preflight requires --expected-working-gib.');
    const fs = statfsSync(root);
    const availableGiB = fs.bavail * fs.bsize / (1024 ** 3);
    const check = mediaDiskCheck(availableGiB, args.expectedWorkingGiB);
    console.log(JSON.stringify({ path: root, ...check }, null, 2));
    if (!check.enough) process.exitCode = 1;
    return;
  }
  if (args.list) {
    for (const [name, gateIds] of Object.entries(tasks)) console.log(`${name}: ${gateIds.map((id) => `${id} (${gates[id].timeoutMs / 1000}s, resume=${gates[id].resume})`).join(' -> ')}`);
    return;
  }
  if (args.selfCheck) { await selfCheck(); return; }
  if (!args.task || !tasks[args.task]) throw new Error('Choose an allowlisted task with --task app, --task mobile, or --task release.');

  let runDir;
  let previous = null;
  let repairIteration = 0;
  if (args.resume) {
    runDir = await latestRun(args.task);
    if (runDir) {
      previous = await loadPrevious(runDir);
      if (!previous) throw new Error(`No state.json in prior run: ${relative(root, runDir)}`);
      repairIteration = previous.repairIteration ?? 0;
      if (previous.status === 'failed' || previous.status === 'timed-out') repairIteration += 1;
      if (repairIteration > REPAIR_LIMIT) throw new Error(`Repair iteration limit (${REPAIR_LIMIT}) reached. Start a new run after recording a maintainer decision.`);
    } else {
      console.log(`No prior ${args.task} run exists; --resume is starting a fresh run (no gates will be marked passed).`);
    }
  }
  if (!runDir) {
    runDir = resolve(resultRoot, args.task, `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
    await mkdir(runDir, { recursive: true });
  }

  const state = previous ?? { schemaVersion: 1, task: args.task, runId: basename(runDir), gates: [], repairIteration: 0 };
  state.status = 'running';
  state.startedAt ??= new Date().toISOString();
  state.lastStartedAt = new Date().toISOString();
  state.repairIteration = repairIteration;
  state.gateOrder = tasks[args.task];
  if (!args.dryRun) {
    await mkdir(runDir, { recursive: true });
    await writeState(runDir, state);
  }

  for (const id of tasks[args.task]) {
    const gate = gates[id];
    const currentInput = await inputHash(gate);
    const old = state.gates.find((entry) => entry.id === id);
    if (args.resume && canReuse(gate, old, currentInput.hash)) {
      const reusedAt = new Date().toISOString();
      old.reuseHistory ??= [];
      old.reuseHistory.push({ reusedAt, sourceHash: currentInput.hash, originalCompletedAt: old.completedAt });
      if (!args.dryRun) await writeState(runDir, state);
      console.log(`REUSE ${id}: source hash unchanged (${currentInput.hash.slice(0, 12)}); original pass at ${old.completedAt}.`);
      continue;
    }
    if (args.dryRun) {
      console.log(`PLAN ${id}: ${gate.command.join(' ')}; timeout=${gate.timeoutMs}ms; heap<=${gate.memoryMiB}MiB; resume=${gate.resume}; inputs=${currentInput.files.length}`);
      continue;
    }

    console.log(`RUN ${id}: ${gate.title} (timeout ${Math.round(gate.timeoutMs / 1000)}s)`);
    const logPath = resolve(runDir, `${id}.log`);
    const startedAt = new Date().toISOString();
    const result = await runChild(gate, logPath);
    const status = result.timedOut ? 'timed-out' : result.code === 0 ? 'passed' : 'failed';
    const attempt = {
      id, title: gate.title, status, inputHash: currentInput.hash, inputFiles: currentInput.files,
      command: gate.command, startedAt, completedAt: new Date().toISOString(), exitCode: result.code, signal: result.signal,
      timedOut: result.timedOut, caps: result.caps, logPath: result.logPath,
      excerpt: safeTail(await readFile(logPath, 'utf8'), 5000),
    };
    const entry = { ...attempt, history: [...(old?.history ?? []), attempt] };
    const index = state.gates.findIndex((item) => item.id === id);
    if (index >= 0) state.gates[index] = entry; else state.gates.push(entry);
    state.status = status === 'passed' ? 'running' : status;
    state.updatedAt = new Date().toISOString();
    await writeState(runDir, state);
    console.log(`${status.toUpperCase()} ${id}: exit=${result.code ?? 'spawn-error'}${result.timedOut ? ' (time limit reached)' : ''}; diagnostics=${result.logPath}`);
    if (status !== 'passed') {
      const machineFailure = { schemaVersion: 1, task: args.task, runId: state.runId, repairIteration, status, failure: failureExcerpt(state), next: 'Fix the reported defect, then rerun with --resume. The runner never applies source fixes or retries a failed gate automatically.' };
      await writeFile(resolve(runDir, 'failure.json'), `${JSON.stringify(machineFailure, null, 2)}\n`);
      console.error(JSON.stringify(machineFailure, null, 2));
      process.exitCode = 1;
      return;
    }
  }
  if (args.dryRun) { console.log(`DRY-RUN complete. No state was written. Results directory for this run: ${relative(root, runDir)}`); return; }
  state.status = 'passed';
  state.lastCompletedAt = new Date().toISOString();
  state.completedAt ??= state.lastCompletedAt;
  await rm(resolve(runDir, 'failure.json'), { force: true });
  await writeState(runDir, state);
  console.log(`TASK PASS: ${args.task}; state=${relative(root, resolve(runDir, 'state.json'))}`);
}

main().catch((error) => {
  console.error(`review-loop: ${error.message}`);
  process.exitCode = 2;
});
