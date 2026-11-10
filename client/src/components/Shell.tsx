import {useEffect,useState} from 'react';
import {NavLink,Outlet,useLocation,useNavigate} from 'react-router-dom';
import {Activity,BriefcaseBusiness,Building2,ChartNoAxesCombined,ChevronLeft,FileBadge,GraduationCap,LayoutDashboard,LogOut,Menu,PanelLeftClose,PanelLeftOpen,ShieldCheck,Users,UserRound,Code2,X} from 'lucide-react';
import {useAuth} from '../auth';
import {useDialog} from '../hooks/useDialog';

const paths=[{to:'/',label:'Overview',icon:LayoutDashboard,roles:['student','recruiter','admin']},{to:'/opportunities',label:'Opportunities',icon:BriefcaseBusiness,roles:['student','recruiter','admin']},{to:'/applications',label:'Applications',icon:Activity,roles:['student','recruiter','admin']},{to:'/profile',label:'My profile',icon:UserRound,roles:['student']},{to:'/certificates',label:'Certificates',icon:FileBadge,roles:['student','admin']},{to:'/hackathons',label:'Hackathons',icon:Code2,roles:['student','recruiter','admin']},{to:'/companies',label:'Companies',icon:Building2,roles:['recruiter','admin']},{to:'/students',label:'Students',icon:Users,roles:['admin']},{to:'/outcomes',label:'Outcomes',icon:GraduationCap,roles:['student','recruiter','admin']},{to:'/reports',label:'Reports',icon:ChartNoAxesCombined,roles:['recruiter','admin']},{to:'/approvals',label:'Recruiter access',icon:ShieldCheck,roles:['admin']}];
const quickLabels:Record<string,string>={'Overview':'Home','Opportunities':'Roles','Applications':'Apps','My profile':'Profile','Certificates':'Certs'};

export default function Shell(){
 const {user,logout}=useAuth();const [collapsed,setCollapsed]=useState(false);const [mobile,setMobile]=useState(false);const [compact,setCompact]=useState(()=>window.matchMedia('(max-width: 900px)').matches);const location=useLocation();const navigate=useNavigate();const item=paths.find(p=>p.to===location.pathname);
 useEffect(()=>{const query=window.matchMedia('(max-width: 900px)');const update=()=>{setCompact(query.matches);if(!query.matches)setMobile(false)};query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 useEffect(()=>{if(!mobile)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[mobile]);
 const closeMobile=()=>setMobile(false);
 const navigationRef=useDialog<HTMLElement>(mobile,closeMobile);
 return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}>
  <aside ref={navigationRef} id="primary-navigation" className={`sidebar ${mobile?'mobile-open':''}`} aria-label="Placement workspace" role={mobile?'dialog':undefined} aria-modal={mobile||undefined} aria-hidden={compact&&!mobile} inert={compact&&!mobile}>
   <div className="sidebar-brand" aria-label="Amrita Placement Portal"><img className="amrita-wordmark" src="/brand/amrita-logo-trimmed.png" alt="Amrita Bengaluru Campus"/>{!collapsed&&<span>Placement Portal<small>Amrita · Bengaluru</small></span>}</div>
   <button className="mobile-nav-close icon-button" aria-label="Close navigation" onClick={closeMobile}><X size={20}/></button>
   <div className="workspace-label">{!collapsed&&'WORKSPACE'}</div>
   <nav className="side-nav" aria-label="Main navigation">{paths.filter(p=>p.roles.includes(user?.role||'student')).map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} onClick={closeMobile} title={label} aria-label={label}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-bottom"><div className="term-card"><div className="term-dot"/>{!collapsed&&<span>Placement cycle<small>2026 · Active</small></span>}</div><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'Expand navigation':'Collapse navigation'}>{collapsed?<PanelLeftOpen size={17}/>:<><PanelLeftClose size={17}/><span>Collapse menu</span></>}</button></div>
  </aside>
  <div className="main-column"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded={mobile} onClick={()=>setMobile(!mobile)}><Menu size={20}/></button><div className="breadcrumb"><span>Amrita Placement Portal</span><ChevronLeft className="crumb-chevron" size={14}/><strong>{item?.label||'Overview'}</strong></div><div className="topbar-right"><span className="cycle-chip"><span/>2026 placements</span><div className="account-menu"><button className="profile-button" onClick={()=>navigate(user?.role==='student'?'/profile':'/')} aria-label={`Open ${user?.role==='student'?'profile':'overview'}`}><span className="avatar">{user?.full_name?.split(' ').map(n=>n[0]).slice(0,2).join('')}</span><span className="profile-name">{user?.full_name}<small>{user?.role==='admin'?'Placement team':user?.role}</small></span></button><button className="logout-button" aria-label="Sign out" title="Sign out" onClick={()=>void logout()}><LogOut size={18}/><span>Sign out</span></button></div></div></header><main tabIndex={-1} className="page-content"><Outlet/></main><footer className="app-footer"><span>Amrita Placement Portal · Bengaluru campus</span><span>Support your next step</span></footer></div>
  {mobile&&<button aria-label="Close navigation" className="mobile-scrim" onClick={closeMobile}/>}
  <nav className="mobile-bottom-nav" aria-label="Quick navigation">{paths.filter(p=>p.roles.includes(user?.role||'student')).slice(0,4).map(({to,label,icon:Icon})=><NavLink key={to} to={to} end={to==='/'} onClick={closeMobile} aria-label={label}><Icon size={19}/><span>{quickLabels[label]||label}</span></NavLink>)}</nav>
 </div>
}
