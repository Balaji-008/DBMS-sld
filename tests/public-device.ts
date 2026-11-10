import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {chromium} from '@playwright/test';

const baseUrl=(process.env.PUBLIC_QA_BASE_URL||'http://127.0.0.1:3003').replace(/\/$/,'');
const outputPath=resolve(process.env.PUBLIC_QA_DEVICE_REPORT||'docs/showcase/public-device-results.json');
const screenshotDir=resolve('test-results/public-release');
const widths=[320,360,390,430,650,651,768,900,901,1024,1440,1920];
const report:{generatedAt:string;target:string;viewportWidths:number[];textZoomMethod:string;checks:string[];measurements:unknown[];reducedMotion:{gifRequests:number;posterOnly:boolean}|null;status:'running'|'passed'|'failed';failure?:string}={
 generatedAt:new Date().toISOString(),target:'configured public-release QA landing route',viewportWidths:widths,
 sourceHashes:{'client/src/pages/Landing.tsx':'91b67ecc93bbc2d69390c2920e6f5719b47a78a95144a665425d91e5995c4bcc','client/src/pages/Login.tsx':'1cccf867646880698f397191a4f36198db7aa32da1d195b8d074acddd8d5a00e','client/src/styles.css':'acf9f93e031d6512be7644d8eb16f7e970068108513c0c9b63fe0afea68c3714'},
 screenshots:{desktop:'test-results/public-release/landing-desktop.png',mobile:'test-results/public-release/landing-mobile.png'},
 textZoomMethod:'At 320, 390, 650 and 651 CSS px, double the computed font size of each visible text-bearing element through Playwright before measuring; this approximates 200% browser text zoom without changing browser chrome.',
 checks:[],measurements:[],reducedMotion:null,status:'running'
};
let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
function pass(label:string){report.checks.push(label);console.log(`PASS ${label}`);}
function intersection(a:{left:number;right:number;top:number;bottom:number},b:{left:number;right:number;top:number;bottom:number}){
 return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
}
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--js-flags=--max-old-space-size=192']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const page=await context.newPage();
 await page.goto(baseUrl,{waitUntil:'networkidle'});
 await page.locator('.landing-page').waitFor();
 const title=await page.title();assert(title.includes('Amrita Placement Portal'),'landing page title is present');pass('public landing route loads');
 for(const width of widths){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>window.scrollTo(0,0));
  const measurement=await page.evaluate(()=>{
   const result={viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,rects:{}};
   for(const [key,selector] of Object.entries({copy:'.hero-copy',actions:'.hero-actions',motion:'.hero-motion',campus:'.hero-campus',sketch:'.campus-sketch',gif:'.hero-motion img'})){
    const el=document.querySelector(selector);if(!el){result.rects[key]=null;continue;}const r=el.getBoundingClientRect();const style=getComputedStyle(el);
    result.rects[key]={left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,visible:r.width>0&&r.height>0&&style.display!=='none'&&style.visibility!=='hidden'};
   }
   return result;
  });
  const rects=measurement.rects as Record<string,{left:number;right:number;top:number;bottom:number;width:number;height:number;visible:boolean}|null>;
  const pairs:[string,unknown,unknown][]=[['copy/GIF',rects.copy,rects.gif],['copy/campus',rects.copy,rects.campus],['copy/sketch',rects.copy,rects.sketch],['CTA/GIF',rects.actions,rects.gif],['CTA/campus',rects.actions,rects.campus],['CTA/sketch',rects.actions,rects.sketch],['GIF/campus',rects.gif,rects.campus],['GIF/sketch',rects.gif,rects.sketch]];
  const conflicts:string[]=[];
  for(const [name,aa,bb] of pairs){const a=aa as typeof rects.copy,b=bb as typeof rects.copy;if(a?.visible&&b?.visible){const area=intersection(a,b);if(area>1)conflicts.push(`${name}:${Math.round(area)}px2`);}}
  assert(measurement.documentWidth<=width+1,`landing document overflows at ${width}px (${measurement.documentWidth}px)`);
  assert(conflicts.length===0,`hero visual/content overlap at ${width}px: ${conflicts.join(', ')}`);
  (report.measurements as unknown[]).push({width,mode:'normal',documentWidth:measurement.documentWidth,rects:{copy:rects.copy,cta:rects.actions,gif:rects.gif,campus:rects.campus,sketch:rects.sketch},overlaps:conflicts});
  pass(`hero fits and copy/CTA/GIF/sketch do not overlap at ${width}px`);
 }
 for(const width of [320,390,650,651]){
  await page.reload({waitUntil:'networkidle'});
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>{
   const elements=[...document.querySelectorAll<HTMLElement>('h1,h2,h3,p,a,button,span,small,strong')];
   for(const el of elements){const r=el.getBoundingClientRect();if(r.width===0||r.height===0)continue;const size=parseFloat(getComputedStyle(el).fontSize);if(Number.isFinite(size))el.style.setProperty('font-size',`${size*2}px`,'important');}
  });
  const measurement=await page.evaluate(()=>{
   const result={documentWidth:document.documentElement.scrollWidth,rects:{}};
   for(const [key,selector] of Object.entries({copy:'.hero-copy',actions:'.hero-actions',motion:'.hero-motion',campus:'.hero-campus',sketch:'.campus-sketch',gif:'.hero-motion img'})){
    const el=document.querySelector(selector);if(!el){result.rects[key]=null;continue;}const r=el.getBoundingClientRect();const style=getComputedStyle(el);
    result.rects[key]={left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,visible:r.width>0&&r.height>0&&style.display!=='none'&&style.visibility!=='hidden'};
   }
   return result;
  });
  const rects=measurement.rects as Record<string,{left:number;right:number;top:number;bottom:number;width:number;height:number;visible:boolean}|null>;
  const conflicts:string[]=[];
  for(const [name,aa,bb] of [['copy/GIF',rects.copy,rects.gif],['copy/campus',rects.copy,rects.campus],['copy/sketch',rects.copy,rects.sketch],['CTA/GIF',rects.actions,rects.gif],['CTA/campus',rects.actions,rects.campus],['CTA/sketch',rects.actions,rects.sketch],['GIF/campus',rects.gif,rects.campus],['GIF/sketch',rects.gif,rects.sketch]] as const){if(aa?.visible&&bb?.visible){const area=intersection(aa,bb);if(area>1)conflicts.push(`${name}:${Math.round(area)}px2`);}}
  assert(measurement.documentWidth<=width+1,`200% text zoom overflows at ${width}px (${measurement.documentWidth}px)`);
  assert(conflicts.length===0,`200% text zoom hero overlap at ${width}px: ${conflicts.join(', ')}`);
  (report.measurements as unknown[]).push({width,mode:'200%-text-emulation',documentWidth:measurement.documentWidth,rects:{copy:rects.copy,cta:rects.actions,gif:rects.gif,campus:rects.campus,sketch:rects.sketch},overlaps:conflicts});
  pass(`hero fits without overlap under 200% text-size emulation at ${width}px`);
 }
 await mkdir(screenshotDir,{recursive:true});
 await page.reload({waitUntil:'networkidle'});await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>window.scrollTo(0,0));
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForLoadState('networkidle');await page.locator('.opportunity-sketch img').evaluate(img=>(img as HTMLImageElement).decode());await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:resolve(screenshotDir,'landing-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForLoadState('networkidle');await page.locator('.opportunity-sketch img').evaluate(img=>(img as HTMLImageElement).decode());await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:resolve(screenshotDir,'landing-mobile.png'),fullPage:true});
 pass('captured current desktop and mobile landing screenshots');
 await page.close();await context.close();
 const reduced=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const reducedPage=await reduced.newPage();const gifs:string[]=[];
 reducedPage.on('request',request=>{if(new URL(request.url()).pathname.endsWith('.gif'))gifs.push(new URL(request.url()).pathname);});
 await reducedPage.goto(baseUrl,{waitUntil:'networkidle'});await reducedPage.locator('.landing-page').waitFor();
 await reducedPage.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await reducedPage.waitForLoadState('networkidle');
 const posterOnly=await reducedPage.locator('.motion-visual img').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).getAttribute('src')?.endsWith('-poster.png')));
 report.reducedMotion={gifRequests:gifs.length,posterOnly};
 assert.equal(gifs.length,0,'reduced-motion mode requested an animated GIF');assert(posterOnly,'reduced-motion images are not static posters');
 pass('reduced-motion route uses static posters and requests no animated GIFs');
 await reduced.close();report.status='passed';
}catch(error){report.status='failed';report.failure=error instanceof Error?error.message:'Unknown regression failure';throw error;
}finally{
 if(browser)await browser.close();
 await mkdir(dirname(outputPath),{recursive:true});
 await writeFile(outputPath,`${JSON.stringify(report,null,2)}\n`);
 console.log(`PUBLIC DEVICE REPORT: ${report.status}; ${report.checks.length} checks; ${outputPath}`);
}
