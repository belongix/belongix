#!/usr/bin/env bash
set -euo pipefail
: "${RAZORPAY_KEY_ID:?Set RAZORPAY_KEY_ID first}"
: "${RAZORPAY_KEY_SECRET:?Set RAZORPAY_KEY_SECRET first}"
BASE='https://api.razorpay.com/v1/plans'
create_plan() {
  local name="$1" amount="$2"
  curl -fsS -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET" \
    -H 'Content-Type: application/json' \
    -X POST "$BASE" \
    --data "{\"period\":\"monthly\",\"interval\":1,\"item\":{\"name\":\"$name\",\"amount\":$amount,\"currency\":\"INR\",\"description\":\"$name — Belongix resume subscription\"}}"
  echo
}
echo 'Creating Belongix Plus (₹199/month)...'
create_plan 'Belongix Plus' 19900
echo 'Creating Belongix Pro (₹499/month)...'
create_plan 'Belongix Pro' 49900
echo 'Copy the returned plan IDs into Supabase secrets:'
echo 'RAZORPAY_PLUS_PLAN_ID=plan_...'
echo 'RAZORPAY_PRO_PLAN_ID=plan_...'
