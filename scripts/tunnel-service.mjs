import { spawnSync } from 'node:child_process';
import { readFileSync,mkdirSync,existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname,resolve } from 'node:path';
import os from 'node:os';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const unit='campusbridge-tunnel';
const info=JSON.parse(readFileSync(resolve(root,'cloudflare/deployment.json'),'utf8'));
const action=process.argv[2]??'status';
function ctl(args){return spawnSync('systemctl',['--user',...args],{encoding:'utf8'});}
function persistentUnitLoaded(){
 const source=resolve(os.homedir(),'.config/systemd/user',`${unit}.service`);
 if(!existsSync(source))return false;
 let fragment=ctl(['show',unit,'--property=FragmentPath','--value']).stdout.trim();
 if(!fragment||fragment.includes('/systemd/transient/')){
  const reload=ctl(['daemon-reload']);if(reload.status!==0)throw new Error(reload.stderr||'systemctl --user daemon-reload failed.');
  fragment=ctl(['show',unit,'--property=FragmentPath','--value']).stdout.trim();
 }
 return Boolean(fragment)&&resolve(fragment)===source;
}
if(action==='start'){
 if(ctl(['is-active','--quiet',unit]).status===0){console.log('CampusBridge tunnel already running.');process.exit(0);}
 mkdirSync(resolve(root,'logs'),{recursive:true});
 if(persistentUnitLoaded()){
  const result=ctl(['start',unit]);if(result.status!==0)throw new Error(result.stderr||result.stdout);
  console.log('Started CampusBridge tunnel from its persistent user unit.');
 }else{
  const found=spawnSync('which',['wrangler'],{encoding:'utf8'});if(found.status!==0)throw new Error('Wrangler CLI is required.');
  const result=spawnSync('systemd-run',['--user','--collect',`--unit=${unit}`,`--working-directory=${root}`,'--property=MemoryMax=384M','--property=MemorySwapMax=128M','--property=TasksMax=64','--property=Restart=on-failure','--property=RestartSec=5',`--property=StandardOutput=append:${root}/logs/tunnel.log`,`--property=StandardError=append:${root}/logs/tunnel.log`,`--setenv=PATH=${process.env.PATH}`,`--setenv=NODE_OPTIONS=--max-old-space-size=192`,found.stdout.trim(),'tunnel','run',info.tunnel_id,'--config','cloudflare/wrangler.jsonc'],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||result.stdout);console.log(result.stderr.trim());
 }
}else if(action==='stop'){
 const r=ctl(['stop',unit]);if(r.status!==0)throw new Error(r.stderr);console.log('CampusBridge tunnel stopped.');
}else if(action==='status'){
 console.log(ctl(['show',unit,'--property=ActiveState,SubState,MainPID,MemoryCurrent']).stdout.trim());
}else throw new Error('Usage: node scripts/tunnel-service.mjs start|stop|status');
