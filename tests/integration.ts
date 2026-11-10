import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { unlink } from 'node:fs/promises';

process.env.NODE_ENV='test';
process.env.MAIL_TRANSPORT='json';
process.env.BOOTSTRAP_ADMIN_EMAIL='admin@campus.test';
process.env.COOKIE_SECURE='false';
const {createApp}=await import('../server/src/app.js');
const {initDb,closeDb,query}=await import('../server/src/db.js');
const {getCapturedMail,clearCapturedMail}=await import('../server/src/mail.js');
await initDb();
const app=createApp();
const server=createServer(app);
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const address=server.address();
assert(address&&typeof address==='object');
const base=`http://127.0.0.1:${address.port}/api`;
const run=Date.now().toString(36);
let passed=0;
const qaFindings:string[]=[];
const testEmails:string[]=[];
const createdCompanies:number[]=[];
const createdOpportunities:number[]=[];
function check(condition:unknown,message:string){assert(condition,message);passed++;console.log(`PASS ${message}`);}
async function req(path:string,method='GET',body?:unknown,cookie='',status=200,extra:Record<string,string>={}){
 const response=await fetch(base+path,{method,headers:{...(body!==undefined?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...extra},body:body===undefined?undefined:JSON.stringify(body)});
 const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{data=text}
 assert.equal(response.status,status,`${method} ${path}: expected ${status}, got ${response.status}: ${text}`);
 return {data,response,cookie:response.headers.get('set-cookie')?.split(';')[0]??''};
}
function code(email:string){const last=getCapturedMail().filter(x=>x.to===email).at(-1);assert(last,'Test mail capture missing');return last.code;}
async function resetOtp(email:string){await query('DELETE FROM otp_challenges WHERE email=:email',{email});await query('DELETE FROM otp_email_locks WHERE email=:email',{email});}
async function login(email:string,role:string){await resetOtp(email);const r=await req('/auth/request-otp','POST',{email,role});const v=await req('/auth/verify-otp','POST',{challenge_id:r.data.challenge_id,otp:code(email)});assert(v.cookie);return v.cookie;}
async function register(email:string,role:'student'|'recruiter',extra:Record<string,unknown>){testEmails.push(email);const r=await req('/auth/register','POST',{email,full_name:`Integration ${role} ${run}`,role,...extra});return req('/auth/verify-otp','POST',{challenge_id:r.data.challenge_id,otp:code(email)});}
try{
 check((await req('/health')).data.database==='connected','health checks real Oracle connection');
 let authConfig:any;for(let i=0;i<35;i++)authConfig=(await req('/auth/config')).data;check(authConfig.registration_enabled===true&&authConfig.otp_expiry_seconds===300&&authConfig.resend_after===60,'auth config remains available after 35 GETs beyond the POST rate limit');
 const departments=(await req('/departments')).data.items;check(departments.length>=4,'registration departments are public');
 await req('/students','GET',undefined,'',401);check(true,'student directory requires authentication');
 await req('/auth/register','POST',{email:`bad-${run}@campus.test`,full_name:'Bad Admin',role:'admin'},'',400);check(true,'public registration cannot grant admin');
 const admin=await login('admin@campus.test','admin');
 check((await req('/auth/me','GET',undefined,admin)).data.user.role==='admin','authenticated session can read current user');
 const department=departments.find((x:any)=>x.code==='EAC')??departments[0];
 const studentEmail=`integration-student-${run}@campus.test`;
 const studentResult=await register(studentEmail,'student',{roll_number:`IT-${run}`,department_id:department.id});
 const student=studentResult.cookie;const studentId=studentResult.data.user.student_id;
 check(studentResult.data.user.role==='student'&&Boolean(studentId),'verified registration creates Oracle student and session');
 const company=(await req('/companies','POST',{name:`Integration Company ${run}`,company_code:`IT-${run}`,industry:'Software',contact_email:`hr-${run}@campus.test`,website:'https://example.com'},admin,201)).data;createdCompanies.push(company.id);
 check(company.id>0,'admin creates company in Oracle');
 const changedCompany=(await req('/companies/'+company.id,'PATCH',{industry:'Integration QA'},admin)).data;check(changedCompany.industry==='Integration QA','admin updates company fields');
 await req('/companies/not-a-number','PATCH',{industry:'Must not persist'},admin,400);await req('/companies/999999999','PATCH',{industry:'Must not persist'},admin,404);
 check((await query<any>('SELECT industry FROM companies WHERE id=:id',{id:company.id}))[0].industry==='Integration QA','malformed and missing company IDs fail without changing valid rows');
 await req('/companies','POST',{name:'Unauthorized',company_code:'BAD'},student,403);check(true,'students cannot create companies');
 const recruiterEmail=`integration-recruiter-${run}@campus.test`;
 const recruiterSignup=await register(recruiterEmail,'recruiter',{company_name:`Integration Recruiter Co ${run}`});
 check(recruiterSignup.data.pending_approval&&!recruiterSignup.cookie,'verified recruiter waits for admin approval');
 const pending=(await req('/users/pending','GET',undefined,admin)).data.items.find((x:any)=>x.email===recruiterEmail);assert(pending);createdCompanies.push((await query<any>('SELECT company_id FROM users WHERE id=:id',{id:pending.id}))[0].company_id);
 await req('/users/'+pending.id+'/approve','POST',{},admin);check(true,'admin approves recruiter');
 const recruiter=await login(recruiterEmail,'recruiter');
 const recruiterCompanyId=Number((await query<any>('SELECT company_id FROM users WHERE id=:id',{id:pending.id}))[0].company_id);
 await req('/companies/'+company.id,'PATCH',{industry:'Unauthorized'},recruiter,403);check(true,'recruiter cannot edit another company');
 const ownCompany=(await req('/companies/'+recruiterCompanyId,'PATCH',{website:'https://recruiter.example'},recruiter)).data;check(ownCompany.website==='https://recruiter.example','recruiter updates own company details');
 await req('/students','GET',undefined,recruiter,403);check(true,'recruiter cannot access private student directory');
 const profile={full_name:`Integration Student ${run}`,batch:'2028',cgpa:9.2,active_backlogs:0,skills:['SQL','TypeScript'],phone_numbers:['+919999999991','+919999999992','+919999999991'],personal_email:studentEmail,resume_url:null,aadhaar_number:'123456789012',aadhaar_document_url:null};
 const saved=(await req('/students/me','PUT',profile,student)).data;
 check((await req('/dashboard','GET',undefined,student)).data.metrics.length===4,'student dashboard queries with correct Oracle binds');
 check(saved.phone_numbers.length===2&&saved.skills.includes('SQL'),'composite profile persists and duplicate phone input is normalized');
 check(saved.aadhaar_masked==='••••••••9012'&&!('aadhaar_number' in saved),'profile returns only the masked Aadhaar value');
 const aadhaarStored=(await query<any>('SELECT aadhaar_number_enc,aadhaar_last4 FROM students WHERE id=:id',{id:studentId}))[0];check(aadhaarStored.aadhaar_last4==='9012'&&!String(aadhaarStored.aadhaar_number_enc).includes('123456789012'),'synthetic Aadhaar is encrypted at rest');
 const adminProfile=(await req('/students','GET',undefined,admin)).data.items.find((x:any)=>x.id===studentId);check(adminProfile.aadhaar_masked==='••••••••9012'&&!('aadhaar_number' in adminProfile),'admin student directory also masks Aadhaar');
 await req('/students/me','PUT',{...profile,aadhaar_document_url:'https://example.com/aadhaar.pdf'},student);check(true,'profile accepts external HTTPS document links');
 const opBody={company_id:company.id,title:`Integration Engineer ${run}`,type:'placement',status:'open',role:'Software Engineer',description:'Controlled integration test opportunity',ctc:1200000,location:'Bengaluru',employment_type:'Full-time',application_deadline:new Date(Date.now()+864000000).toISOString(),min_cgpa:7,max_backlogs:0,eligible_departments:[department.code],eligible_department_ids:[department.id],required_skills:['SQL']};
 const rollbackTitle=`Rollback ${run}`;
 await req('/opportunities','POST',{...opBody,title:rollbackTitle,eligible_department_ids:[999999999]},admin,409);
 const rollbackCheck=await query<any>(`SELECT (SELECT COUNT(*) FROM opportunities WHERE title=:title) parent_rows FROM dual`,{title:rollbackTitle});check(Number(rollbackCheck[0].parent_rows)===0,'invalid eligible-department FK rolls back parent opportunity and requirement children');
 const opportunity=(await req('/opportunities','POST',opBody,admin,201)).data;createdOpportunities.push(opportunity.id);
 const malformedOpportunity=await fetch(base+'/opportunities/not-a-number',{headers:{cookie:admin}});const malformedOpportunityText=await malformedOpportunity.text();if(malformedOpportunity.status===400)check(true,'malformed opportunity IDs return 400');else{qaFindings.push(`GET /opportunities/not-a-number returned ${malformedOpportunity.status}: ${malformedOpportunityText}`);console.error(`QA GAP: ${qaFindings.at(-1)}`);}
 await req('/opportunities/999999999','GET',undefined,admin,404);check(true,'missing opportunity ID returns 404');
 check(opportunity.required_skills.includes('SQL')&&opportunity.eligible_department_ids.includes(department.id),'job details and requirements persist in Oracle');
 const draft=(await req('/opportunities','POST',{...opBody,title:`Draft ${run}`,status:'draft'},admin,201)).data;createdOpportunities.push(draft.id);
 check(!(await req('/opportunities','GET',undefined,student)).data.items.some((x:any)=>x.id===draft.id),'students cannot see draft opportunities');
 check((await req('/opportunities','GET',undefined,recruiter)).data.items.every((x:any)=>x.company_id===recruiterCompanyId),'recruiter opportunity listing stays within its assigned company');
 await req('/opportunities/'+opportunity.id,'PUT',opBody,recruiter,403);check(true,'recruiter cannot update another company job');
 const appResult=(await req('/opportunities/'+opportunity.id+'/apply','POST',{},student,201)).data;
 check(appResult.student_id===studentId,'eligible student applies to a job');
 const recruiterApps=(await req('/applications','GET',undefined,recruiter)).data.items;check(recruiterApps.every((x:any)=>x.company_id===recruiterCompanyId),'recruiter applications are scoped to own company');
 await req('/opportunities/'+opportunity.id+'/apply','POST',{},student,409);check(true,'duplicate application rejected by backend/database');
 await req('/applications/'+appResult.id+'/status','PATCH',{status:'selected'},student,403);check(true,'student cannot select own application');
 await req('/applications/'+appResult.id+'/status','PATCH',{status:'selected'},admin,409);check(true,'invalid hiring-stage jump is rejected');
 for(const status of ['screening','interview','selected'])await req('/applications/'+appResult.id+'/status','PATCH',{status},admin);
 check(true,'application progresses through supported hiring stages');
 const placementBody={application_id:appResult.id,role:'Software Engineer',description:'Offer snapshot',ctc:1200000,location:'Bengaluru',employment_type:'Full-time',offer_date:new Date().toISOString().slice(0,10)};
 const placement=(await req('/placements','POST',placementBody,admin,201)).data;
 check(placement.student_id===studentId&&placement.min_cgpa===7&&placement.required_skills.includes('SQL'),'placement preserves job and requirement snapshot');
 await req('/placements','POST',placementBody,admin,409);check(true,'duplicate outcome rejected');
 const ownOffers=(await req('/placements','GET',undefined,student)).data.items;check(ownOffers.every((p:any)=>p.student_id===studentId),'student outcome list is scoped to own records');
 const cert=(await req('/certificates','POST',{certificate_name:`Oracle Certificate ${run}`,issuer:'Integration Test',completion_date:'2026-11-01',credential_id:run,certificate_url:'https://example.com/certificate'},student,201)).data;
 check(cert.student_id===studentId,'student creates certificate linked to own profile');
 await req('/certificates/'+cert.id,'DELETE',undefined,recruiter,404);
 const strict=(await req('/opportunities','POST',{...opBody,title:`Strict ${run}`,min_cgpa:10},admin,201)).data;createdOpportunities.push(strict.id);
 await req('/opportunities/'+strict.id+'/apply','POST',{},student,409);check(true,'ineligible application blocked using Oracle profile');
 const backlogJob=(await req('/opportunities','POST',{...opBody,title:`Backlog restricted ${run}`,max_backlogs:0},admin,201)).data;createdOpportunities.push(backlogJob.id);
 await req('/students/me','PUT',{...profile,active_backlogs:1},student);await req('/opportunities/'+backlogJob.id+'/apply','POST',{},student,409);check(true,'active backlog cap blocks application');await req('/students/me','PUT',profile,student);
 const otherDepartment=departments.find((x:any)=>x.id!==department.id)!;
 const deptOnly=(await req('/opportunities','POST',{...opBody,title:`Department restricted ${run}`,eligible_departments:[otherDepartment.code],eligible_department_ids:[otherDepartment.id]},admin,201)).data;createdOpportunities.push(deptOnly.id);
 await req('/opportunities/'+deptOnly.id+'/apply','POST',{},student,409);check(true,'department eligibility blocks applications from other departments');
 const closed=(await req('/opportunities','POST',{...opBody,title:`Closed ${run}`,status:'closed'},admin,201)).data;createdOpportunities.push(closed.id);
 await req('/opportunities/'+closed.id+'/apply','POST',{},student,409);check(true,'closed opportunities reject applications');
 const expired=(await req('/opportunities','POST',{...opBody,title:`Past deadline ${run}`,application_deadline:new Date(Date.now()-86400000).toISOString()},admin,201)).data;createdOpportunities.push(expired.id);
 await req('/opportunities/'+expired.id+'/apply','POST',{},student,409);check(true,'open opportunities with expired deadline reject applications');
 const internship=(await req('/opportunities','POST',{...opBody,title:`Intern ${run}`,type:'internship',ctc:40000},admin,201)).data;createdOpportunities.push(internship.id);
 const ia=(await req('/opportunities/'+internship.id+'/apply','POST',{},student,201)).data;for(const status of ['screening','interview','selected'])await req('/applications/'+ia.id+'/status','PATCH',{status},admin);
 const ir=(await req('/internships','POST',{application_id:ia.id,role:'Engineering Intern',start_date:'2026-12-01',end_date:'2027-02-01',ppo_converted:false},admin,201)).data;
 check(ir.student_id===studentId&&ir.company_name===company.name,'selected internship creates linked outcome');
 const withdrawJob=(await req('/opportunities','POST',{...opBody,title:`Withdraw ${run}`},admin,201)).data;createdOpportunities.push(withdrawJob.id);
 const withdrawApp=(await req('/opportunities/'+withdrawJob.id+'/apply','POST',{},student,201)).data;
 const withdrawn=(await req('/applications/'+withdrawApp.id+'/status','PATCH',{status:'withdrawn'},student)).data;check(withdrawn.status==='withdrawn','student withdraws own active application');
 await req('/applications/'+withdrawApp.id+'/status','PATCH',{status:'screening'},admin,409);check(true,'withdrawn application cannot re-enter recruiter hiring stages');
 const h=(await req('/hackathons','POST',{company_id:company.id,title:`Hackathon ${run}`,description:'Integration event',mode:'online',start_date:new Date(Date.now()+20*86400000).toISOString(),end_date:new Date(Date.now()+21*86400000).toISOString(),application_deadline:new Date(Date.now()+10*86400000).toISOString(),location:'Online',team_size:4},admin,201)).data;createdOpportunities.push(h.opportunity_id);
 await req('/opportunities/'+h.opportunity_id+'/apply','POST',{},student,400);check(true,'hackathon rejects placement application route');
 await req('/hackathons/'+h.id+'/register','POST',{team_name:'Integration Team'},student,201);
 await req('/hackathons/'+h.id+'/register','POST',{team_name:'Duplicate Team'},student,409);check(true,'hackathon registration links student once');
 const registrations=(await req('/hackathons/'+h.id+'/registrations','GET',undefined,student)).data.items;check(registrations.length===1&&registrations[0].student_id===studentId,'student sees only own hackathon registration');
 await req('/hackathons','POST',{company_id:company.id,title:`Invalid Hackathon ${run}`,description:'Bad dates',mode:'online',start_date:new Date(Date.now()+22*86400000).toISOString(),end_date:new Date(Date.now()+21*86400000).toISOString(),application_deadline:new Date(Date.now()+10*86400000).toISOString(),location:'Online',team_size:4},admin,400);check(true,'hackathon rejects an end date before its start date');
 const form=new FormData();form.set('kind','resume');form.set('file',new Blob(['%PDF-1.4\nTest document\n%%EOF'],{type:'application/pdf'}),'test.pdf');
 const uploadRes=await fetch(base+'/uploads',{method:'POST',headers:{cookie:student},body:form});const upload=await uploadRes.json() as any;assert.equal(uploadRes.status,201,JSON.stringify(upload));
 const read=await fetch(base+upload.url.replace('/api',''),{headers:{cookie:student}});check(read.status===200&&read.headers.get('cache-control')?.includes('no-store'),'protected upload is readable by owner with no caching');
 const foreign=await fetch(base+upload.url.replace('/api',''),{headers:{cookie:recruiter}});check(foreign.status===404,'unrelated recruiter cannot access student upload');
 const aadhaarFile=new FormData();aadhaarFile.set('kind','aadhaar');aadhaarFile.set('file',new Blob(['%PDF-1.4\nSynthetic identity test document\n%%EOF'],{type:'application/pdf'}),'synthetic-aadhaar.pdf');
 const aadhaarResponse=await fetch(base+'/uploads',{method:'POST',headers:{cookie:student},body:aadhaarFile});const aadhaarUpload=await aadhaarResponse.json() as any;assert.equal(aadhaarResponse.status,201,JSON.stringify(aadhaarUpload));
 await req('/students/me','PUT',{...profile,aadhaar_document_url:aadhaarUpload.url},student);const aadhaarOwner=await fetch(base+aadhaarUpload.url.replace('/api',''),{headers:{cookie:student}}),aadhaarAdmin=await fetch(base+aadhaarUpload.url.replace('/api',''),{headers:{cookie:admin}}),aadhaarRecruiter=await fetch(base+aadhaarUpload.url.replace('/api',''),{headers:{cookie:recruiter}});
 check(aadhaarOwner.status===200&&aadhaarAdmin.status===200&&aadhaarRecruiter.status===404,'Aadhaar document access is limited to owner and admin');
 await req('/students/me','PUT',{...profile,aadhaar_document_url:upload.url},student,403);check(true,'resume upload cannot be reused as an Aadhaar document');
 const recJob=(await req('/opportunities','POST',{...opBody,company_id:undefined,title:`Recruiter job ${run}`},recruiter,201)).data;createdOpportunities.push(recJob.id);
 await req('/opportunities/'+recJob.id+'/apply','POST',{},student,201);
 const adminFile=new FormData();adminFile.set('kind','certificate');adminFile.set('file',new Blob(['%PDF-1.4\nCredential\n%%EOF'],{type:'application/pdf'}),'credential.pdf');
 const adminFileRes=await fetch(base+'/uploads',{method:'POST',headers:{cookie:admin},body:adminFile});const adminUpload=await adminFileRes.json() as any;assert.equal(adminFileRes.status,201);
 const adminCert=(await req('/certificates','POST',{student_id:studentId,certificate_name:`Admin issued ${run}`,issuer:'Placement team',completion_date:'2026-11-01',certificate_url:adminUpload.url},admin,201)).data;
 const studentDoc=await fetch(base+adminUpload.url.replace('/api',''),{headers:{cookie:student}});
 const recruiterDoc=await fetch(base+adminUpload.url.replace('/api',''),{headers:{cookie:recruiter}});
 check(studentDoc.status===200&&recruiterDoc.status===200,'student and applicant recruiter can read admin-uploaded student certificate');
 await req('/certificates/'+adminCert.id,'DELETE',undefined,recruiter,404);
 const adminUploadId=adminUpload.url.split('/').at(-1);const adminStored=(await query<any>('SELECT stored_name FROM uploads WHERE id=:id',{id:adminUploadId}))[0].stored_name;await query('DELETE FROM uploads WHERE id=:id',{id:adminUploadId});await unlink(`storage/uploads/${adminStored}`);
 await req('/certificates','POST',{certificate_name:'Invalid date',issuer:'Test',completion_date:'2026-02-31',certificate_url:'https://example.com/cert'},student,400);check(true,'invalid calendar dates return validation error');
 await req('/students/me','PUT',{...profile,personal_email:''},student);check(true,'optional blank contact email can be saved');
 const hostile=new FormData();hostile.set('file',new Blob(['<script>bad</script>'],{type:'image/png'}),'fake.png');const hostileRes=await fetch(base+'/uploads',{method:'POST',headers:{cookie:student},body:hostile});check(hostileRes.status===400,'upload magic bytes are validated');
 const adminDash=(await req('/dashboard','GET',undefined,admin)).data;const globalDashExpected=(await query<any>(`SELECT (SELECT COUNT(*) FROM applications) applications,(SELECT COUNT(*) FROM applications WHERE status IN ('screening','interview')) in_progress,(SELECT COUNT(*) FROM applications WHERE status='selected') offers,(SELECT COUNT(*) FROM students) students FROM dual`))[0];
 check(adminDash.metrics.find((m:any)=>m.label==='Applications').value===Number(globalDashExpected.applications)&&adminDash.metrics.find((m:any)=>m.label==='In progress').value===Number(globalDashExpected.in_progress)&&adminDash.metrics.find((m:any)=>m.label==='Offers').value===Number(globalDashExpected.offers)&&adminDash.metrics.find((m:any)=>m.label==='Students').value===Number(globalDashExpected.students),'admin dashboard metrics match independent Oracle counts');
 const recruiterDash=(await req('/dashboard','GET',undefined,recruiter)).data;const recruiterDashExpected=(await query<any>(`SELECT (SELECT COUNT(*) FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company) applications,(SELECT COUNT(*) FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company AND a.status IN ('screening','interview')) in_progress,(SELECT COUNT(*) FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company AND a.status='selected') offers,(SELECT COUNT(*) FROM opportunities WHERE company_id=:company AND status='open' AND application_deadline>SYSTIMESTAMP AND type IN ('placement','internship')) open_roles FROM dual`,{company:recruiterCompanyId}))[0];
 check(recruiterDash.metrics.find((m:any)=>m.label==='Applications').value===Number(recruiterDashExpected.applications)&&recruiterDash.metrics.find((m:any)=>m.label==='In progress').value===Number(recruiterDashExpected.in_progress)&&recruiterDash.metrics.find((m:any)=>m.label==='Offers').value===Number(recruiterDashExpected.offers)&&recruiterDash.metrics.find((m:any)=>m.label==='Open roles').value===Number(recruiterDashExpected.open_roles),'recruiter dashboard metrics match independent company-scoped Oracle counts');
 const studentDash=(await req('/dashboard','GET',undefined,student)).data;const studentDashExpected=(await query<any>(`SELECT COUNT(*) applications,COUNT(CASE WHEN status='interview' THEN 1 END) interviews,COUNT(CASE WHEN status='selected' THEN 1 END) offers FROM applications WHERE student_id=:student`,{student:studentId}))[0];
 check(studentDash.metrics.find((m:any)=>m.label==='Applications').value===Number(studentDashExpected.applications)&&studentDash.metrics.find((m:any)=>m.label==='Interviews').value===Number(studentDashExpected.interviews)&&studentDash.metrics.find((m:any)=>m.label==='Offers').value===Number(studentDashExpected.offers),'student dashboard metrics match independent Oracle counts');
 const adminReports=(await req('/reports','GET',undefined,admin)).data;const adminReportExpected=(await query<any>(`SELECT (SELECT COUNT(*) FROM students) total_students,(SELECT COUNT(DISTINCT a.student_id) FROM applications a JOIN placements p ON p.application_id=a.id AND a.status='selected') placed_students,(SELECT NVL(AVG(p.ctc),0) FROM placements p JOIN applications a ON a.id=p.application_id AND a.status='selected') avg_ctc FROM dual`))[0];
 check(adminReports.summary.total_students===Number(adminReportExpected.total_students)&&adminReports.summary.placed_students===Number(adminReportExpected.placed_students)&&Math.abs(adminReports.summary.avg_ctc-Number(adminReportExpected.avg_ctc))<0.01,'admin report totals and average offer match independent Oracle aggregates');
 const recruiterReports=(await req('/reports','GET',undefined,recruiter)).data;const recruiterReportExpected=(await query<any>(`SELECT (SELECT COUNT(DISTINCT a.student_id) FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company) total_students,(SELECT COUNT(DISTINCT a.student_id) FROM applications a JOIN opportunities o ON o.id=a.opportunity_id JOIN placements p ON p.application_id=a.id WHERE o.company_id=:company AND a.status='selected') placed_students,(SELECT COUNT(p.id) FROM placements p JOIN applications a ON a.id=p.application_id JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company AND a.status='selected') offers,(SELECT NVL(AVG(p.ctc),0) FROM placements p JOIN applications a ON a.id=p.application_id JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:company AND a.status='selected') avg_ctc FROM dual`,{company:recruiterCompanyId}))[0];
 const recruiterCompanyReport=recruiterReports.companies.find((x:any)=>x.name===ownCompany.name);const recruiterDepartmentReport=recruiterReports.departments.find((x:any)=>x.name===department.name);const deptReportExpected=(await query<any>(`SELECT COUNT(DISTINCT s.id) students,COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN s.id END) placed FROM students s JOIN applications a ON a.student_id=s.id JOIN opportunities o ON o.id=a.opportunity_id LEFT JOIN placements p ON p.application_id=a.id AND a.status='selected' WHERE s.department_id=:department AND o.company_id=:company`,{department:department.id,company:recruiterCompanyId}))[0];
 check(recruiterReports.summary.total_students===Number(recruiterReportExpected.total_students)&&recruiterReports.summary.placed_students===Number(recruiterReportExpected.placed_students)&&recruiterCompanyReport.offers===Number(recruiterReportExpected.offers)&&Math.abs(recruiterReports.summary.avg_ctc-Number(recruiterReportExpected.avg_ctc))<0.01&&Math.abs(recruiterCompanyReport.avg_ctc-Number(recruiterReportExpected.avg_ctc))<0.01&&recruiterDepartmentReport.students===Number(deptReportExpected.students)&&recruiterDepartmentReport.placed===Number(deptReportExpected.placed),'recruiter report counts, department breakdown and offer averages match independent company-scoped Oracle aggregates');
 for(const path of ['/dashboard','/reports','/students','/companies','/opportunities','/applications','/placements','/internships','/certificates','/hackathons']){const data=(await req(path,'GET',undefined,admin)).data;check(Boolean(data),`admin ${path} queries real Oracle data`);}
 for(const path of ['/dashboard','/reports','/opportunities','/applications','/placements','/internships','/certificates','/hackathons'])await req(path,'GET',undefined,recruiter);
 check(true,'recruiter read endpoints execute with company scope');
 await req('/companies','POST',{name:'CSRF',company_code:'CSRF'},admin,403,{origin:'https://evil.example'});check(true,'cross-origin write rejected');
 await req('/health','GET',undefined,'',403,{'cf-connecting-ip':'1.2.3.4'});check(true,'untrusted forwarded origin rejected');
 // Independent existing test identity for one-use, expiry and attempt limits.
 const email='student@campus.test';await resetOtp(email);
 const challenge=(await req('/auth/request-otp','POST',{email,role:'student'})).data;
 await req('/auth/request-otp','POST',{email,role:'student'},'',429);check(true,'OTP resend cooldown enforced');
 const correct=code(email);const verified=await req('/auth/verify-otp','POST',{challenge_id:challenge.challenge_id,otp:correct});assert(verified.cookie);
 await req('/certificates/'+cert.id,'DELETE',undefined,verified.cookie,404);await req('/certificates/'+adminCert.id,'DELETE',undefined,verified.cookie,404);
 check((await query<any>('SELECT COUNT(*) amount FROM certificates WHERE id IN (:owner_id,:admin_id)',{owner_id:cert.id,admin_id:adminCert.id}))[0].amount===2,'unrelated student and recruiter cannot delete certificates owned by another student');
 await req('/certificates/'+cert.id,'DELETE',undefined,student);check(!(await query<any>('SELECT id FROM certificates WHERE id=:id',{id:cert.id})).length,'student owner can delete own certificate');
 await req('/certificates/'+adminCert.id,'DELETE',undefined,admin);check(!(await query<any>('SELECT id FROM certificates WHERE id=:id',{id:adminCert.id})).length,'admin can delete a certificate after student and recruiter are denied');
 await req('/auth/verify-otp','POST',{challenge_id:challenge.challenge_id,otp:correct},'',401);check(true,'OTP cannot be reused');
 await resetOtp(email);
 const exp=(await req('/auth/request-otp','POST',{email,role:'student'})).data;const expCode=code(email);await query("UPDATE otp_challenges SET expires_at=SYSTIMESTAMP-INTERVAL '1' MINUTE WHERE id=:id",{id:exp.challenge_id});
 await req('/auth/verify-otp','POST',{challenge_id:exp.challenge_id,otp:expCode},'',401);check(true,'expired OTP rejected');
 await resetOtp(email);
 const locked=(await req('/auth/request-otp','POST',{email,role:'student'})).data;const real=code(email);const wrong=real==='000000'?'111111':'000000';for(let i=0;i<5;i++)await req('/auth/verify-otp','POST',{challenge_id:locked.challenge_id,otp:wrong},'',401);
 await req('/auth/verify-otp','POST',{challenge_id:locked.challenge_id,otp:real},'',401);check(true,'OTP locks after five incorrect attempts');
 await resetOtp(email);const capturedBefore=getCapturedMail().length;
 const simultaneous=await Promise.all(Array.from({length:6},()=>fetch(base+'/auth/request-otp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,role:'student'})})));
 check(simultaneous.filter(r=>r.status===200).length===1&&simultaneous.filter(r=>r.status===429).length===5&&getCapturedMail().length-capturedBefore===1,'concurrent OTP requests send exactly one code using Oracle lock');
 await req('/auth/logout','POST',{},student);await req('/students/me','GET',undefined,student,401);check(true,'logout revokes Oracle session');
 await req('/does-not-exist','GET',undefined,'',404);check(true,'unknown API route returns JSON 404');
 console.log(`INTEGRATION RESULT: ${passed} checks passed against Oracle. External email was not sent.`);
 if(qaFindings.length){console.error(`QA FINDINGS: ${qaFindings.join(' | ')}`);process.exitCode=1;}
}finally{
 // Only remove this run's synthetic test records. Never truncate/reset user data.
 try{
  for(const email of testEmails){
   const users=await query<any>('SELECT id FROM users WHERE email=:email',{email});
   for(const u of users){
    const uploads=await query<any>('SELECT stored_name FROM uploads WHERE owner_user_id=:id',{id:u.id});for(const upload of uploads)await unlink(`storage/uploads/${upload.stored_name}`).catch(()=>{});
    for(const table of ['placements','internships'])await query(`DELETE FROM ${table} WHERE application_id IN (SELECT a.id FROM applications a JOIN students s ON s.id=a.student_id WHERE s.user_id=:id)`,{id:u.id});
    await query('DELETE FROM hackathon_registrations WHERE student_id IN (SELECT id FROM students WHERE user_id=:id)',{id:u.id});
    await query('DELETE FROM applications WHERE student_id IN (SELECT id FROM students WHERE user_id=:id)',{id:u.id});
   }
   await resetOtp(email);
  }
  for(const id of createdOpportunities)await query('DELETE FROM opportunities WHERE id=:id',{id});
  for(const email of testEmails)await query('DELETE FROM users WHERE email=:email',{email});
  for(const id of createdCompanies)await query('DELETE FROM companies WHERE id=:id',{id});
 }catch(error){console.error('Test cleanup issue:',(error as Error).message);process.exitCode=1;}
 clearCapturedMail();await new Promise<void>(resolve=>server.close(()=>resolve()));await closeDb();
}
