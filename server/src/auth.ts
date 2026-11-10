import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import oracledb from 'oracledb';
import { config, secureCookie } from './config.js';
import { query, transaction } from './db.js';
import { HttpError } from './errors.js';

export type Role = 'student'|'recruiter'|'admin';
export interface Actor { id:number; email:string; full_name:string; role:Role; student_id:number|null; company_id:number|null }
declare global { namespace Express { interface Request { actor?: Actor; sessionToken?: string } } }
export const hash = (s:string) => createHash('sha256').update(s).digest('hex');
const otpHash = (id:string, code:string) => createHmac('sha256',config.sessionSecret).update(`${id}:${code}`).digest('hex');
export function equal(a:string,b:string) { const aa=Buffer.from(a),bb=Buffer.from(b); return aa.length===bb.length && timingSafeEqual(aa,bb); }
export async function authenticate(req:Request,_res:Response,next:NextFunction) {
  try {
    const token=req.cookies?.[config.cookieName]; if (!token) throw new HttpError(401,'Sign in required');
    const rows=await query<any>(`SELECT u.id,u.email,u.full_name,u.role,u.company_id,s.id AS student_id FROM sessions x JOIN users u ON u.id=x.user_id LEFT JOIN students s ON s.user_id=u.id WHERE x.token_hash=:hash AND x.expires_at>SYSTIMESTAMP AND u.is_active=1`,{hash:hash(token)});
    if (!rows[0]) throw new HttpError(401,'Session expired or invalid');
    req.actor=rows[0] as Actor; req.sessionToken=token; next();
  } catch(e) { next(e); }
}
export const requireRole = (...roles:Role[]) => (req:Request,res:Response,next:NextFunction) => {
  const authorize=()=>req.actor&&roles.includes(req.actor.role)?next():next(new HttpError(req.actor?403:401,req.actor?'Forbidden':'Sign in required'));
  if(req.actor)return authorize();
  authenticate(req,res,error=>error?next(error):authorize());
};
export async function setSession(res:Response,userId:number,remember:boolean,secure:boolean) {
  const token=randomBytes(32).toString('hex'); const days=remember?30:1; const hours=remember?720:8;
  await query(`INSERT INTO sessions(id,user_id,token_hash,expires_at,remember_me) VALUES(:id,:actor_user_id,:hash,SYSTIMESTAMP+NUMTODSINTERVAL(:hours,'HOUR'),:remember)`,{id:randomBytes(24).toString('hex'),actor_user_id:userId,hash:hash(token),hours,remember:remember?1:0});
  res.cookie(config.cookieName,token,{httpOnly:true,sameSite:'lax',secure:secureCookie(secure),path:'/',maxAge:remember?days*86400000:undefined});
}
export async function revokeSession(req:Request,res:Response,secure:boolean) { const token=req.cookies?.[config.cookieName]; if(token) await query('DELETE FROM sessions WHERE token_hash=:hash',{hash:hash(token)}); res.clearCookie(config.cookieName,{httpOnly:true,sameSite:'lax',secure:secureCookie(secure),path:'/'}); }
export async function makeChallenge(args:{email:string;role:Role;payload?:unknown;remember:boolean},deliver:(email:string,code:string)=>Promise<void>) {
  if (!config.sessionSecret || Buffer.byteLength(config.sessionSecret)<32) throw new HttpError(503,'Authentication is not configured');
  const email=args.email.trim().toLowerCase();
  if(args.role==='admin' && (!config.bootstrapAdminEmail || email!==config.bootstrapAdminEmail)) throw new HttpError(403,'Administrator sign-in is not available for this account');
  if(args.role!=='admin' && config.bootstrapAdminEmail===email) throw new HttpError(409,'This address is reserved for the placement team');
  const id=randomBytes(24).toString('hex'), code=randomInt(0,1000000).toString().padStart(6,'0');
  const reservation=await transaction(async c=>{
    try { await c.execute(`INSERT INTO otp_email_locks(email,resend_after) VALUES(:email,NULL)`,{email}); }
    catch(e) { if((e as {errorNum?:number})?.errorNum!==1) throw e; }
    const lockResult=await c.execute<any>(`SELECT resend_after FROM otp_email_locks WHERE email=:email FOR UPDATE`,{email},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const lock=lockResult.rows?.[0] as any;
    if(!lock) throw new Error('OTP email lock row could not be acquired');
    const until=lock.RESEND_AFTER??lock.resend_after;
    if(until&&new Date(until).getTime()>Date.now()) return {cooldown:true as const};
    await c.execute(`UPDATE otp_email_locks SET resend_after=SYSTIMESTAMP+INTERVAL '60' SECOND WHERE email=:email`,{email});
    const reservationResult=await c.execute<any>(`SELECT TO_CHAR(resend_after,'YYYY-MM-DD"T"HH24:MI:SS.FF9TZH:TZM') reservation_key FROM otp_email_locks WHERE email=:email`,{email},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const reservationKey=String((reservationResult.rows?.[0] as any)?.RESERVATION_KEY??(reservationResult.rows?.[0] as any)?.reservation_key??'');
    if(!reservationKey) throw new Error('OTP cooldown reservation could not be read');
    await c.execute(`UPDATE otp_challenges SET consumed_at=SYSTIMESTAMP WHERE email=:email AND consumed_at IS NULL`,{email});
    await c.execute(`INSERT INTO otp_challenges(id,email,role,code_hash,expires_at,resend_after,payload_json,remember_me) VALUES(:id,:email,:role,:code_hash,SYSTIMESTAMP+INTERVAL '5' MINUTE,SYSTIMESTAMP+INTERVAL '60' SECOND,:payload,:remember)`,{id,email,role:args.role,code_hash:otpHash(id,code),payload:args.payload?JSON.stringify(args.payload):null,remember:args.remember?1:0});
    return {cooldown:false as const,reservationKey};
  });
  if(reservation.cooldown) throw new HttpError(429,'Please wait before requesting another code');
  try { await deliver(email,code); } catch {
    await transaction(async c=>{
      await c.execute(`DELETE FROM otp_challenges WHERE id=:id`,{id});
      await c.execute(`UPDATE otp_email_locks SET resend_after=NULL WHERE email=:email AND TO_CHAR(resend_after,'YYYY-MM-DD"T"HH24:MI:SS.FF9TZH:TZM')=:reservation_key`,{email,reservation_key:reservation.reservationKey});
    });
    throw new HttpError(503,'Email delivery failed. Check SMTP settings and try again.');
  }
  await query(`UPDATE users SET otp_sent=1,otp_sent_at=SYSTIMESTAMP WHERE email=:email`,{email});
  return {challenge_id:id,expires_in:300,resend_after:60,message:'A verification code was sent to your email.'};
}
export async function verifyChallenge(id:string,code:string) {
  const result = await transaction(async c=>{
    const r=await c.execute<any>(`SELECT id,email,role,code_hash,payload_json,remember_me,attempts,max_attempts FROM otp_challenges WHERE id=:id AND consumed_at IS NULL AND expires_at>SYSTIMESTAMP FOR UPDATE`,{id},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    const row=(r.rows?.[0]??null) as any; if(!row) return {error:'Code expired or already used'};
    const expected=String(row.CODE_HASH ?? row.code_hash); if(!equal(expected,otpHash(id,code))) {
      const attempts=Number(row.ATTEMPTS ?? row.attempts)+1, max=Number(row.MAX_ATTEMPTS ?? row.max_attempts);
      await c.execute(`UPDATE otp_challenges SET attempts=:n,consumed_at=CASE WHEN :n>=max_attempts THEN SYSTIMESTAMP ELSE consumed_at END WHERE id=:id`,{n:attempts,id});
      return {error:attempts>=max?'Too many incorrect codes':'Incorrect code'};
    }
    await c.execute('UPDATE otp_challenges SET consumed_at=SYSTIMESTAMP WHERE id=:id',{id});
    return {email:String(row.EMAIL??row.email),role:String(row.ROLE??row.role) as Role,payload:row.PAYLOAD_JSON??row.payload_json,remember:Boolean(row.REMEMBER_ME??row.remember_me)};
  });
  if ('error' in result && typeof result.error === 'string') throw new HttpError(401,result.error);
  return result;
}
export function encryptAadhaar(value:string):string {
  if(!/^[0-9]{12}$/.test(value)) throw new HttpError(400,'Aadhaar number must contain 12 digits');
  if(!/^[0-9a-fA-F]{64}$/.test(config.aadhaarKey)) throw new HttpError(503,'Aadhaar encryption is not configured');
  const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',Buffer.from(config.aadhaarKey,'hex'),iv), data=Buffer.concat([cipher.update(value),cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${data.toString('hex')}`;
}
export function decryptAadhaar(value:string):string { const [iv,tag,data]=value.split(':');const d=createDecipheriv('aes-256-gcm',Buffer.from(config.aadhaarKey,'hex'),Buffer.from(iv,'hex'));d.setAuthTag(Buffer.from(tag,'hex'));return Buffer.concat([d.update(Buffer.from(data,'hex')),d.final()]).toString(); }
export const hashOtpForTest = otpHash;
