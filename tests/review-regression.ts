import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile,mkdir,writeFile,unlink } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const before=process.argv.includes('--before');
process.env.NODE_ENV='test';process.env.MAIL_TRANSPORT='json';process.env.COOKIE_SECURE='false';process.env.BOOTSTRAP_ADMIN_EMAIL='admin@campus.test';
let root=process.cwd();
if(before){
 const patch=await readFile('.superpowers/sdd/oracle-portal/review-package.patch','utf8');
 root=resolve('test-results/review-before');
 for(const part of patch.split('diff --git ')){
  const header=part.match(/^\+\+\+ b\/.*?placements-portal\/(server\/src\/[^\n]+)/m);if(!header)continue;
  const content=part.split('\n').filter(line=>line.startsWith('+')&&!line.startsWith('+++')).map(line=>line.slice(1)).join('\n');
  const path=resolve(root,header[1]);await mkdir(dirname(path),{recursive:true});await writeFile(path,content+'\n');
 }
}
const load=async(file:string)=>import(pathToFileURL(resolve(root,'server/src/'+file+'.ts')).href);
const {createApp}=await load('app');const {initDb,closeDb,query,withConnection}=await load('db');const {getCapturedMail}=await load('mail');const {makeChallenge}=await load('auth');
await initDb();const server=createServer(createApp());await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const addr=server.address();assert(addr&&typeof addr==='object');const base=`http://127.0.0.1:${addr.port}/api`;
const results:{case:string;passed:boolean;observed:string}[]=[];
let uploadedId='',uploadedName='',certificateId:number|undefined;
async function reset(email:string){await query('DELETE FROM otp_challenges WHERE email=:email',{email});await query('DELETE FROM otp_email_locks WHERE email=:email',{email});}
async function call(path:string,body?:unknown,cookie='',method='POST'){const response=await fetch(base+path,{method:body===undefined?'GET':method,headers:{...(body===undefined?{}:{'content-type':'application/json'}),...(cookie?{cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json() as any;return {response,data,cookie:response.headers.get('set-cookie')?.split(';')[0]??''};}
async function login(email:string,role:string){await reset(email);const challenge=await call('/auth/request-otp',{email,role});assert.equal(challenge.response.status,200);const mail=getCapturedMail().filter((x:any)=>x.to===email).at(-1);const verified=await call('/auth/verify-otp',{challenge_id:challenge.data.challenge_id,otp:mail.code});assert.equal(verified.response.status,200);return verified.cookie;}
function record(name:string,passed:boolean,observed:string){results.push({case:name,passed,observed});console.log(`${passed?'PASS':'FAIL'} ${name}: ${observed}`);}
try{
 const admin=await login('admin@campus.test','admin');const student=await login('student@campus.test','student');const recruiter=await login('recruiter@campus.test','recruiter');
 const dashboard=await call('/dashboard',undefined,student);record('Student dashboard Oracle binds',dashboard.response.status===200,`HTTP ${dashboard.response.status}`);
 const profile=(await call('/students/me',undefined,student)).data;const studentId=profile.id;
 const blankEmail=await call('/students/me',{...profile,personal_email:''},student,'PUT');record('Blank optional contact email',blankEmail.response.status===200,`HTTP ${blankEmail.response.status}`);
 const form=new FormData();form.set('kind','certificate');form.set('file',new Blob(['%PDF-1.4\nRegression document\n%%EOF'],{type:'application/pdf'}),'regression.pdf');
 const uploadResponse=await fetch(base+'/uploads',{method:'POST',headers:{cookie:admin},body:form});const upload=await uploadResponse.json() as any;assert.equal(uploadResponse.status,201);uploadedId=upload.url.split('/').at(-1);uploadedName=(await query('SELECT stored_name FROM uploads WHERE id=:id',{id:uploadedId}))[0].stored_name;
 const cert=await call('/certificates',{student_id:studentId,certificate_name:'Review regression fixture',issuer:'Controlled test',completion_date:'2026-11-01',certificate_url:upload.url},admin);assert.equal(cert.response.status,201);certificateId=cert.data.id;
 const ownerRead=await fetch(base+upload.url.replace('/api',''),{headers:{cookie:student}});const recruiterRead=await fetch(base+upload.url.replace('/api',''),{headers:{cookie:recruiter}});
 record('Admin-issued certificate access',ownerRead.status===200&&recruiterRead.status===200,`Student HTTP ${ownerRead.status}; applicant recruiter HTTP ${recruiterRead.status}`);
 await reset('student@campus.test');const captured:string[]=[];
 // Force a valid overlapping Oracle schedule: consistent reads can proceed,
 // while challenge writes briefly wait for this controlled test transaction.
 let locked!:()=>void;let release!:()=>void;
 const acquired=new Promise<void>(r=>locked=r);const gate=new Promise<void>(r=>release=r);
 const blocker=withConnection(async(c:any)=>{await c.execute('LOCK TABLE otp_challenges IN EXCLUSIVE MODE');locked();await gate;await c.rollback();});
 await acquired;
 const pending=Promise.allSettled(Array.from({length:6},()=>makeChallenge({email:'student@campus.test',role:'student',remember:false},async(_email:string,code:string)=>{captured.push(code);} )));
 await new Promise(r=>setTimeout(r,200));release();await blocker;
 const responses=await pending;
 const delivered=captured.length;const ok=responses.filter(x=>x.status==='fulfilled').length;
 record('Concurrent OTP delivery limit',ok===1&&delivered===1,`${ok} successful dispatch responses, ${delivered} captured codes`);
 await mkdir('test-results',{recursive:true});await writeFile(`test-results/review-${before?'before':'after'}-results.json`,JSON.stringify(results,null,2));
 const failed=results.filter(x=>!x.passed).length;console.log(`REVIEW ${before?'BEFORE':'AFTER'}: ${results.length-failed} passed, ${failed} failed.`);if(failed)process.exitCode=1;
}finally{
 if(certificateId)await query('DELETE FROM certificates WHERE id=:id',{id:certificateId});
 if(uploadedId)await query('DELETE FROM uploads WHERE id=:id',{id:uploadedId});
 if(uploadedName)await unlink('storage/uploads/'+uploadedName).catch(()=>{});
 await reset('student@campus.test');await new Promise<void>(r=>server.close(()=>r()));await closeDb();
}
