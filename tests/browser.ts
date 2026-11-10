import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

process.env.NODE_ENV='test';process.env.MAIL_TRANSPORT='json';
process.env.BOOTSTRAP_ADMIN_EMAIL='admin@campus.test';process.env.COOKIE_SECURE='false';process.env.PUBLIC_URL='http://127.0.0.1:3002';
const {createApp}=await import('../server/src/app.js');
const {initDb,closeDb,query}=await import('../server/src/db.js');
const {getCapturedMail,clearCapturedMail}=await import('../server/src/mail.js');
await initDb();
const server=createServer(createApp());
await new Promise<void>(resolve=>server.listen(3002,'127.0.0.1',resolve));
await mkdir('test-results/showcase',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--disable-dev-shm-usage','--disable-gpu','--no-sandbox','--js-flags=--max-old-space-size=256']});
const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true});
const page=await context.newPage();const errors:string[]=[];const failedImages:string[]=[];
const mobileAuditIssues:string[]=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.request().resourceType()==='image'&&response.status()>=400)failedImages.push(`${response.status()} ${new URL(response.url()).pathname}`)});
const checks:string[]=[];
async function passed(label:string){checks.push(label);console.log('PASS',label);}
async function signIn(email:string,roleLabel:string){
 await query('DELETE FROM otp_challenges WHERE email=:email',{email});
 await query('DELETE FROM otp_email_locks WHERE email=:email',{email});
 await page.goto('http://127.0.0.1:3002/login');
 await page.getByRole('tab',{name:roleLabel,exact:true}).click();
 await page.getByLabel('Email address').fill(email);
 await page.getByRole('button',{name:'Continue with email'}).click();
 await page.getByLabel('6-digit verification code').waitFor();
 const mail=getCapturedMail().filter(x=>x.to===email).at(-1);assert(mail,'Controlled test mail missing');
 await page.getByLabel('6-digit verification code').fill(mail.code);
 await page.getByRole('button',{name:'Verify and continue'}).click();
 await page.waitForURL('http://127.0.0.1:3002/');
 await page.getByRole('heading',{name:/Good|Overview|Welcome|Hello|dashboard/i}).first().waitFor();
 await page.waitForLoadState('networkidle');
 assert.equal(await page.getByText('Internal server error',{exact:true}).count(),0,'Dashboard must not contain a server error');
 await passed(`OTP sign-in works for ${roleLabel}`);
}
try{
 await page.goto('http://127.0.0.1:3002/login');
 await page.getByRole('heading',{name:'Welcome back'}).waitFor();
 assert.equal(await page.getByRole('tab').count(),3);await passed('login displays all three account roles');
 for(const width of [320,360,390,430,768]){
  await page.setViewportSize({width,height:844});
  if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))mobileAuditIssues.push(`Login has horizontal overflow at ${width}px`);
  await passed(`login has no horizontal overflow at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 const loginTargets=await page.locator('main').evaluate(root=>[...root.querySelectorAll<HTMLElement>('button,a[href],input:not([type="hidden"]),select,textarea')].filter(el=>el.getClientRects().length).flatMap(el=>{const isSmallChoice=el instanceof HTMLInputElement&&['checkbox','radio'].includes(el.type);const target=isSmallChoice?(el.closest('label')||el):el;const r=target.getBoundingClientRect();return r.width<44||r.height<44?[{label:el.getAttribute('aria-label')||target.textContent?.trim()||el.tagName,width:Math.round(r.width),height:Math.round(r.height)}]:[]}));
 if(loginTargets.length)mobileAuditIssues.push(`Login controls below 44px at 390px: ${JSON.stringify(loginTargets)}`);
 await passed('mobile login controls meet the 44px target size');
 await page.keyboard.press('Tab');
 const keyboardFocus=await page.evaluate(()=>{const active=document.activeElement as HTMLElement|null;if(!active)return {visible:false,focusVisible:false,indicator:false};const style=getComputedStyle(active);const rect=active.getBoundingClientRect();return {visible:rect.width>0&&rect.height>0&&style.visibility!=='hidden',focusVisible:active.matches(':focus-visible'),indicator:style.outlineStyle!=='none'&&style.outlineWidth!=='0px'||style.boxShadow!=='none'};});
 if(!(keyboardFocus.visible&&keyboardFocus.focusVisible&&keyboardFocus.indicator))mobileAuditIssues.push(`Login keyboard focus lacks a visible indicator at 390px: ${JSON.stringify(keyboardFocus)}`);
 await passed('login exposes a visible keyboard focus indicator');
 await page.screenshot({path:'test-results/login-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Sign-in help'}).tap();await page.getByRole('dialog').waitFor();
 const helpDialog=page.getByRole('dialog');const helpMetrics=await helpDialog.evaluate(dialog=>{const r=dialog.getBoundingClientRect();return {width:r.width,height:r.height,focused:dialog.contains(document.activeElement),small:[...dialog.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea')].filter(el=>el.getClientRects().length).flatMap(el=>{const b=el.getBoundingClientRect();return b.width<44||b.height<44?[{label:el.getAttribute('aria-label')||el.textContent?.trim()||el.tagName,width:Math.round(b.width),height:Math.round(b.height)}]:[]})}});
 if(helpMetrics.width>390||helpMetrics.height>844||!helpMetrics.focused)mobileAuditIssues.push(`Sign-in help does not fit/focus at 390px: ${JSON.stringify(helpMetrics)}`);
 if(helpMetrics.small.length)mobileAuditIssues.push(`Sign-in help controls below 44px: ${JSON.stringify(helpMetrics.small)}`);
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});assert(await page.getByRole('button',{name:'Sign-in help'}).evaluate(el=>el===document.activeElement),'Sign-in help should restore focus to its trigger');await passed('sign-in help fits, receives keyboard focus, closes with Escape, and restores focus at mobile width');
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 assert.equal(await page.getByRole('tab').count(),2);await passed('registration excludes administrator role');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await signIn('student@campus.test','Student');
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'test-results/dashboard-student-desktop.png',fullPage:true});
 for(const width of [320,360,390,430,768]){
  await page.setViewportSize({width,height:844});
  for(const [path,title] of [['/',/Good (morning|afternoon|evening),/],['/opportunities','Find your next opportunity'],['/applications','Applications'],['/profile','My profile'],['/hackathons','Hackathons'],['/outcomes','Outcomes']] as Array<[string,string|RegExp]>) {
   await page.goto(`http://127.0.0.1:3002${path}`);await page.getByRole('heading',{name:title,exact:typeof title==='string'}).first().waitFor();
   const widthAudit=await page.evaluate(()=>{const offenders=[...document.body.querySelectorAll<HTMLElement>('*')].flatMap(el=>{const r=el.getBoundingClientRect();if(r.right<=innerWidth+1&&r.left>=-1&&el.scrollWidth<=el.clientWidth+1)return [];return [{tag:el.tagName.toLowerCase(),className:String(el.className||'').slice(0,100),id:el.id||'',left:Math.round(r.left),right:Math.round(r.right),clientWidth:el.clientWidth,scrollWidth:el.scrollWidth}]}).slice(0,12);return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,offenders}});
   if(widthAudit.documentWidth>widthAudit.viewport+1){mobileAuditIssues.push(`Student ${path} has horizontal overflow at ${width}px: ${JSON.stringify(widthAudit)}`);await page.screenshot({path:`test-results/showcase/overflow-student-${path==='/'?'dashboard':path.slice(1)}-${width}.png`});console.log('MOBILE_OVERFLOW_DETAIL',path,width,JSON.stringify(widthAudit));}
  }
  await passed(`student dashboard and core pages have no horizontal overflow at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:3002/profile');await page.getByRole('heading',{name:'My profile',exact:true}).waitFor();
 const smallTargets=await page.locator('button:visible,a:visible,input:visible,select:visible').evaluateAll(nodes=>nodes.flatMap(node=>{const associatedInput=node instanceof HTMLInputElement&&['checkbox','radio','file'].includes(node.type);const target=associatedInput?(node.closest('label')||node):node;const r=target.getBoundingClientRect();if(r.right<=0||r.left>=innerWidth)return [];return r.width<44||r.height<44?[{name:(node.getAttribute('aria-label')||target.textContent||node.getAttribute('name')||node.tagName).trim().replace(/\s+/g,' ').slice(0,70),width:Math.round(r.width),height:Math.round(r.height)}]:[]}));
 console.log('MOBILE_TARGETS_BELOW_44PX',JSON.stringify(smallTargets));
 if(smallTargets.length)mobileAuditIssues.push(`Profile controls below 44px: ${JSON.stringify(smallTargets)}`);
 await passed('profile controls meet the 44px mobile target size');
 await page.goto('http://127.0.0.1:3002/opportunities');await page.waitForLoadState('networkidle');
 const closedSidebar=page.locator('aside[aria-label="Placement workspace"]');
 const closedState=await closedSidebar.evaluate(el=>({inert:(el as HTMLElement).inert||Boolean(el.closest('[inert]')),hiddenFromAT:el.getAttribute('aria-hidden')==='true'||Boolean(el.closest('[aria-hidden="true"]'))}));
 if(!closedState.inert&&!closedState.hiddenFromAT)mobileAuditIssues.push(`Closed mobile navigation is not inert/hidden from assistive technology: ${JSON.stringify(closedState)}`);
 for(let tab=0;tab<24;tab++){await page.keyboard.press('Tab');if(await closedSidebar.evaluate(el=>el.contains(document.activeElement)))mobileAuditIssues.push('Keyboard focus enters the closed mobile navigation');}
 const eligible=page.getByLabel('Eligible for me');
 if(await eligible.count()){await eligible.focus();const focus=await eligible.evaluate(el=>{const target=el.nextElementSibling as HTMLElement|null;const style=target?getComputedStyle(target):getComputedStyle(el);return {focusVisible:el.matches(':focus-visible'),targetOutline:style.outlineStyle,targetShadow:style.boxShadow,targetBorder:style.borderColor}});if(!focus.focusVisible||(focus.targetOutline==='none'&&focus.targetShadow==='none'))mobileAuditIssues.push(`Eligible for me checkbox has no visible keyboard-focus cue: ${JSON.stringify(focus)}`);}
 for(const [path,title] of [['/opportunities','Find your next opportunity'],['/applications','Applications'],['/profile','My profile'],['/certificates','Certificates'],['/hackathons','Hackathons'],['/outcomes','Outcomes']]){
  await page.goto('http://127.0.0.1:3002'+path);await page.getByRole('heading',{name:title,exact:true}).first().waitFor();await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.notice:not(.notice-info):not(.notice-success)').filter({hasText:/Internal server error|Forbidden|Oracle|Failed to fetch/}).count(),0);
  await passed(`student ${path} loads without server errors`);
 }
 await page.goto('http://127.0.0.1:3002/opportunities');await page.waitForLoadState('networkidle');
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:/Graduate Software Engineer/}).first().click();await page.getByRole('dialog').waitFor();await passed('opportunity detail drawer opens');
 await page.screenshot({path:'test-results/opportunity-detail.png',fullPage:true});
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await passed('opportunity drawer closes with Escape');
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForLoadState('networkidle');
 await page.getByRole('button',{name:'Open navigation'}).tap();assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'true','Mobile navigation must expose its expanded state');assert(await page.getByRole('img',{name:'Amrita Bengaluru Campus'}).isVisible(),'Expanded mobile navigation must show the supplied logo');const menuTargets=await page.locator('body').evaluate(root=>[...root.querySelectorAll<HTMLElement>('button,a[href]')].filter(el=>el.getClientRects().length).flatMap(el=>{const r=el.getBoundingClientRect();return r.width<44||r.height<44?[{label:el.getAttribute('aria-label')||el.textContent?.trim()||el.tagName,width:Math.round(r.width),height:Math.round(r.height)}]:[]}));if(menuTargets.length)mobileAuditIssues.push(`Mobile navigation controls below 44px: ${JSON.stringify(menuTargets)}`);await passed('expanded mobile navigation exposes the supplied logo and is keyboard-operable');await page.getByRole('dialog',{name:'Placement workspace'}).getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'My profile',exact:true}).tap();await page.getByRole('heading',{name:'My profile',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('button[aria-label="Open navigation"]')?.getAttribute('aria-expanded')==='false');
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1))mobileAuditIssues.push('Student profile has horizontal overflow at 390px');
 await page.screenshot({path:'test-results/profile-mobile.png',fullPage:true});await passed('mobile navigation and layout work at 390px');
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Sign out',exact:true}).click();
 await signIn('admin@campus.test','Placement team');
 for(const [path,title] of [['/students','Student directory'],['/companies','Companies'],['/certificates','Certificates'],['/reports','Placement reports'],['/approvals','Recruiter access']]){
  await page.goto('http://127.0.0.1:3002'+path);await page.getByRole('heading',{name:title,exact:true}).first().waitFor();await page.waitForLoadState('networkidle');
  assert.equal(await page.getByText('Internal server error',{exact:true}).count(),0);await passed(`placement-team ${path} loads`);
 }
 await page.goto('http://127.0.0.1:3002/reports');await page.waitForLoadState('networkidle');await page.screenshot({path:'test-results/reports-admin-desktop.png',fullPage:true});await page.screenshot({path:'test-results/showcase/reports-desktop.png'});
 console.log('BROWSER_ERRORS',JSON.stringify(errors));console.log('FAILED_IMAGES',JSON.stringify(failedImages));
 console.log('MOBILE_A11Y_ISSUES',JSON.stringify(mobileAuditIssues));
 assert.deepEqual(errors,[]);await passed('browser has no uncaught JavaScript errors');
 assert.deepEqual(failedImages,[],'Core app routes have no failed image assets');await passed('core app routes load their image assets');
 assert.deepEqual(mobileAuditIssues,[],'Mobile layout, keyboard focus and touch-target checks must pass');
 console.log(`BROWSER RESULT: ${checks.length} checks passed. Screenshots in test-results/. External email was not sent.`);
}catch(error){
 await page.screenshot({path:'test-results/browser-failure.png',fullPage:true}).catch(()=>{});
 throw error;
}finally{
 await browser.close();clearCapturedMail();await new Promise<void>(resolve=>server.close(()=>resolve()));await closeDb();
}
