# Belongix — Resume Platform + Razorpay Billing

This package contains the resume-only Belongix application with Razorpay monthly subscriptions and server-side resume quota enforcement.

## Product

- Free: 1 resume
- Plus: ₹199/month — 10 new resumes per billing period
- Pro: ₹499/month — 30 new resumes per billing period
- ATS readiness score
- Job-description keyword analysis
- AI resume writing/rewrite through the Supabase Edge Function
- 15 ATS-safe templates with live preview
- Cloud save/load in Supabase
- Profile and settings pages

## Payment architecture

Razorpay secrets remain server-side in Supabase Edge Function secrets. The browser receives only the Razorpay key ID and subscription ID needed for Checkout.

The payment lifecycle is:

`Belongix → Edge Function → Razorpay Subscription → Checkout → server-side signature verification → Razorpay webhook → Supabase entitlement`

The resume creation limit is also server-side. The builder creates the first resume through `create_resume_with_quota()`, which locks the billing row, checks entitlement, inserts the resume and increments usage in one database transaction.

## SQL

Run:

1. `billing-schema.sql`
2. `resume-schema.sql` (if your existing `resumes` table is not already equivalent)
3. `profile-migration.sql`
4. `ai-usage-schema.sql`

## Edge Functions

Deploy:

- `supabase/functions/razorpay-create-subscription`
- `supabase/functions/razorpay-verify`
- `supabase/functions/razorpay-webhook`
- `supabase/functions/razorpay-cancel-subscription`
- `supabase/functions/resume-ai`

## Server secrets

Set these in Supabase, never in frontend files:

```text
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_PLUS_PLAN_ID=plan_...
RAZORPAY_PRO_PLAN_ID=plan_...
RAZORPAY_WEBHOOK_SECRET=...
ALLOWED_ORIGIN=https://www.belongix.in
OPENAI_API_KEY=...
AI_MODEL=...
AI_API_URL=https://api.openai.com/v1/responses
DAILY_AI_LIMIT=50
```

## Test first

Create the Plus and Pro plans in Razorpay Test Mode, configure the webhook, and test the full flow before switching to Live Mode.

See `RAZORPAY_SETUP.md` and `DEPLOY_CHECKLIST.md` for the exact deployment steps.

## Important

The package does not claim that Razorpay is live until the Test Mode flow has been completed and the Live Mode keys/Plan IDs have been configured. Legal pages, tax/GST configuration, refund/cancellation wording and Razorpay account/KYC requirements should be reviewed before launch.
