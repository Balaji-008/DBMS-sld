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
  <img src={animated?gif:poster} alt={alt} loading={eager?'eager':'lazy'} decoding="async" />
  {reduced===false&&<button className="motion-toggle" type="button" aria-label={paused?'Play animation':'Pause animation'} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={14}/>:<Pause size={14}/>}<span>{paused?'Play':'Pause'}</span></button>}
 </div>
}

export default function Landing(){return <main className="landing-page">
 <header className="landing-nav"><a className="landing-brand" href="/" aria-label="Amrita Placement Portal home"><img src={logo} alt="Amrita Bengaluru Campus"/><span>Placement Portal</span></a><nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#for-everyone">For your role</a><a className="landing-signin" href="/login">Sign in <ArrowRight size={15}/></a></nav></header>
 <section className="landing-hero">
  <div className="hero-copy"><p className="landing-kicker"><span/> Amrita Vishwa Vidyapeetham · Bengaluru</p><h1>From campus learning<br/>to a career in motion.</h1><p className="hero-intro">A shared place for students, recruiters, and the placement team to find the next right opportunity.</p><div className="hero-actions"><a className="landing-primary" href="/login">Enter the portal <ArrowRight size={16}/></a><a className="landing-secondary" href="#how-it-works">Explore the journey <span>↓</span></a></div><div className="hero-assurance"><ShieldCheck size={16}/><span>Sign in with email verification</span></div></div>
  <div className="hero-aside"><div className="hero-aside-rule"/><p>Learning finds its<br/>direction in the world.</p><span>AMRITA · BENGALURU</span><MotionImage className="hero-motion" eager gif="/media/career-orbit.gif" poster="/media/career-orbit-poster.png" alt="Career pathways in motion"/></div>
  <div className="hero-campus"><picture className="campus-sketch"><source type="image/webp" srcSet="/media/campus-sketch.webp"/><img src="/media/campus-sketch.png" width="2172" height="724" loading="eager" decoding="async" fetchPriority="high" alt="Architectural sketch of Amrita Bengaluru campus"/></picture><span className="campus-caption">Bengaluru campus</span></div>
 </section>
 <section className="landing-intro" id="how-it-works"><div className="intro-heading"><span className="section-index">A connected journey</span><h2>Bring every step<br/>of placement into view.</h2><p>Find opportunities, follow applications, and keep the people guiding your next step in the loop.</p></div><div className="journey-feature"><MotionImage gif="/media/career-orbit.gif" poster="/media/career-orbit-poster.png" alt="Career paths around a shared center"/><div className="feature-caption"><Compass size={16}/><span>One clear view from discovery to outcome</span></div></div></section>
 <section className="landing-pathways" id="for-everyone"><div className="pathways-art"><MotionImage gif="/media/pathways.gif" poster="/media/pathways-poster.png" alt="Pathways branching toward new opportunities"/><div className="art-note">Many paths. A place to begin.</div></div><div className="pathways-copy"><span className="section-index">Built around the people in your placement journey</span><h2>Different roles.<br/>A shared direction.</h2><div className="role-list"><a href="/login?role=student"><span className="role-icon"><UsersRound size={18}/></span><span><strong>Students</strong><small>Explore roles, track applications, and keep your profile current.</small></span><ArrowRight size={16}/></a><a href="/login?role=recruiter"><span className="role-icon"><BriefcaseBusiness size={18}/></span><span><strong>Recruiters</strong><small>Share openings and manage your candidate pipeline.</small></span><ArrowRight size={16}/></a><a href="/login?role=admin"><span className="role-icon"><Compass size={18}/></span><span><strong>Placement team</strong><small>Coordinate access, opportunities, and student outcomes.</small></span><ArrowRight size={16}/></a></div></div></section>
 <section className="landing-campus-note"><div><span className="section-index">Campus to career</span><h2>Rooted here.<br/>Ready for what’s next.</h2><p>Amrita’s Bengaluru campus is where this journey begins. The portal connects its placement community around each student’s next step.</p><a href="/login">Continue to sign in <ArrowRight size={15}/></a></div><picture className="opportunity-sketch"><source type="image/webp" srcSet="/media/opportunity-sketch.webp"/><img src="/media/opportunity-sketch.png" width="1448" height="1086" loading="lazy" decoding="async" alt="Illustration of a bridge connecting learning and career opportunities"/></picture></section>
 <footer className="landing-footer"><a href="/" className="footer-brand"><img src={logo} alt="Amrita Bengaluru Campus"/><span>Placement Portal</span></a><span>Amrita Vishwa Vidyapeetham · Bengaluru</span><a href="/login">Sign in</a></footer>
 </main>}
