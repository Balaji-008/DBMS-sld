# University placements portal design

## Goal
Build and run a professional local web application backed by the user's running Oracle Free database, implementing the revised placement ER diagram and Gmail OTP authentication. Coordinate Luna subagents as requested.

## Success criteria
- Real Oracle persistence for students, companies, opportunities, applications, placement outcomes, internships, hackathons/registrations, certificates and contact/document details.
- Gmail OTP login, registration, resend timer, remember-me sessions and role-aware access for students, recruiters and placement team. No password login. Admin role cannot be publicly obtained.
- Professional responsive interface with dashboard, searchable jobs, applications/stage updates, profile, certificates, hackathons, outcome records and reports; every displayed action works or explains what is required.
- Application runs locally with startup/shutdown scripts, documented SMTP configuration, seed dataset clearly identified as demonstration records, health checks and measured verification evidence.
- Existing study materials/diagrams and Oracle/APEX installation preserved; use a new dedicated schema with bounded pool, no Oracle restart.

## Design
New standalone `placements-portal/` project. React/TypeScript/Vite client and Express/TypeScript API served together on localhost:3000 after build. node-oracledb thin driver to FREEPDB1. Additive Oracle schema, foreign keys/check constraints, uniqueness, transactional writes. Normalize repeated contact values, eligibility branches and skills; retain placement requirements/job snapshots as specified in ER. OTP codes and sessions hashed, Aadhaar encrypted; authenticated protected uploads. Gmail SMTP credentials only in gitignored `.env`; no credentials in source, responses or logs. Configure SMTP without pretending unconfigured delivery works. Test transport strictly opt-in and not a login bypass.

## Design system
Product name CampusBridge, university placements portal. Deep academic navy #142b46, white #ffffff, cool canvas #f3f6fa, blue #315fea, teal #137d77, restrained amber #b06b13. Plus Jakarta Sans for interface, DM Sans fallback sans-serif. Quiet 240px navy navigation, generous white workspace, dense readable opportunity rows, real recruiting stages, a distinctive campus architectural line illustration on the login page. No marketing stats fabricated as live data. Tables, filters, drawers and form validation take priority over decoration. Mobile collapsible navigation, keyboard focus and reduced motion support.

## Constraints and assumptions
- No existing source repository; isolate new Git project in new directory and feature branch.
- User explicitly requested multiple Luna subagents. At discovery 5.4GiB available; at most two implementation workers concurrently, no simultaneous heavy builds; Node process cap 768MiB, server 512MiB, browser 768MiB. Recheck memory before launching browser.
- User subsequently requested public hosting at dbms.sld.parswanadh.dev using Wrangler CLI and Cloudflare tunneling. Serve static assets with a Worker custom domain and forward API traffic over a named HTTP VPC tunnel to localhost:3000. Oracle remains the sole database; no D1/KV/database substitute. Existing Oracle/APEX ports are not forwarded by this application.
- Gmail sender/application password remains user configuration; continue implementing while awaiting it. Sending a real OTP requires user-provided local credentials.
- Seed records are synthetic, containing no real Aadhaar numbers. Team attribution uses exact names from reference diagram.

## Risks
APEX web credentials may not be database schema credentials: provision a dedicated application user via container-local administration without touching APEX. Missing Gmail app password can block real email delivery but not implementation and database verification. Enforce authorizations in SQL/API, not role selection in UI. No destructive schema resets during provisioning.
