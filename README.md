# Belongix — Resume-Only Platform

This package is a clean resume-focused Belongix foundation. It does not contain the old jobs, courses, mentor, or marketplace workflows.

## 1. Supabase database

Open Supabase SQL Editor and run, in order:

1. `sql/001_belongix_resume_schema.sql`
2. `sql/002_belongix_resume_indexes.sql`
3. `sql/003_belongix_cleanup_and_triggers.sql`
4. `sql/004_ai_rate_limit.sql`

The first migration creates the authoritative `career_profiles`, `resumes`, and `ai_usage` tables and owner-only RLS policies. It does **not** use PostgreSQL's unsupported `CREATE POLICY IF NOT EXISTS` syntax.

## 2. Frontend configuration

Edit `config.js`:

```js
window.BELONGIX_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  RESUME_AI_FUNCTION_URL: 'https://YOUR_PROJECT.supabase.co/functions/v1/resume-ai',
  DELETE_ACCOUNT_FUNCTION_URL: 'https://YOUR_PROJECT.supabase.co/functions/v1/delete-account',
  APP_NAME: 'Belongix'
};
```

Use only the Supabase **anon/public** key in the browser. Never place a service-role key or AI provider key in frontend files.

## 3. Edge Functions

Folder structure:

```text
supabase/functions/resume-ai/index.ts
supabase/functions/delete-account/index.ts
supabase/config.toml
```

Deploy:

```bash
supabase functions deploy resume-ai
supabase functions deploy delete-account
```

Set server-side secrets:

```bash
supabase secrets set AI_API_KEY=...
supabase secrets set AI_MODEL=gpt-4.1-mini
supabase secrets set RATE_LIMIT_PER_HOUR=20
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

The service-role key is required only by `delete-account` and must never be exposed to the browser.

## 4. Features included

- Landing page
- Authentication
- Workspace/dashboard
- Career profile
- Resume builder
- Multiple working templates
- Live resume preview
- Deterministic resume quality/ATS score
- Keyword analysis
- Resume versions
- Local-first persistence
- Supabase cloud synchronization
- AI summary improvement
- AI bullet improvement
- Server-side AI rate limiting
- Account deletion
- Data export
- Theme settings
- Terms and Privacy pages
- SEO robots/sitemap configuration

## 5. Important production configuration

The repository cannot contain your private Supabase project credentials. You must put your real public Supabase URL and anon key into `config.js` before deployment.

After configuration, test:

1. Sign up
2. Email confirmation if enabled
3. Sign in
4. Create a resume
5. Refresh the page and confirm persistence
6. Open the same account in another browser and confirm cloud sync
7. Edit and save a resume
8. Delete a resume
9. Use AI writing after deploying `resume-ai`
10. Export data
11. Delete the account after deploying `delete-account`

The frontend intentionally refuses to pretend Supabase is connected when placeholder credentials are present.
