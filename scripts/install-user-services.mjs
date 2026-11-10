import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, symlinkSync, writeFileSync, lstatSync, readlinkSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const node = process.execPath;
const nodeBin = dirname(node);
const wrangler = resolve(nodeBin, 'wrangler');
const unitDir = resolve(os.homedir(), '.config/systemd/user');
const wantsDir = resolve(unitDir, 'default.target.wants');
const deployment = JSON.parse(readFileSync(resolve(root, 'cloudflare/deployment.json'), 'utf8'));

if (!existsSync(resolve(root, 'node_modules/tsx/package.json'))) {
  throw new Error('Dependencies are not installed; install the project dependencies before configuring services.');
}
if (!existsSync(wrangler)) throw new Error(`Wrangler CLI was not found beside Node: ${wrangler}`);
if (!deployment.tunnel_id) throw new Error('cloudflare/deployment.json has no tunnel_id.');

function render(name) {
  const template = readFileSync(resolve(root, 'systemd/user', `${name}.service.in`), 'utf8');
  return template
    .replaceAll('@ROOT@', root)
    .replaceAll('@NODE@', node)
    .replaceAll('@NODE_BIN@', nodeBin)
    .replaceAll('@WRANGLER@', wrangler)
    .replaceAll('@TUNNEL_ID@', deployment.tunnel_id);
}

if (checkOnly) {
  const checkDir = mkdtempSync(join(os.tmpdir(), 'campusbridge-units-'));
  try {
    for (const name of ['campusbridge-api', 'campusbridge-tunnel']) {
      writeFileSync(resolve(checkDir, `${name}.service`), render(name), { mode: 0o600 });
    }
    const result = spawnSync('systemd-analyze', ['verify', '--user', resolve(checkDir, 'campusbridge-api.service'), resolve(checkDir, 'campusbridge-tunnel.service')], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'systemd-analyze verify failed.');
    console.log('Rendered API and tunnel units pass systemd-analyze verify. No user services were changed.');
  } finally {
    rmSync(checkDir, { recursive: true, force: true });
  }
  process.exit(0);
}

mkdirSync(resolve(root, 'logs'), { recursive: true });
mkdirSync(unitDir, { recursive: true });
mkdirSync(wantsDir, { recursive: true });

function writeAtomic(path, contents) {
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, contents, { mode: 0o644 });
  chmodSync(temporary, 0o644);
  renameSync(temporary, path);
}

for (const name of ['campusbridge-api', 'campusbridge-tunnel']) {
  const destination = resolve(unitDir, `${name}.service`);
  writeAtomic(destination, render(name));
  const link = resolve(wantsDir, `${name}.service`);
  const expected = destination;
  if (existsSync(link)) {
    if (!lstatSync(link).isSymbolicLink() || resolve(dirname(link), readlinkSync(link)) !== expected) {
      throw new Error(`Refusing to replace an existing non-matching enable link: ${link}`);
    }
  } else {
    symlinkSync(destination, link);
  }
}

function showFragment(unit) {
  const result = spawnSync('systemctl', ['--user', 'show', unit, '--property=FragmentPath', '--value'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

const activeTransient = ['campusbridge-api.service', 'campusbridge-tunnel.service']
  .some(unit => showFragment(unit).includes('/systemd/transient/'));
if (!activeTransient) {
  const result = spawnSync('systemctl', ['--user', 'daemon-reload'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'systemctl --user daemon-reload failed.');
} else {
  console.log('An active transient CampusBridge unit remains loaded. Persistent files are installed and enabled on disk; daemon-reload was deferred to avoid replacing the live unit during E2E.');
}

console.log(`Installed and enabled persistent user units in ${unitDir}.`);
console.log('No service was started, stopped, or restarted. After a coordinated handoff, run systemctl --user daemon-reload and start the two units.');
