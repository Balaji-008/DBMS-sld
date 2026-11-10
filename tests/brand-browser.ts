import 'dotenv/config';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

process.env.NODE_ENV='test';process.env.MAIL_TRANSPORT='json';process.env.COOKIE_SECURE='false';process.env.PUBLIC_URL='http://127.0.0.1:3003';
const {createApp}=await import('../server/src/app.js');
const {initDb,closeDb}=await import('../server/src/db.js');
await initDb();const server=createServer(createApp());await new Promise<void>(r=>server.listen(3003,'127.0.0.1',r));
await mkdir('test-results/showcase',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--js-flags=--max-old-space-size=192']});
let checks=0;const issues:string[]=[];
function check(value:unknown,label:string){assert(value,label);checks++;console.log('PASS',label);}
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});const page=await context.newPage();page.on('pageerror',e=>issues.push(e.message));const failedImages:string[]=[];page.on('response',r=>{if(r.request().resourceType()==='image'&&r.status()>=400)failedImages.push(`${r.status()} ${r.url()}`)});
try{
 await page.goto('http://127.0.0.1:3003/');await page.locator('.landing-page').waitFor();await page.waitForLoadState('networkidle');
 check((await page.title()).includes('Amrita Placement Portal'),'page title uses Amrita branding');
 check((await page.locator('body').innerText()).includes('Bengaluru'),'public landing identifies Bengaluru campus');
 check(!(await page.locator('body').innerText()).includes('CampusBridge'),'no old user-facing branding on landing');
 const campus=page.getByAltText('Architectural sketch of Amrita Bengaluru campus');await campus.waitFor();
 check(await campus.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>1000&&img.currentSrc.endsWith('.webp')),'provided-campus sketch loads through optimized WebP');
 const logo=page.locator('.landing-brand img');check(await logo.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth===1118),'supplied Amrita logo is visible using its trimmed export');
 check((await page.locator('img:visible').evaluateAll(imgs=>imgs.filter(img=>!(img as HTMLImageElement).complete||(img as HTMLImageElement).naturalWidth===0).map(img=>(img as HTMLImageElement).currentSrc))).length===0,'all visible landing images have decoded');
 check(await page.locator('canvas').count()===0,'landing performs no runtime Canvas rendering');
 const motion=page.locator('.motion-visual').first();await motion.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.motion-visual img')?.getAttribute('src')?.endsWith('.gif'));
 check(true,'saved GIF plays when its illustration enters view');
 await motion.getByRole('button',{name:'Pause animation'}).click();check((await motion.locator('img').getAttribute('src'))?.endsWith('-poster.png'),'pause swaps the animation to its static poster');
 await motion.getByRole('button',{name:'Play animation'}).click();await page.waitForFunction(()=>document.querySelector('.motion-visual img')?.getAttribute('src')?.endsWith('.gif'));check(true,'animation can be resumed');
 for(const width of [320,360,390,430,768]){
  await page.setViewportSize({width,height:844});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`mobile landing fits a ${width}px viewport`);
 }
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(250);await page.screenshot({path:'test-results/amrita-landing-desktop.png',fullPage:true});await page.screenshot({path:'test-results/showcase/landing-desktop.png'});
 for(const [label,role] of [['Students','Student'],['Recruiters','Recruiter'],['Placement team','Placement team']]){
  await page.goto('http://127.0.0.1:3003/');await page.locator('.role-list').getByRole('link',{name:new RegExp(label)}).click();
  await page.getByRole('heading',{name:'Welcome back'}).waitFor();
  check(await page.getByRole('tab',{name:role,exact:true}).getAttribute('aria-selected')==='true',`landing ${label} link selects matching login role`);
 }
 await page.goto('http://127.0.0.1:3003/login?role=invalid');await page.getByRole('heading',{name:'Welcome back'}).waitFor();
 check(await page.getByRole('tab',{name:'Student',exact:true}).getAttribute('aria-selected')==='true','unknown role query safely defaults to student');
 await page.goto('http://127.0.0.1:3003/login');await page.getByRole('heading',{name:'Welcome back'}).waitFor();await page.waitForLoadState('networkidle');
 check(await page.getByRole('tab').count()===3,'login preserves all three account roles');
 check(!(await page.locator('body').innerText()).includes('CampusBridge'),'login is fully rebranded');
 await page.screenshot({path:'test-results/amrita-login-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/showcase/login-mobile.png'});
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:3003/');await page.locator('.landing-page').waitFor();await page.waitForLoadState('networkidle');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'mobile landing fits a 390px viewport');
 await page.screenshot({path:'test-results/amrita-landing-mobile.png',fullPage:true});await page.screenshot({path:'test-results/showcase/landing-mobile.png'});
 check(failedImages.length===0,`landing has no failed image requests${failedImages.length?`: ${failedImages.join(', ')}`:''}`);
 const reduced=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});const reducedPage=await reduced.newPage();const gifRequests:string[]=[];reducedPage.on('request',r=>{if(r.url().endsWith('.gif'))gifRequests.push(r.url());});
 await reducedPage.goto('http://127.0.0.1:3003/');await reducedPage.locator('.landing-page').waitFor();await reducedPage.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await reducedPage.waitForLoadState('networkidle');
 check(gifRequests.length===0,'reduced-motion mode downloads no animated GIFs');
 check((await reducedPage.locator('.motion-visual img').evaluateAll(imgs=>imgs.map(img=>(img as HTMLImageElement).src))).every(src=>src.endsWith('-poster.png')),'reduced-motion mode uses static poster files');
 await reduced.close();
 await page.setViewportSize({width:390,height:844});
 await page.goto(pathToFileURL(resolve('test-results/amrita-email-preview.html')).href);await page.waitForLoadState('load');
 check(await page.getByRole('heading',{name:'Your code is ready'}).count()===1,'HTML email preview renders its primary heading');
 check((await page.locator('body').innerText()).includes('123456'),'email code stays readable in the HTML preview');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'HTML email preview fits a 390px viewport');
 await page.screenshot({path:'test-results/amrita-email-mobile.png',fullPage:true});
 await page.setViewportSize({width:900,height:1000});await page.screenshot({path:'test-results/amrita-email-desktop.png',fullPage:true});
 check(issues.length===0,'public landing/login have no uncaught JavaScript errors');
 console.log(`BRAND BROWSER RESULT: ${checks} checks passed; no external email sent.`);
}catch(error){await page.screenshot({path:'test-results/amrita-brand-failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()));await closeDb();}
