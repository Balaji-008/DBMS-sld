// Remove only namespaced synthetic records left by failed local integration runs.
// Never reset/truncate the database, and never match real account email domains.
import 'dotenv/config';
import oracledb from 'oracledb';
import { unlink } from 'node:fs/promises';
import { initDb,closeDb,query,transaction } from '../server/src/db.js';

await initDb();
try{
 const users=await query<any>("SELECT id FROM users WHERE email LIKE 'integration-%@campus.test'");
 const companies=await query<any>("SELECT id FROM companies WHERE name LIKE 'Integration Company %' OR name LIKE 'Integration Recruiter Co %'");
 const uploads=[];
 for(const user of users)uploads.push(...await query<any>('SELECT stored_name FROM uploads WHERE owner_user_id=:id',{id:user.id}));
 await transaction(async c=>{
  const ids=companies.map(x=>Number(x.id));
  for(const id of ids){
   for(const table of ['placements','internships'])await c.execute(`DELETE FROM ${table} WHERE application_id IN (SELECT a.id FROM applications a JOIN opportunities o ON o.id=a.opportunity_id WHERE o.company_id=:id)`,{id});
   await c.execute('DELETE FROM applications WHERE opportunity_id IN (SELECT id FROM opportunities WHERE company_id=:id)',{id});
   await c.execute('DELETE FROM opportunities WHERE company_id=:id',{id});
  }
  for(const user of users){
   for(const table of ['placements','internships'])await c.execute(`DELETE FROM ${table} WHERE application_id IN (SELECT a.id FROM applications a JOIN students s ON s.id=a.student_id WHERE s.user_id=:id)`,{id:user.id});
   await c.execute('DELETE FROM applications WHERE student_id IN (SELECT id FROM students WHERE user_id=:id)',{id:user.id});
   await c.execute('DELETE FROM hackathon_registrations WHERE student_id IN (SELECT id FROM students WHERE user_id=:id)',{id:user.id});
   await c.execute('DELETE FROM users WHERE id=:id',{id:user.id});
  }
  for(const id of ids)await c.execute('DELETE FROM companies WHERE id=:id',{id});
  await c.execute("DELETE FROM otp_challenges WHERE email LIKE 'integration-%@campus.test'");
  await c.execute("DELETE FROM otp_email_locks WHERE email LIKE 'integration-%@campus.test'");
 });
 for(const file of uploads)await unlink(`storage/uploads/${file.stored_name}`).catch(()=>{});
 console.log(`Removed ${users.length} stale synthetic test users and ${companies.length} stale synthetic test companies. Seed and real records preserved.`);
}finally{await closeDb();}
