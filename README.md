# Belongix — Resume Platform

Resume-only Belongix release package.

## Included
- `index.html` — resume-focused landing page
- `resume-builder.html` — editor, templates, ATS scoring, AI workflow, Supabase persistence
- `career-profile.html` — professional profile
- `settings.html` — account, plan display, deletion flow
- `config.js` — Supabase client configuration
- `belongix-auth.js` / `app.js` / `styles.css` — shared application layer
- `privacy.html`, `terms.html`, `404.html`, `robots.txt`, `sitemap.xml`
- `supabase/schema.sql` — database, RLS and atomic AI usage limit
- `supabase/functions/resume-ai` — server-side AI proxy
- `supabase/functions/delete-account` — authenticated account deletion

## Before accepting real users
1. Run `supabase/schema.sql` in the production Supabase project.
2. Deploy both Edge Functions.
3. Configure `OPENAI_API_KEY`, `AI_MODEL`, `ALLOWED_ORIGIN`, and `DAILY_AI_LIMIT` as server-side secrets.
4. Configure the real payment provider and webhook. The UI intentionally does not fake payments.
5. Test sign-up/login, save/load, RLS, AI, export, deletion, mobile layouts and subscription entitlements on the live domain.
6. Replace the draft Privacy Policy and Terms with legally reviewed documents and real business/support details.
7. Deploy this directory as the site root and verify `https://www.belongix.in` serves this version.

## Supabase
Project URL: `https://vtiaszkqpsuuvfaizqrl.supabase.co`

The publishable/anon key is intentionally client-side. Never put a service-role key or AI provider key in frontend files.


## 2026-09-05 UI refresh
The public landing page was redesigned as a resume-first product experience: product preview, Build→Score→Fix loop, explainable scoring, role targeting, grounded AI demo, templates, examples, pricing, FAQ and CTA. No courses, jobs marketplace, certificates or unrelated modules are included.
