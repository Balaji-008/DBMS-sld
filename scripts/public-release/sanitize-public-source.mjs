#!/usr/bin/env node
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(process.argv[2]||process.cwd());
const loginPath='client/src/pages/Login.tsx';
const loginFile=resolve(root,loginPath);const manifestPath=resolve(root,'PUBLIC-EXPORT-MANIFEST.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const loginEntry=manifest.files.find(item=>item.path===loginPath);
if(!loginEntry)throw new Error('Public export manifest is missing the approved login source.');
let login=await readFile(loginFile,'utf8');let emailPlaceholderReplacements=0;
login=login.replace(/(placeholder\s*=\s*)(["'])([^"'<>]*@[A-Z0-9.-]+\.[A-Z]{2,})\2/gi,(whole,prefix,quote)=>{emailPlaceholderReplacements++;return `${prefix}${quote}name@example.com${quote}`;});
if(emailPlaceholderReplacements!==1)throw new Error(`Expected one email-format UI placeholder; replaced ${emailPlaceholderReplacements}.`);
await writeFile(loginFile,login);
const loginBytes=Buffer.from(login);loginEntry.exportSha256=createHash('sha256').update(loginBytes).digest('hex');loginEntry.bytes=loginBytes.length;
loginEntry.postExportTransformations??=[];
loginEntry.postExportTransformations.push('Replace the local/institutional email example in the login form placeholder with a reserved example address; validation and submission behavior are unchanged.');
manifest.postExportTransforms??=[];
manifest.postExportTransforms.push({files:[loginPath],transformation:'Replace a human-facing email-format placeholder with a reserved example address.',count:emailPlaceholderReplacements,sourceBytesSha256:loginEntry.sourceSha256,exportBytesSha256:loginEntry.exportSha256,privateSourceModified:false});
manifest.redactions??={};manifest.redactions.uiExampleEmailPlaceholders=(manifest.redactions.uiExampleEmailPlaceholders||0)+emailPlaceholderReplacements;
await writeFile(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
console.log(JSON.stringify({uiEmailPlaceholdersReplaced:emailPlaceholderReplacements,configuredValuesRead:false,privateSourceModified:false},null,2));
