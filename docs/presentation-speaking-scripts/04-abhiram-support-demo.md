# Speaking script — Balusu Naga Sri Abhiram

**Identifier:** BL.EN.U4EAC24013 · **Suggested slot:** 60–75 seconds · **Viva allocation:** synthetic sample data, documentation and demo QA support

## Script

“I’ll help close the walkthrough by showing how we keep the demo understandable and how to inspect the data safely. The seeded records are synthetic examples used to exercise student, recruiter and placement-team journeys. They are there to demonstrate application behavior and relationships; they should not be presented as real placement outcomes or campus statistics.

For inspection, we use APEX SQL Workshop with a read-only account on the business tables. The project’s SQL Workshop guide has examples that join a student to an application and opportunity. APEX is separate from the portal. It does not provide the portal login, and its access does not include authentication challenges, session records or upload metadata.

The demo checklist follows the user journey: sign in, view an eligible opportunity, apply, progress the application as a recruiter or placement team member, and inspect the relevant rows. QA reports cover exercised flows and tested viewport sizes, but they do not prove every validation case or certify physical devices.

That gives us a clean handoff: show the workflow in the portal, then use the documented read-only query to connect it back to the relational model.”

## Demo cue

Follow `docs/team-viva/DEMO-CHECKLIST.md`. Use synthetic accounts and records only; keep student personal information and OTP values off screen.
