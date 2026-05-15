/**
 * Belongix — Auth Store (Zustand)
 * Manages user session, profile, and auth state globally.
 */

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthState {
  session:  Session | null;
  user:     User    | null;
  profile:  Profile | null;
  loading:  boolean;

  // Actions
  setSession:    (session: Session | null) => void;
  loadProfile:   () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut:       () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user:    null,
  profile: null,
  loading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, loading: false });
    if (session?.user) get().loadProfile();
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (!error && data) set({ profile: data as Profile });
    } catch (e) {
      console.warn('[authStore] loadProfile error:', e);
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (!error) {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      }
    } catch (e) {
      console.warn('[authStore] updateProfile error:', e);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
