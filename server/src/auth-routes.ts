import { Router, type Request } from 'express';
import { z } from 'zod';
import { authenticate, makeChallenge, revokeSession, setSession, verifyChallenge, type Actor } from './auth.js';
import { config, smtpConfigured } from './config.js';
import { query, transaction } from './db.js';
import { sendOtp } from './mail.js';
import { HttpError } from './errors.js';
import oracledb from 'oracledb';

const router=Router();
const asyncRoute=(fn:(req:any,res:any)=>Promise<unknown>)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res)).catch(next);
const emailSchema=z.string().trim().email().max(320).transform(v=>v.toLowerCase());
const challengeShape={challenge_id:z.string().min(1).max(64),otp:z.string().regex(/^\d{6}$/)};
function actorUser(rows:any[]):Actor {const r=rows[0];return {id:Number(r.id),email:r.email,full_name:r.full_name,role:r.role,student_id:r.student_id==null?null:Number(r.student_id),company_id:r.company_id==null?null:Number(r.company_id)}}
async function createUser(email:string,fullName:string,role:'student'|'recruiter',payload:any) {
 return transaction(async c=>{
  const existing=await c.execute<any>('SELECT id FROM users WHERE email=:email',{email},{outFormat:oracledb.OUT_FORMAT_OBJECT}); if(existing.rows?.length) throw new HttpError(409,'An account already exists for this email');
  let companyId:number|null=null;
  if(role==='recruiter') {
   const name=String(payload.company_name).trim(); const code=`REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
   const x=await c.execute<any>(`INSERT INTO companies(name,company_code) VALUES(:name,:code) RETURNING id INTO :id`,{name,code,id:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}}); companyId=Number((x.outBinds as any).id[0]);
  }
  const x=await c.execute<any>(`INSERT INTO users(email,full_name,role,department_id,company_id,is_active,otp_sent,otp_sent_at) VALUES(:email,:name,:role,:department,:company,:active,1,SYSTIMESTAMP) RETURNING id INTO :id`,{email,name:fullName,role,department:role==='student'?Number(payload.department_id):null,company:companyId,active:role==='student'?1:0,id:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER}});
  const uid=Number((x.outBinds as any).id[0]);
  if(role==='student') await c.execute(`INSERT INTO students(user_id,roll_number,department_id) VALUES(:actor_user_id,:roll,:dept)`,{actor_user_id:uid,roll:String(payload.roll_number).trim(),dept:Number(payload.department_id)});
  return {id:uid,pending:role==='recruiter'};
 });
}
router.get('/config',(_req,res)=>res.json({smtp_configured:smtpConfigured,registration_enabled:true,otp_expiry_seconds:300,resend_after:60}));
router.get('/me',authenticate,asyncRoute(async(req,res)=>res.json({user:req.actor})));
router.post('/request-otp',asyncRoute(async(req,res)=>{
 const parsed=z.object({email:emailSchema,role:z.enum(['student','recruiter','admin']),remember_me:z.boolean().optional()}).safeParse(req.body);if(!parsed.success) throw new HttpError(400,parsed.error.issues[0]?.message??'Invalid request');
 const {email,role,remember_me}=parsed.data;const users=await query<any>('SELECT id,is_active,role FROM users WHERE email=:email',{email});
 if(!users.length) throw new HttpError(404,'No account found. Register to continue.');
 if(users[0].role!==role) throw new HttpError(403,'This account uses a different role.');
 if(Number(users[0].is_active)!==1) throw new HttpError(403,'This account is awaiting placement-team approval.');
 const result=await makeChallenge({email,role,remember:Boolean(remember_me)},sendOtp);res.json(result);
}));
router.post('/register',asyncRoute(async(req,res)=>{
 const parsed=z.object({email:emailSchema,full_name:z.string().trim().min(2).max(180),role:z.enum(['student','recruiter']),roll_number:z.string().trim().min(1).max(40).optional(),department_id:z.number().int().positive().optional(),company_name:z.string().trim().min(2).max(180).optional()}).safeParse(req.body);if(!parsed.success) throw new HttpError(400,parsed.error.issues[0]?.message??'Invalid registration');
 const p=parsed.data;if(p.role==='student'&&(!p.roll_number||!p.department_id)) throw new HttpError(400,'Student registration requires roll number and department.');if(p.role==='recruiter'&&!p.company_name) throw new HttpError(400,'Recruiter registration requires company name.');
 const taken=await query<any>('SELECT id FROM users WHERE email=:email',{email:p.email});if(taken.length) throw new HttpError(409,'An account already exists for this email');
 if(p.role==='student') {const d=await query<any>('SELECT id FROM departments WHERE id=:id',{id:p.department_id});if(!d.length) throw new HttpError(400,'Unknown department');}
 const payload={full_name:p.full_name,roll_number:p.roll_number,department_id:p.department_id,company_name:p.company_name};
 res.json(await makeChallenge({email:p.email,role:p.role,payload,remember:false},sendOtp));
}));
router.post('/verify-otp',asyncRoute(async(req,res)=>{
 const parsed=z.object(challengeShape).safeParse(req.body);if(!parsed.success) throw new HttpError(400,'Challenge ID and six-digit code are required');
 const challenge=await verifyChallenge(parsed.data.challenge_id,parsed.data.otp);
 let userRows:any[]=[];let pending=false;
 if(challenge.payload) {
  let payload:any;try {payload=JSON.parse(String(challenge.payload));} catch {throw new HttpError(400,'Registration details are invalid');}
  const created=await createUser(challenge.email,payload.full_name,challenge.role as 'student'|'recruiter',payload);pending=created.pending;
  if(pending) return res.json({pending_approval:true,message:'Your company registration is awaiting placement-team approval.'});
 }
 userRows=await query<any>(`SELECT u.id,u.email,u.full_name,u.role,u.company_id,s.id AS student_id FROM users u LEFT JOIN students s ON s.user_id=u.id WHERE u.email=:email AND u.is_active=1`,{email:challenge.email});
 if(!userRows.length) throw new HttpError(403,'This account is not active');
 await setSession(res,Number(userRows[0].id),challenge.remember,req.secure);res.json({user:actorUser(userRows)});
}));
router.post('/logout',asyncRoute(async(req,res)=>{await revokeSession(req,res,req.secure);res.json({ok:true});}));

export async function bootstrapAdmin() {
 if(!config.bootstrapAdminEmail) return;
 const found=await query<any>('SELECT id,role FROM users WHERE email=:email',{email:config.bootstrapAdminEmail});
 if(found.length) {if(found[0].role!=='admin') throw new Error('BOOTSTRAP_ADMIN_EMAIL belongs to a non-admin user');return;}
 await query(`INSERT INTO users(email,full_name,role,is_active) VALUES(:email,'Placement Team','admin',1)`,{email:config.bootstrapAdminEmail});
}
export default router;
