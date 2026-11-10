#!/usr/bin/env node
import {readdir,readFile,stat} from 'node:fs/promises';
import {extname,relative,resolve,sep} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

const root=resolve(process.argv[2]||process.cwd());
const allowedDomains=new Set(['campus.test','example.test','example.invalid','example.com','example.net','example.org','amrita.edu','amrita.org','parswanadh.dev']);
const routeRoots=new Set(['api','auth','login','dashboard','opportunities','opportunity','applications','application','students','student','recruiters','recruiter','companies','company','placements','placement','uploads','upload','certificates','certificate','internships','internship','hackathons','hackathon','reports','report','outcomes','outcome','profile','admin','register','verify','logout','home','roles','role','public','health','search','users','user','details','documents','document','files','file','departments','department','events','event','accounts','account']);
const findings=[];const coverage={textFiles:0,officeXmlEntries:0,syntheticOrganizationSeedEmailsReviewed:0,pdfText:true,videoMetadata:true,gitHistoryExcludedFromContentScan:true};
const isPlaceholder=value=>/^(?:<[^>]+>|\$\{[^}]+\}|\$[A-Z_]+|redacted|removed|change[-_ ]?me|replace[-_ ]?me|your[-_ ].*|example.*|none|null)$/i.test(value.trim());
function scanText(text,path,origin){
 const record=(kind,count)=>{if(count)findings.push({kind,path,origin,count});};
 let homePaths=0;
 for(const match of text.matchAll(/(?:\/home\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\/[^\s/'"`<>]*)?|\/Users\/([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\/[^\s/'"`<>]*)?|[A-Z]:\\Users\\([A-Za-z0-9][A-Za-z0-9._-]{0,63})(?:\\[^\s'"`<>]*)?)/gi)){
  const user=match[1]||match[2]||match[3];if((match[1]||match[2])&&routeRoots.has(user.toLowerCase()))continue;
  if(match[2]){const start=text.lastIndexOf('\n',match.index)+1;const end=text.indexOf('\n',match.index);const line=text.slice(start,end<0?text.length:end);const markdownRoute=/^\s*[-*]?\s*(?:GET|POST|PUT|PATCH|DELETE)\s+[`"']/i.test(line);const sourceRoute=/\brouter\.(?:get|post|put|patch|delete)\s*\(|\b(?:list|req|request|fetch)\s*(?:<[^>]*>)?\s*\(/i.test(line);if((path.endsWith('.md')&&markdownRoute)||(!path.endsWith('.md')&&sourceRoute))continue;}
  homePaths++;
 }
 record('home-path',homePaths);
 let personalEmails=0;
 for(const match of text.matchAll(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/gi)){
  const domain=String(match[1]).toLowerCase();
  const address=match[0],local=address.slice(0,address.lastIndexOf('@')).toLowerCase();
  const institutional=domain.endsWith('.edu')||domain.endsWith('.gov');
  const roleMailbox=/^(?:hr|info|careers?|admin|support|contact|recruitment|recruiting|jobs?|placement|talent|noreply|no-reply|help|office|sales|marketing)[0-9._-]*$/i.test(local);
  const personShaped=/^[a-z]{2,}[._-][a-z]{2,}$/i.test(local);
  const freeProvider=/^(?:gmail\.com|outlook\.com|hotmail\.com|yahoo\.(?:com|in)|icloud\.com)$/i.test(domain);
  const statementStart=Math.max(text.toLowerCase().lastIndexOf('insert into companies',match.index),text.toLowerCase().lastIndexOf('merge into companies',match.index));
  const statementEnd=text.indexOf(';',match.index);
  const seedContext=path==='database/002_seed.sql'&&statementStart>=0&&(statementEnd<0||statementStart<statementEnd);
  const syntheticOrgSeed=seedContext&&!freeProvider&&!personShaped;
  if(syntheticOrgSeed){coverage.syntheticOrganizationSeedEmailsReviewed++;continue;}
  if(!allowedDomains.has(domain)&&![...allowedDomains].some(allowed=>domain.endsWith(`.${allowed}`))&&!(institutional&&!personShaped))personalEmails++;
 }
 record('unapproved-email',personalEmails);
 record('credential-token',[
  ...(text.match(/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{24,})\b/g)||[]),
  ...(text.match(/-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g)||[]),
 ].length);
 let assignedCredentials=0;
 for(const match of text.matchAll(/\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|smtp[_-]?pass(?:word)?|oracle[_-]?password|jwt[_-]?secret)\s*[:=]\s*["'`]?([^\s"'`,;]{8,})/gi)){
  const candidate=match[1];const assignmentLine=text.slice(match.index).split('\n',1)[0];const dynamicTemplate=/:\s*`[^`]*\$\{\s*randomBytes\s*\(/i.test(assignmentLine);
  if(!dynamicTemplate&&!isPlaceholder(candidate)&&!/^(?:process\.env\.|config\.|env\.|randomBytes\()/i.test(candidate)&&!/^[A-Za-z_$][\w.$]*$/.test(candidate))assignedCredentials++;
 }
 record('credential-assignment',assignedCredentials);
}
async function filesIn(directory){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(entry.name==='.git')continue;
  const path=resolve(directory,entry.name);
  if(entry.isSymbolicLink()){findings.push({kind:'symlink',path:relative(root,path)});continue;}
  if(entry.isDirectory())result.push(...await filesIn(path));else if(entry.isFile())result.push(path);
 }
 return result;
}
function commandExists(command){return spawnSync('sh',['-c',`command -v ${command}`],{encoding:'utf8'}).status===0;}
const files=await filesIn(root);
for(const file of files){
 const path=relative(root,file).split(sep).join('/');
 if(/(^|\/)(?:\.env(?:\.|$)|storage|uploads|test-results|node_modules|\.runtimecache|frames|cookies?|raw-logs?)(\/|$)/i.test(path))findings.push({kind:'excluded-runtime-file',path});
 const ext=extname(file).toLowerCase();
 if(['.pptx','.docx','.xlsx'].includes(ext)){
  const names=execFileSync('unzip',['-Z','-1',file],{encoding:'utf8',maxBuffer:4*1024*1024}).split(/\r?\n/).filter(name=>/\.(?:xml|rels|txt)$/i.test(name));
  for(const name of names){const escaped=name.replace(/([\[\]*?])/g,'\\$1');const bytes=execFileSync('unzip',['-p',file,escaped],{encoding:'buffer',maxBuffer:20*1024*1024});scanText(bytes.toString('utf8'),path,`zip:${name}`);coverage.officeXmlEntries++;}
  continue;
 }
 if(ext==='.pdf'){
  if(!commandExists('pdftotext')){coverage.pdfText=false;continue;}
  const bytes=execFileSync('pdftotext',['-layout',file,'-'],{encoding:'buffer',maxBuffer:24*1024*1024});scanText(bytes.toString('utf8'),path,'pdf-text');
  const info=execFileSync('pdfinfo',[file],{encoding:'utf8',maxBuffer:1024*1024});scanText(info,path,'pdf-metadata');continue;
 }
 if(ext==='.mp4'){
  if(!commandExists('ffprobe')){coverage.videoMetadata=false;continue;}
  const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{encoding:'utf8',maxBuffer:4*1024*1024}));
  if(metadata.format)delete metadata.format.filename;
  scanText(JSON.stringify(metadata),path,'video-metadata');continue;
 }
 const bytes=await readFile(file);
 if(bytes.includes(0))continue;
 coverage.textFiles++;scanText(bytes.toString('utf8'),path,'text');
}
const summary={rootLabel:'.',filesScanned:files.length,coverage,findings,passed:findings.length===0};
console.log(JSON.stringify(summary,null,2));
if(findings.length)process.exitCode=1;
