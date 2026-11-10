import express, { type Express, type Request } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { config, smtpConfigured } from './config.js';
import { query } from './db.js';
import authRoutes from './auth-routes.js';
import routes from './routes.js';
import uploadRoutes from './upload-routes.js';
import { errorHandler, HttpError } from './errors.js';

function originAllowed(origin:string){try{const u=new URL(origin);const p=config.publicUrl?new URL(config.publicUrl):null;return (p&&u.origin===p.origin)||((u.hostname==='localhost'||u.hostname==='127.0.0.1')&&(u.port==='3000'||(config.nodeEnv==='development'&&u.port==='5173'))&&u.protocol==='http:');}catch{return false;}}
function constantEqual(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
export function createApp():Express {
 const app=express();app.set('trust proxy','loopback');
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com','data:'],imgSrc:["'self'",'data:','blob:'],connectSrc:["'self'"],objectSrc:["'none'"],baseUri:["'self'"],frameAncestors:["'none'"]}}}));
 app.use(express.json({limit:'1mb'}));app.use(cookieParser());
 app.use((req,res,next)=>{
  const edgePresent=Boolean(req.get('cf-connecting-ip'))||(!['localhost','127.0.0.1'].includes((req.hostname||'').toLowerCase())&&req.get('x-forwarded-host'));
  if(edgePresent&&(!config.originAuthToken||!constantEqual(req.get('x-origin-auth')??'',config.originAuthToken)))return res.status(403).json({error:'Origin authentication failed'});
  if(['POST','PUT','PATCH','DELETE'].includes(req.method)){const origin=req.get('origin');if(origin&&!originAllowed(origin))return res.status(403).json({error:'Request origin is not allowed'});}
  next();
 });
 app.get('/api/health',async(_req,res)=>{try{await query('SELECT 1 AS ok FROM dual');res.json({status:'ok',database:'connected',smtp_configured:smtpConfigured,mail_transport:config.mailTransport==='json'&&config.nodeEnv==='test'?'json':'smtp'});}catch{res.status(503).json({error:'Oracle database unavailable'});}});
 app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false,skip:req=>req.method!=='POST'||req.path==='/logout'}),authRoutes);
 app.use('/api/uploads',uploadRoutes);
 app.use('/api',routes);
 app.use('/api',(req,res)=>res.status(404).json({error:`No API route for ${req.method} ${req.path}`}));
 const clientDist=resolve('client/dist');if(existsSync(clientDist)){app.use(express.static(clientDist,{index:false,fallthrough:true}));app.get(/^(?!\/api(?:\/|$)).*/,(_req,res,next)=>{res.sendFile(resolve(clientDist,'index.html'),e=>e&&next(e));});}
 app.use(errorHandler);return app;
}
