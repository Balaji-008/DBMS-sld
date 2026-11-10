# Campus placements API contract

Base `/api`. JSON uses snake_case. All error responses `{error: string}` with 400/401/403/404/409/429/503. All lists `{items: T[], total: number}`. Auth uses HttpOnly same-origin session cookie; fetch credentials same-origin. IDs are numbers. Dates ISO strings. Roles exactly `student`, `recruiter`, `admin`. Frontend label admin as Placement team. All writes enforce ownership server-side. No simulated data fallback.

## Authentication
- GET `/health`: `{status:'ok',database:'connected',smtp_configured:boolean,mail_transport:'smtp'|'json'}` (503 when DB unavailable).
- GET `/auth/config`: `{smtp_configured:boolean,registration_enabled:true,otp_expiry_seconds:300,resend_after:60}`.
- POST `/auth/request-otp` `{email,role,remember_me?:boolean}` => `{challenge_id:string,expires_in:300,resend_after:60,message:string}`. Gmail SMTP by default. Fail clearly with 503 when missing config; do not pretend mail was sent. JSON mail transport only explicit test config, no HTTP OTP exposure.
- POST `/auth/register` `{email,full_name,role:'student'|'recruiter',roll_number?:string,department_id?:number,company_name?:string}` => same challenge response. Student requires roll and department. Recruiter signup waits for placement-team approval; no admin self-registration. Verify email before creating user.
- POST `/auth/verify-otp` `{challenge_id,otp:string}` => `{user:User}`; sets session cookie. Expiring 6 digits, hashed, one use, bounded attempts, 60-second resend cooldown. Recruiter registration yields `{pending_approval:true,message:string}` instead of user until approved.
- GET `/auth/me` => `{user:User}`, or 401.
- POST `/auth/logout` => `{ok:true}` and clears/revokes cookie.
User = `{id,email,full_name,role,student_id:number|null,company_id:number|null}`.

## Catalog and students
- GET `/departments`: list `{id,name,code}` (public, for registration).
- GET `/companies`: list Company, authenticated. POST admin creates Company; PATCH `/:id` admin or owning recruiter.
Company = `{id,name,company_code,industry,contact_email,website}`.
- GET `/students`: list Student; admin only; optional q.
- GET `/students/me`: Student, student only. PUT same URL saves editable profile.
Student = `{id,user_id,full_name,email,roll_number,batch,department_id,department_name,cgpa,active_backlogs,resume_url,skills:string[],placement_status,internship_status,phone_numbers:string[],personal_email,aadhaar_masked,aadhaar_document_url}`.
PUT accepts `{full_name,batch,cgpa,active_backlogs,resume_url,skills:string[],phone_numbers:string[],personal_email,aadhaar_number?:string,aadhaar_document_url}`. Do not return raw Aadhaar; encrypted storage, masked display. Uploaded Aadhaar accessible only owner/admin.
- POST `/uploads` multipart field `file`, optional `kind:'resume'|'aadhaar'|'certificate'` => `{url,name}`. PDF/JPEG/PNG, 5MB cap, authenticated protected storage; no executable formats. GET `/uploads/:id` checks ownership or admin before serving. Certificate/resume URLs can reference these API URLs.

## Opportunities and applications
- GET `/opportunities` query `q,type,status,eligible` => list Opportunity; statuses open/closed/draft. Students see open or closed, no drafts. `eligible=true` applies student cgpa/backlog/department checks. Recruiters see their own only; admin all.
- GET `/opportunities/:id` => Opportunity.
- POST `/opportunities` admin/recruiter creates; PUT `/:id` admin/own recruiter updates. Frontend sends flat Opportunity job/requirements fields, company_id mandatory for admin and forced for recruiter. POST type placement/internship only; hackathons use dedicated endpoint below.
Opportunity = `{id,company_id,company_name,company_industry,title,type:'placement'|'internship'|'hackathon',status,role,description,ctc:number,location,employment_type,application_deadline,min_cgpa:number,max_backlogs:number,eligible_departments:string[],eligible_department_ids:number[],required_skills:string[],created_at,has_applied?:boolean,is_eligible?:boolean,eligibility_reason?:string}`.
- POST `/opportunities/:id/apply` student, `{}` => Application. Enforce eligibility, deadline, open state, no duplicate, and no applying via this route to hackathons.
- GET `/applications` query q/status => list Application, scoped to student or recruiter's company/admin all.
- PATCH `/applications/:id/status` `{status}` => Application. Student can only withdraw own active application; recruiter/admin transitions applied->screening/rejected; screening->interview/rejected; interview->selected/rejected. Terminal states no reset. Return 409 on invalid transitions.
Application = `{id,student_id,student_name,roll_number,opportunity_id,opportunity_title,company_name,company_id,type,status:'applied'|'screening'|'interview'|'selected'|'rejected'|'withdrawn',applied_at,updated_at}`.

## Outcomes
- GET `/placements` => list Placement, role-scoped.
- POST `/placements` admin/own recruiter `{application_id,role,description,ctc,location,employment_type,offer_date?:string}` => Placement. Requires selected placement application; transactional unique outcome. Snapshot min_cgpa/max_backlogs/eligible branches/skills from source opportunity; preserves the ER diagram's composite Job_Details/Requirements on PLACEMENTS.
Placement = `{id,student_id,student_name,company_id,company_name,opportunity_id,application_id,role,description,ctc,location,employment_type,offer_date,is_current,min_cgpa,max_backlogs,eligible_departments:string[],required_skills:string[]}`.
- GET `/internships` => list Internship, role-scoped.
- POST `/internships` admin/own recruiter `{application_id,role,start_date,end_date,ppo_converted?:boolean}` => Internship. Requires selected internship application; no duplicate.
Internship = `{id,student_id,student_name,company_id,company_name,opportunity_id,application_id,role,start_date,end_date,ppo_converted}`.
- GET `/certificates` => list Certificate; own for student, all for admin, own-company applicants only for recruiter.
- POST `/certificates` student (own) or admin `{student_id?:number,certificate_name,issuer,completion_date,credential_id,certificate_url}` => Certificate.
- DELETE `/certificates/:id` owner or admin => `{ok:true}`.
Certificate = `{id,student_id,student_name,certificate_name,issuer,completion_date,credential_id,certificate_url}`.

## Hackathons
- GET `/hackathons` => list Hackathon (authenticated).
- POST `/hackathons` admin/recruiter `{company_id,title,description,mode:'online'|'offline'|'hybrid',start_date,end_date,application_deadline,location,team_size:number}` creates linked hackathon opportunity and hackathon atomically.
- POST `/hackathons/:id/register` student `{team_name}` => `{id,hackathon_id,student_id,team_name,status:'registered'}`. Enforce deadline/status/one registration per student.
Hackathon = `{id,opportunity_id,title,company_id,company_name,description,mode,start_date,end_date,application_deadline,location,team_size,status,registrations_count,already_registered:boolean}`.
- GET `/hackathons/:id/registrations` admin/own company recruiter or student own entry => list `{id,student_id,student_name,roll_number,team_name,status,registered_at}`.

## Overview and administration
- GET `/dashboard` => `{metrics:{label:string,value:number,suffix?:string}[],funnel:{label:string,value:number}[],recent_applications:Application[],upcoming:Opportunity[],profile_completion:number,activity:{id:number,title:string,description:string,created_at:string}[]}`. Derive numbers from real DB data, role-scope everything.
- GET `/reports` admin/recruiter => `{departments:{name:string,students:number,placed:number}[],companies:{name:string,offers:number,avg_ctc:number}[],summary:{total_students:number,placed_students:number,placement_rate:number,avg_ctc:number}}`.
- GET `/users/pending` admin => list `{id,full_name,email,role,company_name}`.
- POST `/users/:id/approve` admin => `{ok:true}` activates recruiter.

## Database interface
Root `server/src/db.ts` exported `initDb():Promise<void>`, `closeDb():Promise<void>`, `withConnection<T>(fn:(connection:oracledb.Connection)=>Promise<T>):Promise<T>`, `query<T=any>(sql:string,binds?:oracledb.BindParameters):Promise<T[]>`. Backend owns this module. Bind SQL parameters everywhere. Query uses outFormat OBJECT, converts keys to lowercase; fetch CLOB as strings. Pool max 4, pool min 1. Database schema documentation in `database/SCHEMA.md` is authoritative for SQL column names. Database agent owns only `database/**` and its task report; frontend owns only `client/**`; backend owns only `server/src/**` and its task report. Orchestrator owns root configuration, scripts, integration, tests, docs.
