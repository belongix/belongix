Belongix clean rebuild: Next.js App Router + Supabase Auth/Postgres.

Required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (publishable key only; never use a service-role key in browser code).

Local setup: copy .env.example to .env.local, run npm install, then npm run dev.

In Supabase Authentication → URL Configuration set Site URL to https://www.belongix.in and allow https://www.belongix.in/auth/callback plus http://localhost:3000/auth/callback. The confirmation email template should use {{ .ConfirmationURL }}. Signup/reset sends an explicit callback URL.

Current foundation: signup, confirmation callback, sign-in, resend confirmation, password-reset email, sign-out, profile CRUD, and create/list resume records. Resume editing, Bexi, job matching, salary insights, Academy, mentors, billing, and browser tests remain planned milestones.
