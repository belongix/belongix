# Belongix — AI Resume Builder

A focused, resume-only SaaS. No jobs marketplace, courses, mentors, or other legacy modules.

## Setup
1. Create a Supabase project.
2. Run `sql/001_resume_platform.sql`, then `sql/002_profile_extra_fields.sql`.
3. Copy the public URL + anon key into `config.js` (never the service-role key).
4. Deploy `supabase/functions/resume-ai` (not included — see "AI writing" below) and set its secrets: `AI_API_KEY`, optional `AI_MODEL`.
5. Deploy the static files.

## Fonts
Inter for the product UI. Source Serif 4 (plus optional Fraunces / DM Mono / Inter as resume-document choices) for the resume document itself — kept deliberately separate from the app chrome.

## Data model
- **Career profile** (name, experience, education, skills, social links, preferences) lives in Supabase `career_profiles`, one row per user.
- **Resumes** (content, template, styling, section order) live in the browser under `localStorage['belongix_resumes_v1']` as a list of versions, not in Supabase. This is a known architectural gap, not an oversight — see below.

---

## Changelog (this pass)

**Design system**
- Rebuilt `styles.css` around real design tokens (`--bg`, `--surface`, `--border`, `--text*`, `--accent*`, `--shadow-sm/md/lg`, `--radius-sm/md/lg/xl`), Inter as the single UI font, and a light/dark theme via `[data-theme]` (toggle in Settings → Appearance, persisted to `localStorage`).
- One consistent button system (primary/ghost/danger/small/loading/disabled), form system (focus/error states), card system, modal system, toast system (with an error variant) — shared by every page via `styles.css` and `app.js`.
- Landing hero replaced with a layered, CSS-only 3D document composition (`perspective` + `transform3d`, no WebGL, respects `prefers-reduced-motion`).

**Navigation**
- Every page now has a real mobile nav drawer (hamburger below 820px) in addition to desktop nav — implemented once in `app.js`/`styles.css` and reused everywhere, including inside the Resume Builder (which previously had no mobile nav at all).
- Removed the stray `workspace.html` link bug from an earlier pass (confirmed still fixed — points to `dashboard.html`).

**Workspace / Dashboard**
- No longer static placeholders. It now reads real resume versions out of `belongix_resumes_v1` and renders actual cards (name, last-updated, template, ATS score), a working empty state, and a "+ New Resume" action that opens the builder pre-created.
- Profile-completion stat reads a small cache written by the Career Profile page.

**Resume Builder**
- True A4-proportioned preview with working **zoom controls** (−/+/Fit) instead of a fixed scale hack.
- **Mobile Edit / Preview toggle** — editor and preview no longer fight for space on small screens.
- **Contextual AI buttons** ("✦ Improve with AI" on the summary, "✦ Make stronger" on each role's bullets) call `BX.ai()`, which hits your configured `RESUME_AI_FUNCTION_URL` with the user's real content — it does not fabricate anything client-side. If no AI function is configured, it fails with a clear, human-readable message instead of silently doing nothing or making something up.
- Score is now persisted per resume version so the dashboard can show it.
- Supports `?new=1` (create a resume immediately) and `?r=<id>` (open a specific version) so dashboard cards deep-link correctly.
- 19 templates, live Resume Score panel, Keyword Targeting panel, and full version management (create/switch/rename/duplicate/delete) — carried over and re-themed, not rebuilt from scratch, so nothing regressed.

**Career Profile**
- Added Social Links (LinkedIn/portfolio/GitHub) and Preferences (default template, date format) sections. Requires `sql/002_profile_extra_fields.sql`.
- Save button now shows a real loading state and surfaces Supabase errors as plain language instead of raw error objects.

**Settings**
- Appearance section with a working light/dark toggle.
- "Export my data" downloads a real JSON file of everything stored locally.
- "Delete account" now explains, correctly, that permanent deletion needs a server-side Edge Function with the service-role key — it does not pretend to delete anything from a static frontend, and does not expose or ask for that key.

**404**
- Rebuilt with no references to old platform modules; links to Workspace and Home only.

---

## What's real vs. what's a UI-ready stub — read this before demoing

I'm flagging this explicitly rather than letting "premium and finished" imply things that aren't true:

- **AI writing is wired but not backed.** The buttons call the real `BX.ai()` integration point correctly. Nothing renders unless you deploy an actual `resume-ai` Supabase Edge Function and put its URL in `config.js`. No function code is included here — writing and reviewing a production LLM backend (prompt design, rate limiting, cost control) is a separate task from the frontend pass this was.
- **Resumes are still local-only.** They live in the browser, not in a `resumes` Supabase table (none exists). The dashboard reading real localStorage data is a genuine improvement over the previous static placeholders, but it isn't cross-device sync. Making it real means designing a `resumes` table + RLS policy and migrating the builder's storage layer — a bigger job than this pass, and I didn't want to invent a schema and quietly ship it as if tested.
- **Account deletion is intentionally not implemented client-side.** Doing it "for real" from a static frontend would require either a service-role key in the browser (unsafe, and against your own instructions) or a server-side function that doesn't exist yet. The button says so instead of faking success.
- **"Tested at 320–2560px"**: the CSS is written with fluid grids, `clamp()`-scaled type, and the breakpoints you listed, and I reasoned through each one, but I don't have a real browser here to screenshot 14 viewport widths — I can't honestly claim pixel-verified QA I didn't run.

None of this is hidden in the code — it's the same honesty check as the rest of this file.

---

## QA checklist (what I could actually verify)

- [x] Every inline `<script>` on every page parses without syntax errors (checked programmatically).
- [x] No duplicate DOM `id`s on any page.
- [x] Every internal `href` resolves to a real file in this repo.
- [x] `styles.css` braces balance (no truncated rule).
- [x] Auth gate (`BX.requireAuth`) applied consistently on Workspace, Profile, Settings, and (when Supabase is configured) the Builder.
- [x] Toasts replace all `alert()` calls; errors go through `BX.friendlyError()` rather than raw Supabase messages.
- [ ] Not verified: live Supabase auth flow, live AI function responses, cross-browser rendering, screen-reader pass — none of these are testable without a deployed backend and a real browser, which weren't available here.
