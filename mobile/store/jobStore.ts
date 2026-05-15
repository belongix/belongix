/**
 * Belongix — Job Store (Zustand)
 * Manages job listings, applied job IDs, and filters.
 */

import { create } from 'zustand';
import { supabase, Job } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JobState {
  jobs:       Job[];
  appliedIds: Set<string>;
  loading:    boolean;
  error:      string | null;

  // Actions
  loadJobs:         (filters?: JobFilters) => Promise<void>;
  applyToJob:       (userId: string, job: Job, coverNote: string) => Promise<void>;
  loadAppliedIds:   (userId: string) => Promise<void>;
}

export interface JobFilters {
  search?:   string;
  city?:     string;
  type?:     string;
  tag?:      string;
}

// Seed jobs for offline/fallback
const SEED_JOBS: Job[] = [
  { id: 's1', title: 'Software Engineer', company: 'Swiggy', city: 'Bangalore', salary_min: 18, salary_max: 32, job_type: 'FULLTIME', experience: '2-4 yrs', skills: ['React', 'Node.js', 'AWS'], description: null, apply_url: null, is_exclusive: false, referral_available: true, glassdoor_rating: 4.1, created_at: new Date().toISOString(), source: 'seed' },
  { id: 's2', title: 'Data Scientist', company: 'Meesho', city: 'Bangalore', salary_min: 20, salary_max: 38, job_type: 'FULLTIME', experience: '2-5 yrs', skills: ['Python', 'ML', 'SQL'], description: null, apply_url: null, is_exclusive: true, referral_available: false, glassdoor_rating: 4.3, created_at: new Date().toISOString(), source: 'seed' },
  { id: 's3', title: 'Product Manager', company: 'Razorpay', city: 'Bangalore', salary_min: 25, salary_max: 45, job_type: 'FULLTIME', experience: '3-6 yrs', skills: ['Figma', 'SQL', 'Strategy'], description: null, apply_url: null, is_exclusive: false, referral_available: true, glassdoor_rating: 4.5, created_at: new Date().toISOString(), source: 'seed' },
  { id: 's4', title: 'DevOps Engineer', company: 'Zepto', city: 'Mumbai', salary_min: 16, salary_max: 28, job_type: 'FULLTIME', experience: '2-4 yrs', skills: ['Kubernetes', 'AWS', 'Terraform'], description: null, apply_url: null, is_exclusive: false, referral_available: false, glassdoor_rating: 3.9, created_at: new Date().toISOString(), source: 'seed' },
  { id: 's5', title: 'Frontend Engineer', company: 'CRED', city: 'Bangalore', salary_min: 15, salary_max: 26, job_type: 'FULLTIME', experience: '1-3 yrs', skills: ['React', 'TypeScript', 'CSS'], description: null, apply_url: null, is_exclusive: true, referral_available: false, glassdoor_rating: 4.6, created_at: new Date().toISOString(), source: 'seed' },
  { id: 's6', title: 'ML Engineer', company: 'Google', city: 'Hyderabad', salary_min: 30, salary_max: 60, job_type: 'FULLTIME', experience: '3-7 yrs', skills: ['TensorFlow', 'Python', 'MLOps'], description: null, apply_url: null, is_exclusive: false, referral_available: true, glassdoor_rating: 4.4, created_at: new Date().toISOString(), source: 'seed' },
];

export const useJobStore = create<JobState>((set, get) => ({
  jobs:       [],
  appliedIds: new Set(),
  loading:    false,
  error:      null,

  loadJobs: async (filters) => {
    set({ loading: true, error: null });
    try {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50);

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      if (filters?.city) query = query.eq('city', filters.city);
      if (filters?.type) query = query.eq('job_type', filters.type);

      const { data, error } = await query;
      const jobs = (!error && data && data.length > 0) ? data as Job[] : SEED_JOBS;

      // Cache to AsyncStorage for offline
      await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));
      set({ jobs, loading: false });
    } catch {
      // Try cache first
      const cached = await AsyncStorage.getItem('cached_jobs');
      set({ jobs: cached ? JSON.parse(cached) : SEED_JOBS, loading: false });
    }
  },

  loadAppliedIds: async (userId) => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('job_id')
        .eq('user_id', userId);
      const ids = new Set((data ?? []).map((r: { job_id: string }) => r.job_id));
      set({ appliedIds: ids });
    } catch { /* silent */ }
  },

  applyToJob: async (userId, job, coverNote) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', userId)
      .maybeSingle();

    await supabase.from('applications').insert({
      user_id:    userId,
      job_id:     job.id,
      company:    job.company,
      role:       job.title,
      city:       job.city,
      status:     'applied',
      notes:      coverNote || null,
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Award +15 career score points
    const { data: p } = await supabase.from('profiles').select('career_score').eq('id', userId).maybeSingle();
    const newScore = Math.min(100, (p?.career_score ?? 30) + 15);
    await supabase.from('profiles').update({ career_score: newScore }).eq('id', userId);

    // Log to history
    await supabase.from('career_score_history').insert({
      user_id: userId, score: newScore, delta: 15, reason: 'Job applied', created_at: new Date().toISOString(),
    });

    // Update local applied IDs set
    set((state) => ({ appliedIds: new Set([...state.appliedIds, job.id]) }));
  },
}));
