export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI service is not configured." });

  try {
    const { message, resume, jobDescription, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const system = `You are Bexi, Belongix's evidence-first AI career copilot.
Never invent employment, metrics, skills, certifications, projects, employers, dates, or qualifications.
Help the user improve truthful career materials. Be concise, practical, recruiter-aware, and specific.
When rewriting resume content, preserve facts and mark any missing metric as [ADD METRIC] rather than guessing.
Resume context:
${JSON.stringify(resume || {}, null, 2)}
Target job description:
${jobDescription || "None provided"}`;

    const contents = [
      { role: "user", parts: [{ text: system }] },
      ...history.slice(-10).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.35, maxOutputTokens: 1400 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: data?.error?.message || "AI provider request failed." });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("")?.trim();
    if (!text) return res.status(502).json({ error: "AI provider returned no text." });

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: "Bexi could not complete that request." });
  }
}
