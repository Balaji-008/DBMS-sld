import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import nodemailer from 'nodemailer';
import {buildOtpEmail} from '../server/src/email-template.js';

let checks=0;
function check(value:unknown,label:string){assert(value,label);checks++;console.log('PASS',label);}
const email=buildOtpEmail({code:'123456',portalUrl:'https://dbms.sld.parswanadh.dev/login'});
check(email.subject.includes('Amrita Placement Portal'),'email subject uses the new brand');
check(email.text.includes('123456')&&email.html.includes('123456'),'continuous six-digit code is present in text and HTML');
check(email.text.includes('5 minutes')&&email.html.includes('5 minutes'),'code expiry is explicit in both versions');
check(email.html.includes('https://dbms.sld.parswanadh.dev/login'),'email links to the configured public portal');
check(!email.html.includes('CampusBridge')&&!email.text.includes('CampusBridge'),'no previous user-facing brand in email');
check(!/<script|onerror=|onclick=/i.test(email.html),'email has no executable browser content');
check(!/display\s*:\s*(?:grid|flex)/i.test(email.html),'email core layout is compatible table markup');
let preview=email.html;
for(const attachment of email.attachments){
 const path=String(attachment.path??'');check(existsSync(path),'CID attachment file exists');
 check(Boolean(attachment.cid)&&email.html.includes('cid:'+attachment.cid),'attachment CID matches rendered HTML');
 preview=preview.replaceAll('cid:'+attachment.cid,`data:${attachment.contentType};base64,${readFileSync(path).toString('base64')}`);
}
for(const code of ['12345','1234567','<html>','12345a'])assert.throws(()=>buildOtpEmail({code,portalUrl:'https://example.test/'}));check(true,'invalid OTP values are rejected');
for(const portalUrl of ['javascript:alert(1)','data:text/html,bad','https://user:password@example.test/','invalid'])assert.throws(()=>buildOtpEmail({code:'123456',portalUrl}));check(true,'unsafe or malformed portal URLs are rejected');
const escaped=buildOtpEmail({code:'123456',portalUrl:'https://example.test/?a=1&b=2'});
check(escaped.html.includes('&amp;b=2'),'HTML-bound portal URL is escaped');
const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});
const mime=await transport.sendMail({from:'Amrita Placement Portal <preview@example.invalid>',to:'preview@example.invalid',...email});
const message=String(mime.message);
check(message.includes('Content-ID: <amrita-placement-portal-logo>'),'local MIME output contains the embedded logo');
check(message.includes('multipart/alternative')&&message.includes('text/plain')&&message.includes('text/html'),'local MIME includes plain-text and HTML alternatives');
await mkdir('test-results',{recursive:true});
await writeFile('test-results/amrita-email-preview.html',preview);
await writeFile('test-results/amrita-email-preview.eml',mime.message);
console.log(`BRAND EMAIL RESULT: ${checks} checks passed; local preview only, no external email sent.`);
