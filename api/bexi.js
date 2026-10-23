export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI service is not configured." });
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sign in to use Bexi." });
  const supabaseUrl = process.env.SUPABASE_URL || "https://vtiaszkqpsuuvfaizqrl.supabase.co";
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_o2OsxbEzbVd8JXdVU_z7Zw_kpmzt-nm";
  try {
    const userResponse = await fetch(supabaseUrl + "/auth/v1/user", { headers: { apikey: supabaseKey, Authorization: "Bearer " + token } });
    if (!userResponse.ok) return res.status(401).json({ error: "Your session expired. Sign in again to use Bexi." });
    const user = await userResponse.json();
    if (!user?.id) return res.status(401).json({ error: "Your session could not be verified." });
    const { message, resume, jobDescription, history = [] } = req.body || {};
    if (typeof message !== "string" || !message.trim()) return res.status(400).json({ error: "Message is required." });
    if (message.length > 6000) return res.status(413).json({ error: "Please keep each message under 6,000 characters." });
    const quotaResponse = await fetch(supabaseUrl + "/rest/v1/rpc/consume_ai_usage", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: supabaseKey, Authorization: "Bearer " + token },
      body: JSON.stringify({ p_user_id: user.id, p_limit: 20 })
    });
    if (!quotaResponse.ok) return res.status(503).json({ error: "Bexi usage could not be verified. Please try again shortly." });
    const quota = await quotaResponse.json();
    if (quota !== true) return res.status(429).json({ error: "You've reached today's Bexi limit. Please try again tomorrow." });
    const safeHistory = Array.isArray(history) ? history.slice(-10).map(m => ({
      role: m?.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m?.content || "").slice(0, 4000) }]
    })) : [];
    const system = "You are Bexi, Belongix's evidence-first AI career copilot.\n" +
      "Never invent employment, metrics, skills, certifications, projects, employers, dates, or qualifications.\n" +
      "Help improve truthful career materials. Be concise, practical, recruiter-aware, and specific.\n" +
      "When rewriting resume content, preserve facts and mark missing metrics as [ADD METRIC] rather than guessing.\n" +
      "Resume context:\n" + JSON.stringify(resume || {}).slice(0, 12000) +
      "\nTarget job description:\n" + String(jobDescription || "None provided").slice(0, 15000);
    const contents = [
      { role: "user", parts: [{ text: system }] },
      ...safeHistory,
      { role: "user", parts: [{ text: message.trim() }] }
    ];
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.35, maxOutputTokens: 1400 } })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Bexi provider error:", data?.error?.message || response.status);
      return res.status(502).json({ error: "Bexi's AI provider is temporarily unavailable. Please try again shortly." });
    }
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("")?.trim();
    if (!text) return res.status(502).json({ error: "The AI provider returned no response. Please try again." });
    return res.status(200).json({ text });
  } catch (error) {
    console.error("Bexi request failed:", error?.message || error);
    return res.status(500).json({ error: "Bexi could not complete that request." });
  }
}
