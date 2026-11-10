# Speaking script — Balcha Venkata Parswanadh

**Identifier:** BL.EN.U4EAC24012 · **Suggested slot:** 75–90 seconds · **Viva allocation:** major core architecture, backend integration, login and Gmail SMTP

## Script

“Hello. This project is a placement portal with separate experiences for students, recruiters and the placement team. The browser client is built with React and TypeScript. It sends requests to an Express API, and the API uses Oracle as the application's database.

The deployment path starts at the Cloudflare Worker. It serves the static client and forwards API requests through a private VPC route and named tunnel to the API running beside Oracle. The database listener is not exposed publicly. Gmail has a narrow role: it delivers sign-in codes. Oracle stores the login challenge and session state, along with the placement records. APEX SQL Workshop is a separate inspection tool, not the portal's runtime.

For login, a user selects the appropriate role and requests a code. The server creates and stores the challenge, sends the message through Gmail SMTP, and verifies the submitted code before creating a session. If mail is not configured, the application reports that delivery is unavailable; it does not show a pretend code.

I’ll hand off to Balaji to show how a user action reaches the related Oracle records. The key DBMS idea is that the UI does not connect directly to Oracle: the API applies role checks, bound SQL and transaction boundaries.”

## Demo cue

Point to the browser → Worker/private route → Express → Oracle path on slide 2. Indicate Gmail and APEX as separate side paths. Do not expose credentials, OTPs, or personal account details during the demo.
