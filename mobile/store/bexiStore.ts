/**
 * Belongix — Bexi Store (Zustand)
 * Manages chat messages, typing state, and conversation history.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: number;
}

interface BexiState {
  messages:  ChatMessage[];
  isTyping:  boolean;

  // Actions
  addMessage:   (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  setTyping:    (val: boolean) => void;
  loadHistory:  (userId: string) => Promise<void>;
  saveMessage:  (userId: string, role: 'user' | 'assistant', content: string) => Promise<void>;
  clearHistory: (userId: string) => Promise<void>;
}

export const useBexiStore = create<BexiState>((set, get) => ({
  messages: [],
  isTyping: false,

  addMessage: (msg) => {
    const full: ChatMessage = {
      ...msg,
      id:        Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, full] }));
    return full;
  },

  setTyping: (val) => set({ isTyping: val }),

  loadHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('bexi_conversations')
        .select('role, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(20);
      if (error || !data) return;

      const msgs: ChatMessage[] = data.map((row, i) => ({
        id:        `db-${i}`,
        role:      row.role as 'user' | 'assistant',
        content:   row.content,
        timestamp: new Date(row.created_at).getTime(),
      }));
      set({ messages: msgs });
    } catch (e) {
      console.warn('[bexiStore] loadHistory error:', e);
    }
  },

  saveMessage: async (userId, role, content) => {
    try {
      await supabase.from('bexi_conversations').insert({
        user_id: userId,
        role,
        content,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      // Non-fatal — conversation still works locally
    }
  },

  clearHistory: async (userId) => {
    set({ messages: [] });
    try {
      await supabase.from('bexi_conversations').delete().eq('user_id', userId);
    } catch { /* silent */ }
  },
}));
