import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { parse } from 'dotenv';

const path=new URL('../.env',import.meta.url);
if(!existsSync(path)) throw new Error('Run npm run db:provision first.');
const env=parse(readFileSync(path));
const rl=createInterface({input:stdin,output:stdout});
try {
  const email=(await rl.question('Gmail sender address: ')).trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  rl.close();
  stdout.write('Google app password (input hidden): ');
  let password='';
  if(stdin.isTTY) stdin.setRawMode(true);
  stdin.resume();
  password=await new Promise((resolve,reject)=>{
    const handler=chunk=>{
      for(const char of chunk.toString()) {
        if(char==='\u0003'){stdin.off('data',handler);reject(new Error('Cancelled'));return;}
        if(char==='\r'||char==='\n'){stdin.off('data',handler);resolve(password);return;}
        if(char==='\u007f'||char==='\b') password=password.slice(0,-1);
        else password+=char;
      }
    };
    stdin.on('data',handler);
  });
  if(stdin.isTTY) stdin.setRawMode(false);
  stdin.pause(); stdout.write('\n');
  password=password.replace(/\s/g,'');
  if(password.length!==16) throw new Error('A Google app password must contain 16 characters.');
  Object.assign(env,{SMTP_HOST:'smtp.gmail.com',SMTP_PORT:'465',SMTP_SECURE:'true',SMTP_USER:email,SMTP_PASS:password,SMTP_FROM:`Amrita Placement Portal <${email}>`,MAIL_TRANSPORT:'smtp'});
  if(!env.BOOTSTRAP_ADMIN_EMAIL)env.BOOTSTRAP_ADMIN_EMAIL=email;
  writeFileSync(path,Object.entries(env).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n',{mode:0o600});chmodSync(path,0o600);
  console.log('Gmail configuration saved locally. Run npm run db:setup, then restart the application.');
} finally { if(stdin.isTTY)stdin.setRawMode(false);rl.close(); }
