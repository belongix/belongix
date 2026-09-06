#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for f in "$ROOT/site/index.html" "$ROOT/site/dashboard.html" "$ROOT/site/resume-builder.html" "$ROOT/site/career-profile.html" "$ROOT/site/settings.html" "$ROOT/site/config.js" "$ROOT/site/belongix-auth.js" "$ROOT/site/billing.js" "$ROOT/supabase/COMPLETE_SCHEMA.sql"; do
  test -s "$f" || { echo "Missing/empty: $f"; exit 1; }
done
for f in "$ROOT"/supabase/functions/*/index.ts; do
  test -s "$f" || { echo "Missing/empty: $f"; exit 1; }
done
if grep -R -E "rzp_live_[A-Za-z0-9]+|rzp_test_[A-Za-z0-9]+" -n "$ROOT" --exclude='.env.example' 2>/dev/null; then
  echo 'Possible hard-coded Razorpay key found. Review before deploy.'; exit 1
fi
echo 'Belongix deployment package validation passed.'
