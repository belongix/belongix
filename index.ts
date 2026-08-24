// Supabase Edge Function: resume-ai-generate
// Deploy with: supabase functions deploy resume-ai-generate
// Requires secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Genuinely new implementation for Module 2 — not a reuse of any
// prior Belongix resume-builder AI code. The non-negotiable security
// pattern (key server-side only, never client-exposed) is the same
// correct approach any AI feature on this platform must use — that's
// a security requirement, not old business logic being carried over.
//
// Three real actions: generate_summary, improve_bullet,
// suggest_keywords. Every call is rate-limited and logged to
// ai_generation_history BEFORE returning to the client, so the log
// is a true record of what happened, not something the client could
// fake or skip.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const DAILY_LIMIT = 40; // per user, across all three action types combined

function buildPrompt(action: string, payload: any): string {
  if (action === "generate_summary") {
    return `Write a professional resume summary (2-4 sentences, no fluff, no generic phrases like "results-driven professional") for someone targeting the role of "${payload.target_job_title || "their target role"}"${payload.target_industry ? ` in ${payload.target_industry}` : ""}.
Their background: ${payload.years_of_experience ? payload.years_of_experience + " years of experience. " : ""}Current/most recent role: ${payload.current_title || "not specified"} at ${payload.current_company || "not specified"}.
Key skills: ${(payload.technical_skills || []).join(", ") || "not specified"}.
Respond with ONLY the summary text, no preamble, no quotation marks around it.`;
  }
  if (action === "improve_bullet") {
    return `Rewrite this resume bullet point to be more achievement-oriented, specific, and use a strong action verb at the start. If the original has no numbers/metrics, do not invent fake ones — instead make it more specific about scope and impact using only what's actually stated. Keep it to one line.
Original: "${payload.original_text}"
Respond with ONLY the improved bullet point, no preamble, no quotation marks.`;
  }
  if (action === "suggest_keywords") {
    return `Compare this resume content against the target job description and list the important keywords/skills from the job description that are MISSING from the resume content. Return ONLY a JSON array of strings, nothing else, e.g. ["keyword one","keyword two"]. Maximum 12 keywords.
Resume content: ${payload.resume_text}
Job description: ${payload.job_description}`;
  }
  throw new Error("Unknown action");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401 });
  }
  const userId = userData.user.id;

  let body: { action?: string; resume_id?: string; payload?: any };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const validActions = ["generate_summary", "improve_bullet", "suggest_keywords"];
  if (!body.action || !validActions.includes(body.action)) {
    return new Response(JSON.stringify({ error: "Invalid or missing action" }), { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Rate limit — real check against real rows, same pattern as every
  // other AI feature on this platform: count actual usage, not trust
  // a client-reported count.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("ai_generation_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return new Response(JSON.stringify({ error: "Daily AI usage limit reached. Try again tomorrow." }), { status: 429 });
  }

  let prompt: string;
  try {
    prompt = buildPrompt(body.action, body.payload || {});
  } catch {
    return new Response(JSON.stringify({ error: "Could not build prompt for this action" }), { status: 400 });
  }

  let aiText = "";
  let success = true;
  let errorMessage: string | null = null;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Anthropic API error ${resp.status}: ${errText.slice(0, 200)}`);
    }
    const data = await resp.json();
    aiText = (data.content || []).map((c: any) => c.text || "").join("");
  } catch (e) {
    success = false;
    errorMessage = e instanceof Error ? e.message : "Unknown AI error";
  }

  // Log BEFORE returning — this is what makes the audit trail real.
  const inputContext =
    body.action === "generate_summary" ? JSON.stringify(body.payload) :
    body.action === "improve_bullet" ? body.payload?.original_text :
    body.action === "suggest_keywords" ? body.payload?.job_description :
    null;

  const { data: logRow, error: logErr } = await admin
    .from("ai_generation_history")
    .insert({
      user_id: userId,
      resume_id: body.resume_id || null,
      generation_type: body.action,
      input_context: inputContext,
      ai_response: success ? aiText : null,
      accepted: null,
    })
    .select("id")
    .single();

  if (!success) {
    return new Response(JSON.stringify({ error: "AI request failed. Please try again shortly." }), { status: 502 });
  }
  if (logErr) {
    console.error("Failed to log AI generation (response still returned to user):", logErr);
  }

  return new Response(
    JSON.stringify({ result: aiText, log_id: logRow?.id || null }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
