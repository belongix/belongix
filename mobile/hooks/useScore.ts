// hooks/useScore.ts — Career score convenience hook

import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { getTier, TIERS } from '../lib/theme';
import type { CareerScoreHistory } from '../lib/supabase';

export function useScore() {
  const { profile, user } = useAuthStore();
  const score  = profile?.career_score ?? 0;
  const tier   = getTier(score);
  const nextTier = TIERS.find(t => t.min > score) ?? null;
  const ptsToNext = nextTier ? nextTier.min - score : 0;

  const [history, setHistory] = useState<CareerScoreHistory[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const loadHistory = async (days = 30) => {
    if (!user?.id) return;
    setHistLoading(true);
    try {
      const cutoff = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase
        .from('career_score_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: true });

      setHistory((data ?? []) as CareerScoreHistory[]);
    } catch {
      // silent
    } finally {
      setHistLoading(false);
    }
  };

  const logScoreEvent = async (newScore: number, reason: string) => {
    if (!user?.id) return;
    try {
      await supabase.from('career_score_history').insert({
        user_id: user.id,
        score: newScore,
        delta: newScore - score,
        reason,
        created_at: new Date().toISOString(),
      });
      await supabase.from('profiles')
        .update({ career_score: newScore, last_score_reason: reason })
        .eq('id', user.id);
    } catch { /* silent */ }
  };

  return {
    score,
    tier,
    nextTier,
    ptsToNext,
    history,
    histLoading,
    loadHistory,
    logScoreEvent,
    percentile: Math.min(95, score), // simplified until real data
  };
}
