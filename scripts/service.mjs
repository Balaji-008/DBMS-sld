import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const unit='campusbridge-api';
const action=process.argv[2]||'status';
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
 mkdirSync(resolve(root,'logs'),{recursive:true});
 if(ctl(['is-active','--quiet',unit]).status===0){console.log('CampusBridge is already running.');process.exit(0);}
 if(persistentUnitLoaded()){
  const result=ctl(['start',unit]);if(result.status!==0)throw new Error(result.stderr||result.stdout);
 }else{
  const result=spawnSync('systemd-run',['--user','--collect',`--unit=${unit}`,`--working-directory=${root}`,'--property=MemoryMax=512M','--property=MemorySwapMax=128M','--property=TasksMax=64','--property=Restart=on-failure','--property=RestartSec=3',`--property=StandardOutput=append:${root}/logs/server.log`,`--property=StandardError=append:${root}/logs/server.log`,process.execPath,'--max-old-space-size=384','--import','tsx','server/src/index.ts'],{encoding:'utf8',cwd:root});
  if(result.status!==0)throw new Error(result.stderr||result.stdout);
 }
 writeFileSync(resolve(root,'logs/server-unit.json'),JSON.stringify({unit,started_at:new Date().toISOString(),url:'http://127.0.0.1:3000'},null,2));
 console.log(persistentUnitLoaded()?'Started CampusBridge from its persistent user unit.':'Started CampusBridge from a bounded transient user unit.');
 console.log('Startup requested. Check npm run status and logs/server.log.');
}else if(action==='stop'){
 const result=ctl(['stop',unit]);if(result.status!==0)throw new Error(result.stderr);console.log('CampusBridge API stopped. Oracle/APEX were not stopped.');
}else if(action==='status'){
 const result=ctl(['show',unit,'--property=ActiveState,SubState,MainPID,MemoryCurrent']);console.log(result.stdout.trim());
 try{const r=await fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(5000)});console.log('HTTP',r.status,await r.text());}catch{console.log('HTTP: application not reachable');process.exitCode=1;}
}else throw new Error('Usage: node scripts/service.mjs start|stop|status');
