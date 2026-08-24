# Deployment checklist

- [ ] Run `sql/001_belongix_complete_schema.sql`.
- [ ] Verify RLS on every user-owned table.
- [ ] Deploy both Edge Functions.
- [ ] Set `AI_API_KEY` and `AI_MODEL` as server secrets.
- [ ] Configure AI usage accounting/background jobs.
- [ ] Configure Razorpay/Stripe server webhooks before charging users.
- [ ] Configure email provider and templates.
- [ ] Test signup, profile save, resume save, job analysis, application tracking, exports and account deletion.
- [ ] Test user A cannot read user B data.
- [ ] Replace any remaining placeholder provider status in Command Center with real telemetry.
