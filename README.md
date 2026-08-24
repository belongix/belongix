# Belongix — Automation-first career platform

This package is a cleaned, cohesive static frontend + Supabase schema for the Belongix rebuild. It uses an original, Rezi-inspired information architecture: simple navigation, focused editor/preview workflow, ATS analysis, job targeting, application tracking and career tools. Rezi's current public docs describe a clean ATS-focused workflow, live scoring, keyword targeting, template/format controls and downloadable PDF/DOCX; Belongix follows those product principles without copying proprietary code or assets.

## Deploy
1. Upload the contents of this folder to your Git repository.
2. Run `sql/001_belongix_complete_schema.sql` in Supabase SQL Editor.
3. Confirm RLS policies and adjust admin authorization before production.
4. Configure Supabase Edge Functions with `.env.example` values. Never put AI/payment/email secrets in browser code.
5. Deploy `edge-functions/*` with Supabase CLI and set `AI_API_KEY`/`AI_MODEL` as secrets.
6. Configure your payment provider webhooks and email provider before enabling paid plans/transactional email.

## Important
- The browser may contain a Supabase anon key; that key is designed for public clients. Security must come from RLS and server authorization.
- AI is intentionally server-side. The included static pages work without an AI provider by using deterministic/local features and clearly indicate when external AI configuration is required.
- The static application uses localStorage as a resilient UI fallback. For production, wire every create/update flow to the corresponding Supabase table and background job queue.
- Payment status must come only from verified provider webhooks, never from frontend JavaScript.
