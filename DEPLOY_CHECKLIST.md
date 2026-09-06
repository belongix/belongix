# Belongix production payment checklist

## Supabase SQL

Run, in order:

1. `billing-schema.sql`
2. `resume-schema.sql` (if your `resumes` table is not already present)
3. `profile-migration.sql`
4. `ai-usage-schema.sql` (for the included AI function)

## Edge Functions

Deploy:

- `razorpay-create-subscription`
- `razorpay-verify`
- `razorpay-webhook`
- `razorpay-cancel-subscription`
- `resume-ai`

## Supabase secrets

Set server-side only:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_PLUS_PLAN_ID`
- `RAZORPAY_PRO_PLAN_ID`
- `RAZORPAY_WEBHOOK_SECRET`
- `ALLOWED_ORIGIN=https://www.belongix.in`
- `OPENAI_API_KEY`
- `AI_MODEL`
- `AI_API_URL`
- `DAILY_AI_LIMIT`

## Razorpay

Create two monthly plans in Test Mode:

- Plus: ₹199/month
- Pro: ₹499/month

Configure the webhook endpoint:

`https://vtiaszkqpsuuvfaizqrl.supabase.co/functions/v1/razorpay-webhook`

Enable the subscription lifecycle events used by the webhook, including authenticated, activated, charged, pending, halted, paused, resumed, cancelled and completed.

## Required end-to-end tests

- New account can create exactly 1 free resume.
- Free account cannot create a second resume through the browser/API.
- Plus checkout creates a Razorpay subscription.
- Successful authorization updates the Belongix billing row.
- Plus allows 10 new resumes in the billing period.
- Pro allows 30 new resumes in the billing period.
- `subscription.charged` rolls the usage counter into the new period.
- Failed recurring payment moves the subscription to a non-active state.
- Cancel-at-period-end does not immediately remove current access.
- Webhook signature rejects tampered requests.
- AI calls go through the Supabase Edge Function; no provider secret exists in frontend files.

Do not switch to Razorpay Live Mode until the complete Test Mode flow has passed.
