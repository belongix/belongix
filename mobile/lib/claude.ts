/**
 * Belongix — Claude API Helper
 * All Anthropic API calls centralized here.
 * Routes through direct fetch (move to Edge Function before production).
 */

import { Profile } from './supabase';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
// ⚠️  Move this key to a Supabase Edge Function before launch
const API_KEY = 'YOUR_ANTHROPIC_API_KEY';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
}

/** Core fetch wrapper — all Claude calls go through here */
async function callClaude(
  messages: Message[],
  system: string,
  maxTokens = 1000
): Promise<string> {
  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data: ClaudeResponse = await response.json();
  return data.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
}

/** Build Bexi system prompt from user profile */
export function buildBexiSystemPrompt(profile: Profile | null): string {
  const name = profile?.full_name ?? 'there';
  const role = profile?.role ?? 'a professional';
  const city = profile?.city ?? 'India';
  const skills = profile?.skills ?? 'not specified';
  const score = profile?.career_score ?? 30;
  const exp = profile?.experience ?? 'not specified';

  return `You are Bexi, Belongix's AI career guide for Indian professionals. You are warm, direct, and deeply knowledgeable about India's job market.

USER CONTEXT:
- Name: ${name}
- Current Role: ${role}
- City: ${city}
- Experience: ${exp}
- Skills: ${skills}
- Career Score: ${score}/100

RULES:
1. Always give India-specific advice — mention cities, Indian companies, LPA salary ranges.
2. Be concise on mobile — 3-5 sentences per response unless asked for more.
3. Use ₹ for salary, LPA for annual packages.
4. If the user asks about salary, give P25/Median/P75 ranges for their role and city.
5. Never say you can't help. Always provide value.
6. For resume critique, return structured feedback with ATS score.
7. For interview prep, ask questions one at a time.
8. For negotiation, roleplay as the HR/manager realistically.
9. Personalise every response using the user context above.
10. You have unlimited responses — never mention a cap or limit.`;
}

/** Send a chat message to Bexi */
export async function askBexi(
  messages: Message[],
  profile: Profile | null
): Promise<string> {
  try {
    return await callClaude(messages, buildBexiSystemPrompt(profile), 800);
  } catch {
    // Graceful fallback — scripted responses for common queries
    const last = messages[messages.length - 1]?.content?.toLowerCase() ?? '';
    if (last.includes('salary') || last.includes('ctc') || last.includes('lpa')) {
      return `Based on current Indian market data, the salary for your role in ${profile?.city ?? 'major cities'} typically ranges from ₹8–35 LPA depending on experience. For a more precise benchmark, check the Salary Intelligence tab where you can see P25/Median/P75 breakdowns by company type. Want me to help you negotiate a specific offer?`;
    }
    if (last.includes('resume') || last.includes('cv')) {
      return `Your resume is your first impression — let me help optimise it. Key areas I focus on: (1) ATS keyword density for your target role, (2) quantified achievements over job descriptions, (3) skills section alignment with job requirements. Tap the 📄 button to upload your resume and I'll give you a detailed critique!`;
    }
    if (last.includes('interview') || last.includes('mock')) {
      return `Let's do a mock interview! Tell me: (1) Which company are you targeting? (2) What role? (3) Which round — Technical, HR, or System Design? Once you share these, I'll ask you questions one by one and evaluate your answers in real-time.`;
    }
    return `I'm here to help with your career! You can ask me about salary benchmarks, interview prep, resume critique, career switches, or negotiation strategies. What would you like to tackle first?`;
  }
}

/** Evaluate a single interview answer and return JSON score */
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string,
  company: string
): Promise<{ score: number; feedback: string; suggestion: string }> {
  const system = `You are a senior interviewer at ${company}. Evaluate the candidate's answer strictly. Return ONLY valid JSON with keys: score (1-10), feedback (2 sentences), suggestion (one improved line they could say).`;
  const userMsg = `Question: ${question}\n\nAnswer: ${answer}\n\nRole: ${role}`;

  try {
    const raw = await callClaude([{ role: 'user', content: userMsg }], system, 400);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const words = answer.split(' ').length;
    const score = Math.min(8, Math.max(3, Math.floor(words / 10) + 4));
    return {
      score,
      feedback: 'Good attempt. Your answer covers the basics but could use more specific examples.',
      suggestion: 'Try using the STAR method: describe the Situation, Task, Action, and Result clearly.',
    };
  }
}

/** Compare two job offers with AI */
export async function compareOffers(
  offerA: Record<string, string | number>,
  offerB: Record<string, string | number>
): Promise<{
  winner: 'A' | 'B';
  scores: { compensation: number; growth: number; stability: number; wfh: number; learning: number };
  reasoning: string;
  watchOut: string;
}> {
  const system = `You are a career advisor helping an Indian professional compare two job offers. Return ONLY valid JSON with: winner (A or B), scores (object with compensation/growth/stability/wfh/learning each 1-10), reasoning (2-3 sentences), watchOut (one risk to watch for).`;
  const userMsg = `Offer A: ${JSON.stringify(offerA)}\n\nOffer B: ${JSON.stringify(offerB)}`;

  try {
    const raw = await callClaude([{ role: 'user', content: userMsg }], system, 500);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const ctcA = Number(offerA.ctc ?? 0);
    const ctcB = Number(offerB.ctc ?? 0);
    const winner = ctcA >= ctcB ? 'A' : 'B';
    return {
      winner,
      scores: { compensation: winner === 'A' ? 8 : 6, growth: 7, stability: 7, wfh: 6, learning: 7 },
      reasoning: `Offer ${winner} offers a stronger compensation package. Both roles seem reasonable for career growth in the Indian market.`,
      watchOut: 'Verify the actual take-home after TDS deductions and compare ESOPs vesting schedules carefully.',
    };
  }
}

/** Generate a cover letter from resume data */
export async function generateCoverLetter(
  resumeData: string,
  company: string,
  role: string,
  tone: string
): Promise<string> {
  const system = `You are a professional cover letter writer specialising in Indian job applications. Write a compelling, ${tone} cover letter. Keep it under 250 words. Mention specific Indian market context where relevant.`;
  const userMsg = `Write a cover letter for ${role} at ${company}.\n\nResume context:\n${resumeData}`;

  try {
    return await callClaude([{ role: 'user', content: userMsg }], system, 600);
  } catch {
    return `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${role} position at ${company}. With my background in ${resumeData.slice(0, 100)}...\n\nI am excited about the opportunity to contribute to ${company}'s continued growth and success.\n\nSincerely,\n[Your Name]`;
  }
}
