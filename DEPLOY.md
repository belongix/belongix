# Belongix Production Deployment

## 1. Frontend
Upload the contents of `site/` to the web root used by `https://www.belongix.in`.

Do not rename the files. The navigation and auth links expect these paths.

## 2. Supabase database
In the Supabase SQL Editor for project `vtiaszkqpsuuvfaizqrl`, run:

`supabase/COMPLETE_SCHEMA.sql`

This installs the resume-only profile, resume quota, billing, and AI usage database layer.

## 3. Supabase secrets
Set these as Edge Function secrets. Do not put them in frontend JavaScript or Git:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLUS_PLAN_ID`
- `RAZORPAY_PRO_PLAN_ID`
- `RAZORPAY_WEBHOOK_SECRET`
- `ALLOWED_ORIGIN=https://www.belongix.in`
- `OPENAI_API_KEY`
- `AI_MODEL=gpt-5.6-luna`
- `AI_API_URL=https://api.openai.com/v1/responses`
- `DAILY_AI_LIMIT=50`

Supabase also provides the project URL, anon key, and service-role key to Edge Functions automatically; the service-role key must never be placed in the site folder.

## 4. Razorpay plans
You can create the plans manually in Razorpay, or use `scripts/create-razorpay-plans.sh` from a secure machine after exporting the Razorpay server credentials.

Create:

- Belongix Plus — ₹199 — monthly
- Belongix Pro — ₹499 — monthly

The script prints the resulting Plan IDs. Put them into Supabase secrets.

## 5. Deploy Edge Functions
Using Supabase CLI:

```bash
supabase login
supabase link --project-ref vtiaszkqpsuuvfaizqrl

supabase functions deploy razorpay-create-subscription
supabase functions deploy razorpay-verify
supabase functions deploy razorpay-cancel-subscription
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy resume-ai
```

Important: the included `config.toml` already declares the desired JWT behavior. If your CLI version supports config-based deployment, deploy from the package root. Otherwise use the dashboard/CLI function settings to keep JWT verification enabled for authenticated functions and disabled only for `razorpay-webhook`.

## 6. Razorpay webhook
Create an HTTPS webhook in Razorpay Dashboard:

`https://vtiaszkqpsuuvfaizqrl.supabase.co/functions/v1/razorpay-webhook`

Use the same value as `RAZORPAY_WEBHOOK_SECRET`.

Enable at minimum:

- `subscription.authenticated`
- `subscription.activated`
- `subscription.charged`
- `subscription.completed`
- `subscription.cancelled`
- `subscription.halted`
- `subscription.paused`
- `subscription.resumed`

## 7. Live mode
The package contains no Razorpay secret. Before accepting real money, verify the complete flow in Razorpay Test Mode, then switch the server secrets and Plan IDs to Live Mode.

## 8. Security
Never commit `.env`, Razorpay Key Secret, webhook secret, Supabase service-role key, or OpenAI API key.
