# Amrita visual refresh review package


## client/src/pages/Landing.tsx

```
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BriefcaseBusiness,Compass,Pause,Play,ShieldCheck,UsersRound} from 'lucide-react';

const logo='/brand/amrita-logo-trimmed.png';

function MotionImage({gif,poster,alt,className,eager=false}:{gif:string;poster:string;alt:string;className?:string;eager?:boolean}){
 const [reduced,setReduced]=useState<boolean|null>(null);
 const [paused,setPaused]=useState(false);
 const [isVisible,setIsVisible]=useState(false);
 const visualRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 useEffect(()=>{const target=visualRef.current;if(!target)return;const observer=new IntersectionObserver(([entry])=>setIsVisible(entry.isIntersecting),{rootMargin:'80px 0px',threshold:0.01});observer.observe(target);return()=>observer.disconnect()},[]);
 const animated=reduced===false&&!paused&&isVisible;
 return <div ref={visualRef} className={`motion-visual ${className||''}`}>
  <img src={animated?gif:poster} alt={alt} loading={eager?'eager':'lazy'} />
  {reduced===false&&<button className="motion-toggle" type="button" aria-label={paused?'Play animation':'Pause animation'} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={14}/>:<Pause size={14}/>}<span>{paused?'Play':'Pause'}</span></button>}
 </div>
}

export default function Landing(){return <main className="landing-page">
 <header className="landing-nav"><a className="landing-brand" href="/" aria-label="Amrita Placement Portal home"><img src={logo} alt="Amrita Bengaluru Campus"/><span>Placement Portal</span></a><nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#for-everyone">For your role</a><a className="landing-signin" href="/login">Sign in <ArrowRight size={15}/></a></nav></header>
 <section className="landing-hero">
  <div className="hero-copy"><p className="landing-kicker"><span/> Amrita Vishwa Vidyapeetham · Bengaluru</p><h1>From campus learning<br/>to a career in motion.</h1><p className="hero-intro">A shared place for students, recruiters, and the placement team to find the next right opportunity.</p><div className="hero-actions"><a className="landing-primary" href="/login">Enter the portal <ArrowRight size={16}/></a><a className="landing-secondary" href="#how-it-works">Explore the journey <span>↓</span></a></div><div className="hero-assurance"><ShieldCheck size={16}/><span>University access with secure email verification</span></div></div>
  <div className="hero-aside"><div className="hero-aside-rule"/><p>Learning finds its<br/>direction in the world.</p><span>AMRITA · BENGALURU</span><MotionImage className="hero-motion" eager gif="/media/career-orbit.gif" poster="/media/career-orbit-poster.png" alt="Career pathways in motion"/></div>
  <picture className="campus-sketch"><source type="image/webp" srcSet="/media/campus-sketch.webp"/><img src="/media/campus-sketch.png" alt="Architectural sketch of Amrita Bengaluru campus"/></picture><span className="campus-caption">Bengaluru campus</span>
 </section>
 <section className="landing-intro" id="how-it-works"><div className="intro-heading"><span className="section-index">A connected journey</span><h2>Bring every step<br/>of placement into view.</h2><p>Find opportunities, follow applications, and keep the people guiding your next step in the loop.</p></div><div className="journey-feature"><MotionImage gif="/media/career-orbit.gif" poster="/media/career-orbit-poster.png" alt="Career paths around a shared center"/><div className="feature-caption"><Compass size={16}/><span>One clear view from discovery to outcome</span></div></div></section>
 <section className="landing-pathways" id="for-everyone"><div className="pathways-art"><MotionImage gif="/media/pathways.gif" poster="/media/pathways-poster.png" alt="Pathways branching toward new opportunities"/><div className="art-note">Many paths. A place to begin.</div></div><div className="pathways-copy"><span className="section-index">Built around the people in your placement journey</span><h2>Different roles.<br/>A shared direction.</h2><div className="role-list"><a href="/login"><span className="role-icon"><UsersRound size={18}/></span><span><strong>Students</strong><small>Explore roles, track applications, and keep your profile current.</small></span><ArrowRight size={16}/></a><a href="/login"><span className="role-icon"><BriefcaseBusiness size={18}/></span><span><strong>Recruiters</strong><small>Share openings and manage your candidate pipeline.</small></span><ArrowRight size={16}/></a><a href="/login"><span className="role-icon"><Compass size={18}/></span><span><strong>Placement team</strong><small>Coordinate access, opportunities, and student outcomes.</small></span><ArrowRight size={16}/></a></div></div></section>
 <section className="landing-campus-note"><div><span className="section-index">Campus to career</span><h2>Rooted here.<br/>Ready for what’s next.</h2><p>Amrita’s Bengaluru campus is where this journey begins. The portal connects its placement community around each student’s next step.</p><a href="/login">Continue to sign in <ArrowRight size={15}/></a></div><picture className="opportunity-sketch"><source type="image/webp" srcSet="/media/opportunity-sketch.webp"/><img src="/media/opportunity-sketch.png" alt="Illustration of a bridge connecting learning and career opportunities"/></picture></section>
 <footer className="landing-footer"><a href="/" className="footer-brand"><img src={logo} alt="Amrita Bengaluru Campus"/><span>Placement Portal</span></a><span>Amrita Vishwa Vidyapeetham · Bengaluru</span><a href="/login">Sign in</a></footer>
 </main>}

```


## client/src/pages/Login.tsx

```
import {useEffect,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,ShieldCheck} from 'lucide-react';
import {api,post} from '../api';import {useAuth} from '../auth';import type {Department,Role,User} from '../types';import {Button,Field,Input,Notice,Select} from '../components/ui';import {useDialog} from '../hooks/useDialog';
type Config={smtp_configured:boolean;registration_enabled:true;otp_expiry_seconds:number;resend_after:number};
export default function Login(){const {setUser}=useAuth();const [mode,setMode]=useState<'login'|'register'>('login');const [step,setStep]=useState<'details'|'otp'>('details');const [role,setRole]=useState<Role>('student');const [email,setEmail]=useState('');const [fullName,setFullName]=useState('');const [roll,setRoll]=useState('');const [department,setDepartment]=useState('');const [company,setCompany]=useState('');const [remember,setRemember]=useState(true);const [otp,setOtp]=useState('');const [challenge,setChallenge]=useState('');const [expires,setExpires]=useState(0);const [cooldown,setCooldown]=useState(0);const [config,setConfig]=useState<Config|null>(null);const [departments,setDepartments]=useState<Department[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');const [dialog,setDialog]=useState<'help'|'terms'|null>(null);const helpDialogRef=useDialog<HTMLDivElement>(!!dialog,()=>setDialog(null));
 useEffect(()=>{void api<Config>('/auth/config').then(setConfig).catch(e=>setError(e.message));void api<{items:Department[]}>('/departments').then(r=>setDepartments(r.items)).catch(()=>{})},[]);
 useEffect(()=>{if(!cooldown)return;const id=window.setInterval(()=>setCooldown(n=>Math.max(0,n-1)),1000);return()=>clearInterval(id)},[cooldown]);
 const request=async(e:FormEvent)=>{e.preventDefault();setError('');setMessage('');setBusy(true);try{const path=mode==='register'?'/auth/register':'/auth/request-otp';const signupRole=role==='recruiter'?'recruiter':'student';const payload=mode==='register'?{email:email.trim(),full_name:fullName.trim(),role:signupRole,...(signupRole==='student'?{roll_number:roll.trim(),department_id:Number(department)}:{company_name:company.trim()})}:{email:email.trim(),role,remember_me:remember};const data=await post<{challenge_id:string;expires_in:number;resend_after:number;message:string}>(path,payload);setChallenge(data.challenge_id);setExpires(data.expires_in);setCooldown(data.resend_after);setMessage(data.message);setStep('otp')}catch(e){setError(e instanceof Error?e.message:'Could not request a sign-in code')}finally{setBusy(false)}};
 const verify=async(e:FormEvent)=>{e.preventDefault();setError('');setBusy(true);try{const result=await post<{user?:User;pending_approval?:boolean;message?:string}>('/auth/verify-otp',{challenge_id:challenge,otp:otp.trim()});if(result.pending_approval){setMessage(result.message||'Your recruiter request is awaiting placement-team approval.');setStep('details');setMode('login')}else if(result.user){setUser(result.user)}}catch(e){setError(e instanceof Error?e.message:'That code could not be verified')}finally{setBusy(false)}};
 const resend=async()=>{setError('');setBusy(true);try{const data=await post<{challenge_id:string;expires_in:number;resend_after:number;message:string}>(mode==='register'?'/auth/register':'/auth/request-otp',mode==='register'?{email:email.trim(),full_name:fullName.trim(),role:role==='recruiter'?'recruiter':'student',...(role==='recruiter'?{company_name:company.trim()}:{roll_number:roll.trim(),department_id:Number(department)})}:{email:email.trim(),role,remember_me:remember});setChallenge(data.challenge_id);setExpires(data.expires_in);setCooldown(data.resend_after);setMessage(data.message)}catch(e){setError(e instanceof Error?e.message:'Could not resend code')}finally{setBusy(false)}};
 return <main className="login-screen"><section className="login-art"><a className="brand-lockup" href="/"><img className="login-wordmark" src="/brand/amrita-logo-trimmed.png" alt="Amrita Bengaluru Campus"/><span>Placement Portal<small>Amrita · Bengaluru</small></span></a><div className="art-copy"><p className="art-kicker">Your next chapter starts here</p><h1>Talent meets<br/>opportunity.</h1><p>One place for students, recruiters, and the placement team to move great careers forward.</p></div><picture className="login-campus-sketch"><source type="image/webp" srcSet="/media/campus-sketch.webp"/><img src="/media/campus-sketch.png" alt="Architectural sketch of Amrita Bengaluru campus"/></picture><div className="art-footer"><span>Amrita Placement Portal</span><span>Placement services · 2026</span></div></section>
 <section className="login-panel"><div className="login-card"><div className="login-mobile-brand"><img className="login-mobile-wordmark" src="/brand/amrita-logo-trimmed.png" alt="Amrita Bengaluru Campus"/><span>Placement Portal</span></div><p className="eyebrow">Secure university access</p><h2>{step==='otp'?'Check your inbox':mode==='register'?'Create your account':'Welcome back'}</h2><p className="login-subtitle">{step==='otp'?`Enter the 6-digit code sent to ${email}. It expires in ${Math.floor(expires/60)} minutes.`:mode==='register'?'Join your university placements workspace.':'Sign in with your university email to continue.'}</p>
 {error&&<Notice>{error}</Notice>}{config&& !config.smtp_configured&&step==='details'&&<Notice tone="info">Email sign-in is currently unavailable. Contact your placement team to enable email delivery.</Notice>}{message&&<Notice tone="info">{message}</Notice>}
 {step==='details'?<><div className={`role-tabs ${mode==='login'?'role-tabs-three':''}`} role="tablist" aria-label="Account type">{(mode==='login'?(['student','recruiter','admin'] as Role[]):(['student','recruiter'] as Role[])).map(r=><button key={r} type="button" role="tab" aria-selected={role===r} onClick={()=>setRole(r)}>{r==='student'?'Student':r==='admin'?'Placement team':'Recruiter'}</button>)}</div>
 <form className="form-stack login-form" onSubmit={request}>{mode==='register'&&<Field label="Full name"><Input required autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></Field>}<Field label="Email address"><Input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="[redacted email]"/></Field>{mode==='register'&&role==='student'&&<div className="form-grid"><Field label="Roll number"><Input required value={roll} onChange={e=>setRoll(e.target.value)} placeholder="e.g. CS2026-014"/></Field><Field label="Department"><Select required value={department} onChange={e=>setDepartment(e.target.value)}><option value="">Select department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field></div>}{mode==='register'&&role==='recruiter'&&<Field label="Company name"><Input required value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company or organization"/></Field>}
 {mode==='login'&&<label className="remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>Keep me signed in on this device</label>}
 <Button type="submit" disabled={busy||!config}>{busy?'Sending code…':mode==='register'?'Create account with email':'Continue with email'}<ArrowRight size={16}/></Button></form>
 <p className="switch-mode">{mode==='register'?'Already have an account?':'New to Amrita Placement Portal?'} <button onClick={()=>{setMode(mode==='register'?'login':'register');setRole('student');setError('');setMessage('')}}>{mode==='register'?'Sign in':'Create account'}</button></p><div className="login-note"><ShieldCheck size={16}/><span>{config?.smtp_configured?'One-time codes are delivered to your email.':'Email code delivery is currently unavailable.'} No password required.</span></div></>:<form className="form-stack login-form" onSubmit={verify}><Field label="6-digit verification code"><Input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" autoFocus/></Field><Button type="submit" disabled={busy||otp.length!==6}>{busy?'Verifying…':'Verify and continue'}<CheckCircle2 size={16}/></Button><div className="otp-actions"><button type="button" onClick={()=>{setStep('details');setOtp('')}}><ArrowLeft size={14}/> Change email</button><button type="button" disabled={cooldown>0||busy} onClick={()=>void resend()}>{cooldown>0?`Resend in ${cooldown}s`:'Resend code'}</button></div></form>}
 <footer className="login-links"><button onClick={()=>setDialog('help')}>Sign-in help</button><button onClick={()=>setDialog('terms')}>Privacy & terms</button></footer></div><div className="login-footnote">© 2026 Amrita Placement Portal · Built for your next step</div></section>
 {dialog&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDialog(null)}}><div ref={helpDialogRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="login-help-title"><header className="modal-header"><h2 id="login-help-title">{dialog==='help'?'Sign-in help':'Privacy & terms'}</h2><button className="icon-button" onClick={()=>setDialog(null)}>×</button></header><div className="modal-content">{dialog==='help'?<><p>Use the email address connected to your student or recruiter account. A six-digit code will arrive by email and remain valid for five minutes.</p><p>Recruiter accounts need placement-team approval. Student accounts need a valid roll number and department during registration.</p><p>If no code arrives, check your spam folder or request a new one after the countdown ends.</p></>:<><p>Amrita Placement Portal uses your account details to support placement workflows at your university. Sign-in codes are time-limited and used once.</p><p>Your documents are protected. Placement staff and recruiters reviewing your applications can view resumes and certificates. Aadhaar documents are private to you and placement staff; Aadhaar numbers are encrypted and never shown in full.</p></>}</div></div></div>}</main>}

```


## client/src/App.tsx

```
import {Navigate,Route,Routes,useLocation} from 'react-router-dom';import {useAuth} from './auth';import Shell from './components/Shell';import Login from './pages/Login';import Landing from './pages/Landing';import Dashboard from './pages/Dashboard';import Opportunities from './pages/Opportunities';import {Applications} from './pages/Applications';import {Profile} from './pages/Profile';import Certificates from './pages/Certificates';import {Approvals,Companies,Hackathons,Outcomes,Students} from './pages/Operations';import Reports from './pages/Reports';import {Loading} from './components/ui';
function Guard({roles,children}:{roles?:string[];children:React.ReactNode}){const {user,loading}=useAuth();const location=useLocation();if(loading)return <div className="screen-loading"><Loading label="Connecting to Amrita Placement Portal"/></div>;if(!user)return <Navigate to="/login" replace state={{from:location.pathname}}/>;if(roles&&!roles.includes(user.role))return <Navigate to="/" replace/>;return <>{children}</>}
export default function App(){const {user,loading}=useAuth();if(loading)return <div className="screen-loading"><Loading label="Connecting to Amrita Placement Portal"/></div>;return <Routes><Route path="/login" element={user?<Navigate to="/" replace/>:<Login/>}/><Route path="/" element={user?<Shell/>:<Landing/>}>{user&&<Route index element={<Dashboard/>}/>}</Route><Route element={<Guard><Shell/></Guard>}><Route path="opportunities" element={<Opportunities/>}/><Route path="applications" element={<Applications/>}/><Route path="profile" element={<Guard roles={['student']}><Profile/></Guard>}/><Route path="certificates" element={<Guard roles={['student','admin']}><Certificates/></Guard>}/><Route path="hackathons" element={<Hackathons/>}/><Route path="companies" element={<Guard roles={['recruiter','admin']}><Companies/></Guard>}/><Route path="students" element={<Guard roles={['admin']}><Students/></Guard>}/><Route path="outcomes" element={<Guard roles={['student','recruiter','admin']}><Outcomes/></Guard>}/><Route path="reports" element={<Guard roles={['recruiter','admin']}><Reports/></Guard>}/><Route path="approvals" element={<Guard roles={['admin']}><Approvals/></Guard>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>}

```


## client/src/components/Shell.tsx

```
import {useState} from 'react';
import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {Activity,BriefcaseBusiness,Building2,ChartNoAxesCombined,ChevronLeft,FileBadge,GraduationCap,LayoutDashboard,LogOut,Menu,PanelLeftClose,PanelLeftOpen,ShieldCheck,Users,UserRound,Code2} from 'lucide-react';
import {useAuth} from '../auth';

const paths=[{to:'/',label:'Overview',icon:LayoutDashboard,roles:['student','recruiter','admin']},{to:'/opportunities',label:'Opportunities',icon:BriefcaseBusiness,roles:['student','recruiter','admin']},{to:'/applications',label:'Applications',icon:Activity,roles:['student','recruiter','admin']},{to:'/profile',label:'My profile',icon:UserRound,roles:['student']},{to:'/certificates',label:'Certificates',icon:FileBadge,roles:['student','admin']},{to:'/hackathons',label:'Hackathons',icon:Code2,roles:['student','recruiter','admin']},{to:'/companies',label:'Companies',icon:Building2,roles:['recruiter','admin']},{to:'/students',label:'Students',icon:Users,roles:['admin']},{to:'/outcomes',label:'Outcomes',icon:GraduationCap,roles:['student','recruiter','admin']},{to:'/reports',label:'Reports',icon:ChartNoAxesCombined,roles:['recruiter','admin']},{to:'/approvals',label:'Recruiter access',icon:ShieldCheck,roles:['admin']}];

export default function Shell(){
 const {user,logout}=useAuth();const [collapsed,setCollapsed]=useState(false);const [mobile,setMobile]=useState(false);const location=useLocation();const navigate=useNavigate();const item=paths.find(p=>p.to===location.pathname);
 return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}>
  <aside className={`sidebar ${mobile?'mobile-open':''}`}>
   <div className="sidebar-brand" aria-label="Amrita Placement Portal">{!collapsed&&<img className="amrita-wordmark" src="/brand/amrita-logo-trimmed.png" alt="Amrita Bengaluru Campus"/>}{!collapsed&&<span>Placement Portal<small>Amrita · Bengaluru</small></span>}</div>
   <div className="workspace-label">{!collapsed&&'WORKSPACE'}</div>
   <nav className="side-nav" aria-label="Main navigation">{paths.filter(p=>p.roles.includes(user?.role||'student')).map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setMobile(false)} title={label} aria-label={label}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-bottom"><div className="term-card"><div className="term-dot"/>{!collapsed&&<span>Placement cycle<small>2026 · Active</small></span>}</div><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand navigation':'Collapse navigation'}>{collapsed?<PanelLeftOpen size={17}/>:<><PanelLeftClose size={17}/><span>Collapse menu</span></>}</button></div>
  </aside>
  <div className="main-column"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={()=>setMobile(!mobile)}><Menu size={19}/></button><div className="breadcrumb"><span>Amrita Placement Portal</span><ChevronLeft className="crumb-chevron" size={13}/><strong>{item?.label||'Overview'}</strong></div><div className="topbar-right"><span className="cycle-chip"><span/> 2026 placements</span><div className="profile-button" role="button" tabIndex={0} onClick={()=>navigate(user?.role==='student'?'/profile':'/')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')navigate(user?.role==='student'?'/profile':'/')}}><span className="avatar">{user?.full_name?.split(' ').map(n=>n[0]).slice(0,2).join('')}</span><span className="profile-name">{user?.full_name}<small>{user?.role==='admin'?'Placement team':user?.role}</small></span><button className="logout-button" aria-label="Sign out" title="Sign out" onClick={e=>{e.stopPropagation();void logout()}}><LogOut size={16}/></button></div></div></header><main className="page-content"><Outlet/></main><footer className="app-footer"><span>Amrita Placement Portal · Bengaluru campus</span><span>Support your next step</span></footer></div>
  {mobile&&<button aria-label="Close navigation" className="mobile-scrim" onClick={()=>setMobile(false)}/>}
 </div>
}

```


## server/src/email-template.ts

```
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SendMailOptions } from 'nodemailer';

type Attachment = NonNullable<SendMailOptions['attachments']>[number];

export interface OtpEmailOptions {
  code: string;
  portalUrl: string;
}

export interface OtpEmail {
  subject: string;
  text: string;
  html: string;
  attachments: Attachment[];
}

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const logoPath = resolve(moduleDirectory, '../../client/public/brand/amrita-logo-trimmed.png');
const optionalAccentPath = resolve(moduleDirectory, '../../client/public/brand/email-accent.gif');
const logoCid = 'amrita-placement-portal-logo';
const accentCid = 'amrita-placement-portal-accent';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function validatePortalUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Portal URL must be an absolute HTTP or HTTPS URL');
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
    throw new Error('Portal URL must be an absolute HTTP or HTTPS URL without credentials');
  }
  return url;
}

function emailAccent(): { markup: string; attachment?: Attachment } {
  if (existsSync(optionalAccentPath)) {
    return {
      markup: `<img src="cid:${accentCid}" width="72" height="8" alt="" style="display:block;width:72px;height:8px;border:0;outline:none;text-decoration:none;">`,
      attachment: {
        filename: 'amrita-email-accent.gif',
        path: optionalAccentPath,
        cid: accentCid,
        contentType: 'image/gif',
        contentDisposition: 'inline'
      }
    };
  }

  return {
    markup: '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="72" style="width:72px;border-collapse:collapse;"><tr><td width="48" height="4" bgcolor="#c79a63" style="width:48px;height:4px;background-color:#c79a63;font-size:0;line-height:0;">&nbsp;</td><td width="24" height="4" bgcolor="#ead9c6" style="width:24px;height:4px;background-color:#ead9c6;font-size:0;line-height:0;">&nbsp;</td></tr></table>'
  };
}

export function buildOtpEmail(options: OtpEmailOptions): OtpEmail {
  if (!/^\d{6}$/.test(options.code)) throw new Error('OTP code must contain exactly six digits');
  if (!existsSync(logoPath)) throw new Error('Amrita Placement Portal logo asset is missing');

  const portal = validatePortalUrl(options.portalUrl);
  const safeCode = escapeHtml(options.code);
  const safePortalUrl = escapeHtml(portal.href);
  const accent = emailAccent();
  const attachments: Attachment[] = [{
    filename: 'amrita-bengaluru-campus-logo.png',
    path: logoPath,
    cid: logoCid,
    contentType: 'image/png',
    contentDisposition: 'inline'
  }];
  if (accent.attachment) attachments.push(accent.attachment);

  const subject = 'Your Amrita Placement Portal sign-in code';
  const text = [
    'Amrita Placement Portal',
    '',
    `Your sign-in code is: ${options.code}`,
    '',
    'Enter this six-digit code to continue. It expires in 5 minutes.',
    'If you did not request this code, you can ignore this email.',
    '',
    `Open the portal: ${portal.href}`,
    '',
    'Amrita Placement Portal · Bengaluru Campus'
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .email-gutter { padding-left: 22px !important; padding-right: 22px !important; }
      .email-title { font-size: 25px !important; line-height: 32px !important; }
      .email-code { font-size: 34px !important; letter-spacing: 7px !important; }
      .email-button { display: block !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f6f2;font-family:Arial,Helvetica,sans-serif;color:#252634;-webkit-text-size-adjust:100%;">
  <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">Your six-digit Amrita Placement Portal sign-in code. It expires in 5 minutes.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8f6f2" style="width:100%;border-collapse:collapse;background-color:#f8f6f2;">
    <tr><td align="center" style="padding:34px 12px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-shell" bgcolor="#ffffff" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border:1px solid #e9e3dd;">
        <tr><td bgcolor="#761731" style="height:7px;background-color:#761731;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td class="email-gutter" bgcolor="#431626" style="padding:25px 44px 23px;background-color:#431626;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
            <tr><td align="left" valign="middle"><img src="cid:${logoCid}" width="210" alt="Amrita Vishwa Vidyapeetham, Bengaluru Campus" style="display:block;width:210px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"></td>
              <td align="right" valign="middle" style="padding-left:12px;color:#e8cda8;font-size:10px;line-height:15px;letter-spacing:1.4px;text-transform:uppercase;">Placement Portal</td></tr>
          </table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:39px 48px 12px;">${accent.markup}</td></tr>
        <tr><td class="email-gutter" style="padding:15px 48px 0;">
          <p style="margin:0 0 10px;color:#761731;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;">Sign-in verification</p>
          <h1 class="email-title" style="margin:0;color:#252634;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:38px;font-weight:normal;">Your code is ready</h1>
          <p style="margin:16px 0 0;color:#6b6470;font-size:15px;line-height:24px;">Use this one-time code to continue to the Amrita Placement Portal.</p>
        </td></tr>
        <tr><td class="email-gutter" style="padding:25px 48px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8f6f2" style="width:100%;border-collapse:collapse;background-color:#f8f6f2;border:1px solid #eee6dc;">
            <tr><td align="center" style="padding:19px 14px 18px;">
              <p style="margin:0 0 8px;color:#6b6470;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Your six-digit sign-in code</p>
              <p class="email-code" style="margin:0;color:#431626;font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:48px;font-weight:bold;letter-spacing:9px;">${safeCode}</p>
              <p style="margin:9px 0 0;color:#6b6470;font-size:13px;line-height:19px;">Enter the digits together, in order.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:20px 48px 0;">
          <p style="margin:0;color:#6b6470;font-size:14px;line-height:22px;"><strong style="color:#252634;font-weight:bold;">This code expires in 5 minutes.</strong> If you did not request it, you can ignore this email.</p>
        </td></tr>
        <tr><td class="email-gutter" style="padding:26px 48px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" bgcolor="#761731" style="background-color:#761731;border-radius:3px;">
            <a class="email-button" href="${safePortalUrl}" target="_blank" style="display:inline-block;padding:13px 23px;color:#ffffff;font-size:14px;line-height:19px;font-weight:bold;text-decoration:none;border:1px solid #761731;border-radius:3px;">Open the portal</a>
          </td></tr></table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:30px 48px 34px;">
          <p style="margin:0;color:#8a838a;font-size:12px;line-height:19px;">You can also open the portal using this address:<br><a href="${safePortalUrl}" style="color:#761731;text-decoration:underline;word-break:break-all;">${safePortalUrl}</a></p>
        </td></tr>
        <tr><td bgcolor="#f5f1ec" style="padding:21px 28px;background-color:#f5f1ec;border-top:1px solid #e9e3dd;">
          <p style="margin:0;color:#6b6470;text-align:center;font-size:12px;line-height:19px;">Amrita Placement Portal<br><span style="color:#8a838a;">Bengaluru Campus</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html, attachments };
}

```


## server/src/mail.ts

```
import nodemailer from 'nodemailer';
import { config, smtpConfigured } from './config.js';
import { buildOtpEmail } from './email-template.js';

const captured: Array<{ to: string; code: string }> = [];

export function getCapturedMail() {
  return captured.map((message) => ({ ...message }));
}

export function clearCapturedMail() {
  captured.length = 0;
}

export async function sendOtp(to: string, code: string): Promise<void> {
  if (config.mailTransport === 'json' && config.nodeEnv === 'test') {
    captured.push({ to, code });
    return;
  }
  if (!smtpConfigured) throw new Error('SMTP credentials are not configured');

  const email = buildOtpEmail({
    code,
    portalUrl: config.publicUrl || 'https://dbms.sld.parswanadh.dev'
  });
  const transport = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000
  });
  await transport.sendMail({
    from: config.smtpFrom,
    to,
    ...email
  });
}

```


## scripts/render-brand-assets.py

```
#!/usr/bin/env python3
"""Render the Amrita portal's offline brand assets.

This is an explicit utility. It is not imported by the application, build, or
server startup. Each frame is derived from its absolute frame index so a run is
deterministic and the looping motion is periodic.
"""

from __future__ import annotations

import hashlib
import json
import math
import platform
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, __version__ as PILLOW_VERSION

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client/public"
MEDIA = PUBLIC / "media"
BRAND = PUBLIC / "brand"
MANIFEST = ROOT / "design/asset-manifest.json"

IVORY = (248, 246, 242)
BURGUNDY = (118, 23, 49)
DEEP_WINE = (67, 22, 38)
GOLD = (199, 154, 99)
SCALE = 2
FRAMES = 48
FRAME_MS = 80
SEED = 17


def sha(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def point_on_bezier(p0, p1, p2, p3, t):
    u = 1.0 - t
    return (
        u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
        u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
    )


def line(draw, points, fill, width):
    draw.line([(round(x * SCALE), round(y * SCALE)) for x, y in points], fill=fill, width=width * SCALE, joint="curve")


def circle(draw, x, y, radius, fill, outline=None, width=1):
    box = ((x - radius) * SCALE, (y - radius) * SCALE, (x + radius) * SCALE, (y + radius) * SCALE)
    draw.ellipse(box, fill=fill, outline=outline, width=width * SCALE)


def smooth_path(p0, p1, p2, p3, steps=96):
    return [point_on_bezier(p0, p1, p2, p3, i / steps) for i in range(steps + 1)]


def career_orbit(index: int) -> Image.Image:
    width, height = 640, 420
    image = Image.new("RGB", (width * SCALE, height * SCALE), IVORY)
    draw = ImageDraw.Draw(image)

    # Fine architectural rules and the quiet central axis keep the illustration
    # grounded in the campus editorial style.
    for y in (78, 342):
        line(draw, [(68, y), (572, y)], (*GOLD, 88), 1)
    line(draw, [(320, 52), (320, 368)], (*BURGUNDY, 30), 1)

    # Sculptural arch and offset orbital ellipse form a stable, complete first frame.
    arch = smooth_path((112, 294), (150, 76), (494, 72), (528, 294), 100)
    line(draw, arch, DEEP_WINE, 2)
    inner = smooth_path((142, 294), (172, 118), (468, 114), (498, 294), 100)
    line(draw, inner, (*GOLD, 225), 1)

    # A tilted elliptical route passes around the arch. The moving point returns
    # to its exact starting phase at frame 48, producing a seamless periodic loop.
    cx, cy, rx, ry = 320.0, 215.0, 218.0, 104.0
    tilt = -0.16
    orbit_points = []
    for step in range(181):
        a = 2 * math.pi * step / 180
        x, y = rx * math.cos(a), ry * math.sin(a)
        orbit_points.append((cx + x * math.cos(tilt) - y * math.sin(tilt), cy + x * math.sin(tilt) + y * math.cos(tilt)))
    line(draw, orbit_points, (*BURGUNDY, 115), 1)

    # Delicate center marker, ring and small gold anchor.
    circle(draw, 320, 215, 44, IVORY, outline=(*BURGUNDY, 150), width=1)
    circle(draw, 320, 215, 34, None, outline=(*GOLD, 240), width=1)
    circle(draw, 320, 215, 5, BURGUNDY)
    circle(draw, 320, 215, 2, GOLD)

    phase = 2 * math.pi * index / FRAMES
    x, y = rx * math.cos(phase), ry * math.sin(phase)
    px = cx + x * math.cos(tilt) - y * math.sin(tilt)
    py = cy + x * math.sin(tilt) + y * math.cos(tilt)
    circle(draw, px, py, 8, IVORY, outline=BURGUNDY, width=2)
    circle(draw, px, py, 3, GOLD)

    # Three fixed waypoints suggest stages without adding text or UI symbols.
    for x, y, r in ((126, 294, 5), (514, 294, 5), (320, 92, 4)):
        circle(draw, x, y, r, IVORY, outline=GOLD, width=2)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def pathways(index: int) -> Image.Image:
    width, height = 480, 260
    image = Image.new("RGB", (width * SCALE, height * SCALE), IVORY)
    draw = ImageDraw.Draw(image)

    # Source ribbon and branch paths have different silhouettes from the orbit
    # scene: a rising route divides into three graceful destinations.
    center = smooth_path((50, 211), (142, 209), (125, 57), (232, 119), 90)
    upper = smooth_path((232, 119), (294, 142), (302, 49), (421, 52), 80)
    middle = smooth_path((232, 119), (296, 134), (315, 130), (429, 130), 80)
    lower = smooth_path((232, 119), (295, 109), (308, 211), (421, 208), 80)
    line(draw, center, DEEP_WINE, 2)
    line(draw, upper, BURGUNDY, 2)
    line(draw, middle, (*GOLD, 240), 2)
    line(draw, lower, DEEP_WINE, 2)

    # Echo ribbons provide quiet depth while leaving generous blank space.
    line(draw, [(x + 5, y + 6) for x, y in center], (*GOLD, 115), 1)
    line(draw, [(x, y + 7) for x, y in upper], (*GOLD, 112), 1)
    line(draw, [(x, y - 7) for x, y in lower], (*BURGUNDY, 72), 1)

    # Stationary end nodes and a moving bead on the central route.
    for x, y, color in ((50, 211, BURGUNDY), (421, 52, GOLD), (429, 130, BURGUNDY), (421, 208, GOLD)):
        circle(draw, x, y, 8, IVORY, outline=color, width=2)
        circle(draw, x, y, 2, color)
    circle(draw, 232, 119, 7, IVORY, outline=BURGUNDY, width=2)

    # Ping-pong along the source ribbon with zero velocity at both endpoints;
    # frame 47 and frame 0 therefore meet with the same small step as any
    # neighboring pair rather than jumping from the end back to the start.
    t = 0.41 * (1.0 - math.cos(2 * math.pi * index / FRAMES))
    px, py = point_on_bezier((50, 211), (142, 209), (125, 57), (232, 119), t)
    circle(draw, px, py, 8, IVORY, outline=GOLD, width=2)
    circle(draw, px, py, 3, BURGUNDY)

    # A restrained top and bottom rule aligns with the landscape crop.
    line(draw, [(35, 24), (445, 24)], (*GOLD, 90), 1)
    line(draw, [(35, 236), (445, 236)], (*GOLD, 90), 1)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def encode_gif(name: str, size: tuple[int, int], renderer):
    started = time.perf_counter()
    rgb_frames = []
    for frame_index in range(FRAMES):
        rgb_frames.append(renderer(frame_index))
    poster_path = MEDIA / f"{name}-poster.png"
    rgb_frames[0].save(poster_path, format="PNG", optimize=True)
    palette_source = rgb_frames[0].quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    palette = palette_source.getpalette()
    palette_frames = []
    for frame in rgb_frames:
        pal = frame.quantize(palette=palette_source, dither=Image.Dither.NONE)
        palette_frames.append(pal)
    gif_path = MEDIA / f"{name}.gif"
    palette_frames[0].save(
        gif_path,
        format="GIF",
        save_all=True,
        append_images=palette_frames[1:],
        duration=FRAME_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )
    del rgb_frames, palette_frames, palette
    return {
        "gif": str(gif_path.relative_to(ROOT)),
        "poster": str(poster_path.relative_to(ROOT)),
        "dimensions": list(size),
        "frames": FRAMES,
        "frame_duration_ms": FRAME_MS,
        "loop": "infinite",
        "gif_bytes": gif_path.stat().st_size,
        "poster_bytes": poster_path.stat().st_size,
        "render_seconds": round(time.perf_counter() - started, 3),
    }


def main():
    MEDIA.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()

    original_logo = BRAND / "amrita-logo.png"
    logo = Image.open(original_logo).convert("RGBA")
    alpha_bbox = logo.getchannel("A").getbbox()
    if alpha_bbox is None:
        raise ValueError("Supplied logo is fully transparent")
    trimmed_path = BRAND / "amrita-logo-trimmed.png"
    logo.crop(alpha_bbox).save(trimmed_path, format="PNG", optimize=True)

    webp_outputs = {}
    for filename in ("campus-sketch.png", "opportunity-sketch.png"):
        source = MEDIA / filename
        target = source.with_suffix(".webp")
        with Image.open(source) as original:
            original.convert("RGB").save(target, "WEBP", quality=86, method=6)
        webp_outputs[target.name] = {
            "source": str(source.relative_to(ROOT)),
            "output": str(target.relative_to(ROOT)),
            "dimensions": list(Image.open(target).size),
            "quality": 86,
            "bytes": target.stat().st_size,
        }

    animations = {
        "career-orbit": encode_gif("career-orbit", (640, 420), career_orbit),
        "pathways": encode_gif("pathways", (480, 260), pathways),
    }
    for name, item in animations.items():
        if item["gif_bytes"] >= 2_000_000:
            raise ValueError(f"{name} exceeds the 2 MB GIF budget")

    source_paths = [original_logo, MEDIA / "campus-sketch.png", MEDIA / "opportunity-sketch.png"]
    manifest = {
        "authoring": {
            "tool": "scripts/render-brand-assets.py",
            "python": platform.python_version(),
            "pillow": PILLOW_VERSION,
            "seed": SEED,
            "explicit_command": "systemd-run --user --scope -p MemoryMax=256M -p MemorySwapMax=64M python scripts/render-brand-assets.py",
            "frame_rendering": "deterministic from absolute frame index; offline only",
        },
        "animation": {
            "fps": 12.5,
            "frame_count": FRAMES,
            "frame_duration_ms": FRAME_MS,
            "duration_seconds": round(FRAMES * FRAME_MS / 1000, 2),
            "colors": {"ivory": "#f8f6f2", "burgundy": "#761731", "deep_wine": "#431626", "gold": "#c79a63"},
            "antialias_scale": SCALE,
            "items": animations,
        },
        "webp_exports": webp_outputs,
        "logo_trim": {
            "source": str(original_logo.relative_to(ROOT)),
            "output": str(trimmed_path.relative_to(ROOT)),
            "alpha_bbox_xyxy": list(alpha_bbox),
            "dimensions": list(Image.open(trimmed_path).size),
            "pixel_content": "alpha-bounds crop only; source pixels preserved",
        },
        "source_sha256": {str(path.relative_to(ROOT)): sha(path) for path in source_paths},
        "output_sha256": {},
    }
    outputs = [trimmed_path]
    outputs.extend(MEDIA / f"{name}{suffix}" for name in animations for suffix in (".gif", "-poster.png"))
    outputs.extend(MEDIA / f"{name}.webp" for name in ("campus-sketch", "opportunity-sketch"))
    manifest["output_sha256"] = {str(path.relative_to(ROOT)): sha(path) for path in outputs}
    manifest["actual_script_elapsed_seconds"] = round(time.perf_counter() - started, 3)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"animations": animations, "webp_exports": webp_outputs, "logo_trim": manifest["logo_trim"], "elapsed_seconds": manifest["actual_script_elapsed_seconds"]}, indent=2))


if __name__ == "__main__":
    main()

```


Screenshots: test-results/amrita-landing-desktop.png, amrita-landing-mobile.png, amrita-login-desktop.png, amrita-email-desktop.png, amrita-email-mobile.png
