import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const env=parse(readFileSync(resolve(root,'.env')));
if(!/^[a-f0-9]{64}$/.test(env.ORIGIN_AUTH_TOKEN??''))throw new Error('Run db:provision to generate the local origin secret.');
const health=await fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(5000)});
if(!health.ok||(await health.json()).database!=='connected')throw new Error('Local Oracle API must be healthy before deployment.');
const cfg=['--config','cloudflare/wrangler.jsonc'];
const found=spawnSync('which',['wrangler'],{encoding:'utf8'});if(found.status!==0)throw new Error('Wrangler CLI is required.');
// Capture output: the secret is passed only on stdin, never on the command line.
const secret=spawnSync(found.stdout.trim(),['secret','put','ORIGIN_AUTH_TOKEN',...cfg],{cwd:root,input:env.ORIGIN_AUTH_TOKEN+'\n',encoding:'utf8',env:{...process.env,CI:'true'},timeout:120000});
if(secret.status!==0){console.error((secret.stderr||secret.stdout).replaceAll(env.ORIGIN_AUTH_TOKEN,'[redacted]'));throw new Error('Worker secret synchronization failed; deployment stopped.');}
console.log('Matching origin secret synchronized to Cloudflare.');
const deploy=spawnSync(found.stdout.trim(),['deploy',...cfg],{cwd:root,stdio:'inherit',env:{...process.env,CI:'true'},timeout:180000});
if(deploy.status!==0)throw new Error('Wrangler deployment failed.');
console.log('Verify https://dbms.sld.parswanadh.dev/api/health before sharing the application.');
