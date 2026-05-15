import { create } from 'zustand';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  setInitialized: () => set({ initialized: true }),

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      set({ profile: data as Profile | null });
    } catch (err) {
      console.warn('[authStore] loadProfile error:', err);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      set({ profile: data as Profile });
    } catch (err) {
      console.warn('[authStore] updateProfile error:', err);
      throw err;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },
}));