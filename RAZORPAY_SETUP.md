# Belongix + Razorpay Billing

Belongix uses **Razorpay Subscriptions** for the paid monthly plans:

- **Plus:** ₹199/month — 10 resumes/month
- **Pro:** ₹499/month — 30 resumes/month

Razorpay's subscription flow is appropriate for recurring monthly billing: create a Razorpay Plan, create a Subscription server-side, open Checkout with the `subscription_id`, verify the returned signature server-side, and use webhooks as the authoritative source for subscription state. citeturn1search2turn1search0

## 1. Create the Razorpay plans

In Razorpay Test Mode, create two monthly plans:

| Belongix plan | Amount | Billing | Internal code |
|---|---:|---|---|
| Plus | ₹199 | Monthly | `plus` |
| Pro | ₹499 | Monthly | `pro` |

Copy the generated Plan IDs (`plan_...`). Razorpay requires a Plan to exist before creating a Subscription. citeturn1search12

## 2. Supabase SQL

Run:

`billing-schema.sql`

in the Belongix Supabase project.

The schema creates:

- `billing_subscriptions` — one entitlement row per user
- `billing_events` — webhook/audit records
- RLS so users can only read their own billing state
- a server-controlled free-plan initializer

## 3. Supabase Edge Function secrets

Set these server-side secrets. **Never put the secret key in frontend JavaScript.**

```text
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_PLUS_PLAN_ID=plan_...
RAZORPAY_PRO_PLAN_ID=plan_...
RAZORPAY_WEBHOOK_SECRET=...
ALLOWED_ORIGIN=https://www.belongix.in
```

Also keep the existing Supabase secrets required by the project.

## 4. Deploy these functions

```text
supabase/functions/razorpay-create-subscription
supabase/functions/razorpay-verify
supabase/functions/razorpay-webhook
supabase/functions/razorpay-cancel-subscription
```

The create-subscription function creates the subscription using the server-side Razorpay API credentials. The browser receives only the Checkout key ID and subscription ID. Razorpay documents subscription creation through `POST /v1/subscriptions`. citeturn1search0

## 5. Configure the webhook

In Razorpay Dashboard → Webhooks, point the webhook to:

`https://vtiaszkqpsuuvfaizqrl.supabase.co/functions/v1/razorpay-webhook`

Use the same `RAZORPAY_WEBHOOK_SECRET` configured in Supabase.

Subscribe to the subscription/payment events needed for lifecycle reconciliation, especially activation/charge/failure/halt/cancellation events. Razorpay supports subscription webhooks for automated state changes and payment events. citeturn0search3turn2search0

## 6. Frontend checkout

`index.html`, `settings.html`, and `billing.js` already contain the frontend wiring.

The browser loads Razorpay Checkout and calls the Supabase Edge Function. The server creates the subscription, then the browser opens Razorpay Checkout.

After Checkout returns:

1. Belongix sends `razorpay_payment_id`, `razorpay_subscription_id`, and `razorpay_signature` to the verify function.
2. The server verifies the HMAC signature using the Razorpay secret.
3. The server checks the subscription against the authenticated Belongix user.
4. Razorpay webhooks reconcile the final subscription state.

Razorpay explicitly requires server-side signature verification before fulfilling a paid service. citeturn1search2turn0search0

## 7. Test before live mode

Use Razorpay Test Mode first. Make a complete test subscription, verify that:

- Checkout opens
- the subscription is created
- signature verification succeeds
- `billing_subscriptions` changes state
- webhook events appear in `billing_events`
- Settings shows the paid plan
- cancellation at period end works

Then replace the test credentials/Plan IDs with Live Mode credentials and complete Razorpay's go-live/KYC requirements. Razorpay recommends testing before going live. citeturn0search5

## Important

Do not mark a user paid merely because the browser says payment succeeded. Razorpay's documented flow requires server-side verification, and webhooks should keep the server-side entitlement state synchronized. citeturn0search6turn0search2

## 8. Resume quota enforcement

Run these SQL files in this order:

1. `billing-schema.sql`
2. your existing resume schema, or `resume-schema.sql` if you need the included resume table
3. `ai-usage-schema.sql` if you use the included `resume-ai` function

New resume creation is enforced server-side through `create_resume_with_quota()`. The browser cannot simply insert a new row to bypass the limit because the included schema intentionally removes the direct `resumes` INSERT policy. The paid quota is reset when Razorpay reports a new billing period through `subscription.charged`.

The builder now saves the actual resume to Supabase on the first edit and thereafter updates that resume. It also shows the remaining monthly quota in the builder header.
