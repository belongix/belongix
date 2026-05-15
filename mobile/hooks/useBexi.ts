// hooks/useBexi.ts — Bexi chat convenience hook

import { useCallback } from 'react';
import { useBexiStore } from '../store/bexiStore';
import { useAuthStore } from '../store/authStore';
import { askClaude, buildBexiSystemPrompt } from '../lib/claude';

export function useBexi() {
  const { messages, isTyping, addMessage, saveMessage, setTyping, clearHistory, loadHistory } = useBexiStore();
  const { profile, user } = useAuthStore();

  const systemPrompt = buildBexiSystemPrompt({
    name:         profile?.full_name,
    role:         profile?.role,
    city:         profile?.city,
    skills:       profile?.skills,
    experience:   profile?.experience,
    career_score: profile?.career_score,
  });

  const send = useCallback(async (text: string): Promise<string> => {
    const userMsg = addMessage({ role: 'user', content: text, timestamp: new Date() });
    await saveMessage('user', text);
    setTyping(true);

    try {
      const contextMsgs = messages.slice(-10).map(m => ({
        role: (m.role === 'bot' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      }));
      contextMsgs.push({ role: 'user', content: text });

      const reply = await askClaude(contextMsgs, { system: systemPrompt, maxTokens: 800 });
      addMessage({ role: 'bot', content: reply, timestamp: new Date() });
      await saveMessage('bot', reply);
      return reply;
    } catch {
      const errMsg = "I'm having a brief connection issue. Please try again.";
      addMessage({ role: 'bot', content: errMsg, timestamp: new Date() });
      return errMsg;
    } finally {
      setTyping(false);
    }
  }, [messages, systemPrompt]);

  return { messages, isTyping, send, clearHistory, loadHistory };
}
