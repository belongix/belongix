// store/upskillStore.ts — Course progress state

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type CourseStatus = 'not_started' | 'in_progress' | 'completed';

export interface CourseProgress {
  courseId: string;
  status: CourseStatus;
  pct: number;
}

interface UpskillState {
  progress: Record<string, CourseProgress>;
  loading: boolean;
  loadProgress: (userId: string) => Promise<void>;
  updateProgress: (userId: string, courseId: string, status: CourseStatus, pct: number) => Promise<void>;
}

export const useUpskillStore = create<UpskillState>((set, get) => ({
  progress: {},
  loading: false,

  loadProgress: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await supabase
        .from('user_course_progress')
        .select('course_id, status, progress_pct')
        .eq('user_id', userId);

      const map: Record<string, CourseProgress> = {};
      (data ?? []).forEach((r: { course_id: string; status: CourseStatus; progress_pct: number }) => {
        map[r.course_id] = { courseId: r.course_id, status: r.status, pct: r.progress_pct };
      });
      set({ progress: map });
    } catch (err) {
      console.warn('[upskillStore] loadProgress:', err);
    } finally {
      set({ loading: false });
    }
  },

  updateProgress: async (userId, courseId, status, pct) => {
    // Optimistic update
    set(s => ({
      progress: { ...s.progress, [courseId]: { courseId, status, pct } },
    }));
    try {
      await supabase.from('user_course_progress').upsert({
        user_id: userId, course_id: courseId, status, progress_pct: pct,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[upskillStore] updateProgress:', err);
    }
  },
}));
