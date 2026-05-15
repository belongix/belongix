// hooks/useAuth.ts — Convenience auth hook

import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, session, profile, loading, signOut, updateProfile } = useAuthStore();
  return {
    user,
    session,
    profile,
    loading,
    isLoggedIn: !!session,
    signOut,
    updateProfile,
    displayName: profile?.full_name ?? user?.email?.split('@')[0] ?? 'User',
    score: profile?.career_score ?? 0,
  };
}
