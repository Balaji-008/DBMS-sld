#!/usr/bin/env node
import {mkdir, readFile, lstat, realpath, writeFile} from 'node:fs/promises';
import {dirname, extname, resolve, sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const projectRoot=resolve(import.meta.dirname,'../..');
const target=resolve(process.argv[2]||resolve(projectRoot,'../DBMS-sld-public'));
const dryRun=process.argv.includes('--dry-run');
const allowedDomains=new Set(['campus.test','example.test','example.invalid','example.com','example.net','example.org','amrita.edu','amrita.org','parswanadh.dev']);
const routeRoots=new Set(['api','auth','login','dashboard','opportunities','opportunity','applications','application','students','student','recruiters','recruiter','companies','company','placements','placement','uploads','upload','certificates','certificate','internships','internship','hackathons','hackathon','reports','report','outcomes','outcome','profile','admin','register','verify','logout','home','roles','role','public','health','search','users','user','details','documents','document','files','file','departments','department','events','event','accounts','account']);
const excluded=(path)=>{
 const p=path.split(sep).join('/');
 return p==='.git'||p.startsWith('.git/')||p==='node_modules'||p.startsWith('node_modules/')||
  p==='storage'||p.startsWith('storage/')||p==='uploads'||p.startsWith('uploads/')||
  p==='test-results'||p.startsWith('test-results/')||p==='.runtimecache'||p.startsWith('.runtimecache/')||
  p==='frames'||p.startsWith('frames/')||p.split('/').some(part=>/^\.env(?:\.|$)/i.test(part))||
  (/^\.superpowers\/sdd\/oracle-portal\/review-package[^/]*\.patch$/i.test(p))||
  /(^|\/)(?:raw-logs?|logs?|cookies?)(\/|$)/i.test(p)||
  /(^|\/)(?:course-papers?|textbooks?)(\/|$)/i.test(p);
};
const entries=execFileSync('git',['-C',projectRoot,'ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean).filter(path=>!excluded(path));
const rootReal=await realpath(projectRoot);
if(target===projectRoot||target.startsWith(projectRoot+sep))throw new Error('Export target must be outside the private project checkout.');
try{await lstat(target);throw new Error('Export target already exists; refusing to overwrite it.');}catch(error){if(error?.code!=='ENOENT')throw error;}
const redactions={projectRootPaths:0,homePaths:0,personalEmails:0,staticOraclePasswordDefaults:0,uiExampleEmailPlaceholders:0,files:[]};
const textExt=new Set(['.md','.mdx','.txt','.json','.html','.htm','.css','.scss','.js','.mjs','.cjs','.ts','.tsx','.jsx','.sql','.yml','.yaml','.xml','.svg','.csv','.sh','.py','.toml','.ini','.conf','.prisma']);
const executableExt=new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.sql','.sh','.py']);
function isApiRouteString(text,index,path){
 const start=text.lastIndexOf('\n',index)+1;const end=text.indexOf('\n',index);const line=text.slice(start,end<0?text.length:end);
 if(extname(path).toLowerCase()==='.md')return /^\s*[-*]?\s*(?:GET|POST|PUT|PATCH|DELETE)\s+[`"']/i.test(line);
 return /\brouter\.(?:get|post|put|patch|delete)\s*\(|\b(?:list|req|request|fetch)\s*(?:<[^>]*>)?\s*\(/i.test(line);
}
function sanitize(text,path){
 const homePattern=/(?:\/home\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\/[^\s/'"`<>]*)?|\/Users\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\/[^\s/'"`<>]*)?|[A-Z]:\\Users\\([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\\[^\s'"`<>]*)?)/g;
 const homePaths=[...text.matchAll(homePattern)].filter(match=>!((match[1]||match[2])&&routeRoots.has((match[1]||match[2]).toLowerCase()))&&!(match[2]&&isApiRouteString(text,match.index,path)));
 if(homePaths.length&&executableExt.has(extname(path).toLowerCase()))throw new Error(`Non-portable absolute home path in executable source: ${path}`);
 let projectRootPaths=0,genericHomePaths=0,personalEmails=0,staticOraclePasswordDefaults=0,uiExampleEmailPlaceholders=0;
 text=text.replaceAll(projectRoot,()=>{projectRootPaths++;return '$PROJECT_ROOT';});
 text=text.replace(homePattern,(whole,unixUser,macUser,_windowsUser,index)=>{if((unixUser||macUser)&&routeRoots.has((unixUser||macUser).toLowerCase()))return whole;if(macUser&&isApiRouteString(text,index,path))return whole;genericHomePaths++;return '$HOME';});
 // Human-facing release text has no need to retain individual email addresses. Preserve the app's
 // synthetic test identities and institutional/public project domains; redact other addresses.
 if(/\.mdx?$|\.txt$/i.test(path)){
  text=text.replace(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/gi,(whole,domain)=>{
   const normalized=String(domain).toLowerCase();
   if(allowedDomains.has(normalized)||[...allowedDomains].some(allowed=>normalized.endsWith(`.${allowed}`)))return whole;
   personalEmails++;return '[redacted email]';
  });
 }
 if(path==='scripts/provision.mjs')text=text.replace(/(\bORACLE_PASSWORD\s*:\s*)(['"`])((?:\\.|(?!\2)[^\\])*?)\2/, (whole,prefix,quote,body)=>{if(quote==='`'&&/\$\{[^}]+\}/.test(body))return whole;staticOraclePasswordDefaults++;return `${prefix}randomBytes(32).toString('base64url')`;});
 if(path==='client/src/pages/Login.tsx')text=text.replace(/(placeholder\s*=\s*)(["'])([^"'<>]*@[A-Z0-9.-]+\.[A-Z]{2,})\2/gi,(whole,prefix,quote)=>{uiExampleEmailPlaceholders++;return `${prefix}${quote}name@example.com${quote}`;});
 const totals={projectRootPaths,genericHomePaths,personalEmails,staticOraclePasswordDefaults,uiExampleEmailPlaceholders};
 for(const [key,value] of Object.entries(totals))redactions[key==='projectRootPaths'?'projectRootPaths':key==='genericHomePaths'?'homePaths':key==='personalEmails'?'personalEmails':key==='staticOraclePasswordDefaults'?'staticOraclePasswordDefaults':'uiExampleEmailPlaceholders']+=value;
 if(Object.values(totals).some(Boolean))redactions.files.push({path,transformations:totals});
 return text;
}
const copied=[];
if(!dryRun)await mkdir(target,{recursive:false});
for(const rel of entries){
 const source=resolve(projectRoot,rel);
 const stat=await lstat(source);
 if(stat.isSymbolicLink()){
  const actual=await realpath(source);
  if(actual!==rootReal&&!actual.startsWith(rootReal+sep))throw new Error(`Project symlink points outside source tree: ${rel}`);
  throw new Error(`Review project symlink before exporting: ${rel}`);
 }
 if(!stat.isFile())continue;
 const destination=resolve(target,rel);
 if(!destination.startsWith(target+sep))throw new Error(`Invalid relative path: ${rel}`);
 const bytes=await readFile(source);let output=bytes;
 if(textExt.has(extname(rel).toLowerCase())&&!bytes.includes(0))output=Buffer.from(sanitize(bytes.toString('utf8'),rel));
 copied.push({path:rel,sourceSha256:createHash('sha256').update(bytes).digest('hex'),exportSha256:createHash('sha256').update(output).digest('hex'),bytes:output.length});
 if(!dryRun){await mkdir(dirname(destination),{recursive:true});await writeFile(destination,output,{flag:'wx'});}
}
const summary={mode:dryRun?'dry-run':'export',projectFiles:copied.length,excludedClasses:['environment files','storage/uploads','raw logs','cookies','test-results','node_modules','runtime caches','render frames','course papers/textbooks','Git history','obsolete internal Oracle review-package patches (contain private code snapshots and configured contact/credential examples)'],redactions,reviewHashInterpretation:'Hashes preserved inside EGM/review reports identify the original review inputs and bytes. They do not claim that redacted exported files have those hashes. Per-file source and export SHA-256 values here show the transformation at export time.',files:copied};
if(!dryRun)await writeFile(resolve(target,'PUBLIC-EXPORT-MANIFEST.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({mode:summary.mode,projectFiles:summary.projectFiles,excludedClasses:summary.excludedClasses,redactions:summary.redactions,reviewHashInterpretation:summary.reviewHashInterpretation},null,2));
