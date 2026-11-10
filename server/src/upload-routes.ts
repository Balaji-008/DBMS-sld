import { Router } from 'express';
import multer from 'multer';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { config } from './config.js';
import { query } from './db.js';
import { HttpError } from './errors.js';
import { authenticate } from './auth.js';

const router=Router();router.use(authenticate);
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1},fileFilter:(_req,file,cb)=>{if(['application/pdf','image/jpeg','image/png'].includes(file.mimetype))cb(null,true);else cb(new HttpError(400,'Only PDF, JPEG, and PNG files are allowed'));}});
function magic(buffer:Buffer,mime:string){if(mime==='application/pdf')return buffer.subarray(0,5).toString()==='%PDF-';if(mime==='image/jpeg')return buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff;if(mime==='image/png')return buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));return false;}
const idPattern=/^[a-f0-9]{48}$/;
router.post('/',upload.single('file'),async(req,res,next)=>{try{if(!req.file)throw new HttpError(400,'A file is required');if(!magic(req.file.buffer,req.file.mimetype))throw new HttpError(400,'File contents do not match the selected file type');const kind=String(req.body.kind??'resume');if(!['resume','aadhaar','certificate'].includes(kind))throw new HttpError(400,'Invalid upload kind');const id=randomBytes(24).toString('hex'),stored=`${randomBytes(24).toString('hex')}.${req.file.mimetype==='application/pdf'?'pdf':req.file.mimetype==='image/png'?'png':'jpg'}`;const original=basename(req.file.originalname).replace(/[\r\n\0]/g,'').slice(0,255)||'upload';await mkdir(config.uploadDir,{recursive:true});const path=`${config.uploadDir}/${stored}`;await writeFile(path,req.file.buffer,{flag:'wx',mode:0o600});try{await query(`INSERT INTO uploads(id,owner_user_id,original_name,stored_name,mime_type,size_bytes,kind) VALUES(:id,:owner,:original,:stored,:mime,:file_size_value,:kind)`,{id,owner:req.actor!.id,original,stored,mime:req.file.mimetype,file_size_value:req.file.size,kind});}catch(e){await unlink(path).catch(()=>{});throw e;}res.status(201).json({url:`/api/uploads/${id}`,name:original});}catch(e){next(e);}});
router.get('/:id',async(req,res,next)=>{try{const id=String(req.params.id);if(!idPattern.test(id))throw new HttpError(404,'Upload not found');const rows=await query<any>('SELECT id,owner_user_id,original_name,stored_name,mime_type,kind FROM uploads WHERE id=:id',{id});if(!rows.length)throw new HttpError(404,'Upload not found');const f=rows[0],owner=Number(f.owner_user_id)===req.actor!.id,actor=req.actor!;let allowed=actor.role==='admin'||owner;
 if(actor.role==='student'&&!allowed&&f.kind==='certificate'){const linked=await query<any>(`SELECT 1 ok FROM certificates c JOIN students s ON s.id=c.student_id WHERE s.id=:student AND c.certificate_url=:url FETCH FIRST 1 ROWS ONLY`,{student:actor.student_id,url:`/api/uploads/${id}`});allowed=linked.length>0;}
 if(actor.role==='recruiter'){
  allowed=false;
  if(f.kind==='resume'){const access=await query<any>(`SELECT 1 ok FROM students s JOIN applications a ON a.student_id=s.id JOIN opportunities o ON o.id=a.opportunity_id WHERE s.user_id=:owner AND o.company_id=:company FETCH FIRST 1 ROWS ONLY`,{owner:f.owner_user_id,company:actor.company_id});allowed=access.length>0;}
  else if(f.kind==='certificate'){const access=await query<any>(`SELECT 1 ok FROM certificates c JOIN students s ON s.id=c.student_id JOIN applications a ON a.student_id=s.id JOIN opportunities o ON o.id=a.opportunity_id WHERE c.certificate_url=:url AND o.company_id=:company FETCH FIRST 1 ROWS ONLY`,{url:`/api/uploads/${id}`,company:actor.company_id});allowed=access.length>0;}
 }
 if(!allowed)throw new HttpError(404,'Upload not found');const content=await readFile(`${config.uploadDir}/${f.stored_name}`);res.setHeader('Content-Type',f.mime_type);res.setHeader('Content-Disposition',`inline; filename="${String(f.original_name).replace(/["\\\r\n]/g,'_')}"`);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','private, no-store');res.send(content);}catch(e){next(e);}});
export default router;
