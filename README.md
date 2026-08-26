# Belongix — AI Resume Builder

A clean-slate, resume-only SaaS.

## Product scope
Belongix is intentionally focused on one product: building, improving, checking, versioning and exporting resumes.

No job marketplace, job matching, applications or unrelated career modules are included.

## Core flow
Sign up → Career Profile → Resume Builder → AI Assistant → Quality Check → Template/Preview → Export.

## Setup
1. Create a Supabase project.
2. Run `sql/001_resume_platform.sql`.
3. Copy the public values into `config.js`.
4. Deploy `supabase/functions/resume-ai`.
5. Set Edge Function secrets:
   - `AI_API_KEY`
   - optional `AI_MODEL`
6. Deploy the static files.

Never put an AI provider key or Supabase service-role key in browser JavaScript.

## Fonts
DM Sans for the product UI.
Source Serif 4 for the resume document.

## Data rule
Career profile and resume data belong in Supabase. Browser storage is not used as the source of truth.
