import 'dotenv/config';
import oracledb from 'oracledb';
import { readFile } from 'node:fs/promises';
import { mkdir,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

if (!process.env.ORACLE_USER || !process.env.ORACLE_PASSWORD) throw new Error('Run npm run db:provision or configure Oracle credentials in .env.');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const connection = await oracledb.getConnection({ user: process.env.ORACLE_USER, password: process.env.ORACLE_PASSWORD, connectString: process.env.ORACLE_CONNECT_STRING });
try {
  for (const name of ['001_schema.sql', '002_seed.sql']) {
    const text = await readFile(new URL(`../database/${name}`, import.meta.url), 'utf8');
    const statements = text.split(/^-- @statement\s*$/m).map(s=>s.trim()).filter(s=>s && !s.split('\n').every(line=>!line.trim()||line.trim().startsWith('--')));
    let count = 0;
    for (let statement of statements) {
      // SQL MERGE needs no trailing semicolon in the driver; PL/SQL blocks do.
      if (!/^\s*(?:--[^\n]*\n\s*)*(?:BEGIN|DECLARE)\b/i.test(statement)) statement = statement.replace(/;\s*$/, '');
      try { await connection.execute(statement); count++; }
      catch (error) { throw new Error(`${name} statement ${count+1}: ${(error as Error).message}`); }
    }
    await connection.commit();
    console.log(`${name}: ${count} statements applied.`);
  }
  // Demonstration credentials have real protected sample documents, not broken URLs.
  const sampleCertificates=await connection.execute<any>(`SELECT c.id,c.credential_id,c.certificate_name,s.user_id FROM certificates c JOIN students s ON s.id=c.student_id JOIN users u ON u.id=s.user_id WHERE c.credential_id IN ('DEMO-CLOUD-001','DEMO-EMBED-012','DEMO-DATA-013') AND u.email LIKE '%@campus.test'`);
  const uploadsPath=resolve(process.env.UPLOAD_DIR||'storage/uploads');
  await mkdir(uploadsPath,{recursive:true});
  for(const row of sampleCertificates.rows??[]){
    const id=createHash('sha256').update(`campusbridge-sample:${row.CREDENTIAL_ID}`).digest('hex').slice(0,48);
    const stored=`demo-${id}.pdf`;
    const escape=(s:string)=>s.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
    const lines=['CampusBridge - demonstration certificate',String(row.CERTIFICATE_NAME),'Sample learning record for the demonstration dataset.','This is not a verified or issued qualification.'];
    const stream=`BT /F1 18 Tf 60 760 Td (${escape(lines[0])}) Tj /F1 12 Tf 0 -44 Td (${escape(lines[1])}) Tj 0 -32 Td (${escape(lines[2])}) Tj 0 -26 Td (${escape(lines[3])}) Tj ET`;
    const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
    let pdf='%PDF-1.4\n';const offsets=[0];
    objects.forEach((value,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${value}\nendobj\n`;});
    const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(x=>`${String(x).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    await writeFile(resolve(uploadsPath,stored),pdf,{mode:0o600});
    await connection.execute(`MERGE INTO uploads x USING (SELECT :upload_id id FROM dual) q ON (x.id=q.id) WHEN NOT MATCHED THEN INSERT (id,owner_user_id,original_name,stored_name,mime_type,size_bytes,kind) VALUES(q.id,:owner_id,:original_name,:stored_filename,'application/pdf',:file_size,'certificate')`,{upload_id:id,owner_id:row.USER_ID,original_name:'Sample learning record.pdf',stored_filename:stored,file_size:Buffer.byteLength(pdf)});
    await connection.execute('UPDATE certificates SET certificate_url=:document_url WHERE id=:certificate_id',{document_url:`/api/uploads/${id}`,certificate_id:row.ID});
  }
  await connection.execute(`UPDATE students s SET placement_status='placed' WHERE EXISTS (SELECT 1 FROM placements p JOIN applications a ON a.id=p.application_id WHERE a.student_id=s.id) AND EXISTS (SELECT 1 FROM users u WHERE u.id=s.user_id AND u.email LIKE '%@campus.test')`);
  await connection.execute(`UPDATE students s SET internship_status='interned' WHERE EXISTS (SELECT 1 FROM internships i JOIN applications a ON a.id=i.application_id WHERE a.student_id=s.id) AND EXISTS (SELECT 1 FROM users u WHERE u.id=s.user_id AND u.email LIKE '%@campus.test')`);
  await connection.commit();
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) throw new Error('BOOTSTRAP_ADMIN_EMAIL must be an email address.');
    await connection.execute(`MERGE INTO users u USING (SELECT :email email FROM dual) s ON (u.email=s.email)
      WHEN NOT MATCHED THEN INSERT (email,full_name,role,is_active) VALUES (s.email,'Placement administrator','admin',1)`, { email: adminEmail });
    await connection.commit();
    console.log('Bootstrap administrator configured from local environment. Existing roles were not changed.');
  }
  for (const table of ['DEPARTMENTS','COMPANIES','USERS','STUDENTS','OPPORTUNITIES','APPLICATIONS','PLACEMENTS','INTERNSHIPS','HACKATHONS','CERTIFICATES']) {
    const result=await connection.execute(`SELECT COUNT(*) AS total FROM ${table}`);
    console.log(`${table}: ${(result.rows?.[0] as {TOTAL:number}).TOTAL}`);
  }
} catch (error) { await connection.rollback(); throw error; }
finally { await connection.close(); }
