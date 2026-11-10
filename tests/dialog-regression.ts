import 'dotenv/config';
import express from 'express';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir,readFile,writeFile,copyFile } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { chromium } from '@playwright/test';

const before=process.argv.includes('--before');
process.env.NODE_ENV='test';process.env.MAIL_TRANSPORT='json';process.env.COOKIE_SECURE='false';
let dist=resolve('client/dist');
if(before){
 const root=resolve('test-results/review-before/client');const patch=await readFile('.superpowers/sdd/oracle-portal/review-package.patch','utf8');
 for(const part of patch.split('diff --git ')){
  const header=part.match(/^\+\+\+ b\/.*?placements-portal\/(client\/src\/[^\n]+)/m);if(!header)continue;
  const path=resolve(root,header[1].replace(/^client\//,''));await mkdir(dirname(path),{recursive:true});
  await writeFile(path,part.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).map(l=>l.slice(1)).join('\n')+'\n');
 }
 await copyFile('client/index.html',resolve(root,'index.html'));
 const {build}=await import('vite');const {default:react}=await import('@vitejs/plugin-react');
 await build({configFile:false,root,plugins:[react()],logLevel:'error',build:{outDir:'dist',emptyOutDir:true}});dist=resolve(root,'dist');
}
const {createApp}=await import('../server/src/app.js');const {initDb,closeDb}=await import('../server/src/db.js');await initDb();
const app=express();app.use(express.static(dist,{index:false}));app.get('/login',(_req,res)=>res.sendFile(resolve(dist,'index.html')));app.use(createApp());
const server=createServer(app);await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert(address&&typeof address==='object');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try{
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${address.port}/login`);await page.getByRole('button',{name:'Sign-in help'}).click();await page.getByRole('dialog').waitFor();
 const focused=await page.evaluate(()=>Boolean(document.querySelector('[role=dialog]')?.contains(document.activeElement)));
 await page.keyboard.press('Escape');await page.waitForTimeout(250);const closed=await page.getByRole('dialog').count()===0;
 const ok=focused&&closed;console.log(`${ok?'PASS':'FAIL'} Dialog initial focus and Escape: focus inside=${focused}, closed=${closed}`);
 await writeFile(`test-results/dialog-${before?'before':'after'}-results.json`,JSON.stringify({focused,closed,passed:ok},null,2));
 if(!ok)process.exitCode=1;
}finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));await closeDb();}
