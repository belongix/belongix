# Belongix deployment checklist

## Supabase

Run these files in Supabase SQL Editor, in order:

1. `sql/001_belongix_resume_schema.sql`
2. `sql/002_belongix_resume_indexes.sql`
3. `sql/003_belongix_cleanup_and_triggers.sql`
4. `sql/004_ai_rate_limit.sql`

The schema uses `drop policy if exists` + `create policy`, which is valid PostgreSQL syntax. Do not change it to `create policy if not exists`.

## Edge Functions

From the repository root:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy resume-ai
supabase functions deploy delete-account
```

Set secrets:

```bash
supabase secrets set AI_API_KEY=YOUR_AI_KEY
supabase secrets set AI_MODEL=gpt-4.1-mini
supabase secrets set RATE_LIMIT_PER_HOUR=20
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and is used only by `delete-account`.

## Frontend

Edit `config.js` with the public Supabase URL and anon key:

```js
window.BELONGIX_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  RESUME_AI_FUNCTION_URL: 'https://YOUR_PROJECT.supabase.co/functions/v1/resume-ai',
  DELETE_ACCOUNT_FUNCTION_URL: 'https://YOUR_PROJECT.supabase.co/functions/v1/delete-account',
  APP_NAME: 'Belongix'
};
```

Do not commit a service-role key or AI key.

## Smoke test

- Sign up/sign in
- Create resume
- Save, refresh, and confirm data persists
- Open the account on another browser and confirm cloud resume sync
- Duplicate, rename and delete a resume
- Check ATS score and keyword analysis
- Run AI summary/bullet improvement after Edge Function deployment
- Export account data
- Delete the test account

## Static hosting

The project is plain HTML/CSS/JS and can be deployed to GitHub Pages, Vercel, Netlify, or another static host. The Supabase Edge Functions remain deployed in Supabase.
