/**
 * Belongix — Supabase Client
 * All database types and the authenticated client instance.
 * Uses AsyncStorage for session persistence on mobile.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Database Types ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  company: string | null;
  city: string | null;
  bio: string | null;
  skills: string | null;
  experience: string | null;
  notice_period: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  career_score: number;
  plan: 'free' | 'pro';
  user_type: string | null;
  field: string | null;
  phone: string | null;
  open_to_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string;
  experience: string | null;
  skills: string[] | null;
  description: string | null;
  apply_url: string | null;
  is_exclusive: boolean;
  referral_available: boolean;
  glassdoor_rating: number | null;
  created_at: string;
  source: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string | null;
  company: string;
  role: string;
  city: string | null;
  status: 'applied' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected';
  notes: string | null;
  next_action_date: string | null;
  next_action: string | null;
  applied_at: string;
  updated_at: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  specializations: string[];
  experience_years: number;
  price_30min: number;
  price_60min: number;
  rating: number;
  session_count: number;
  bio: string | null;
  avatar_url: string | null;
  review_quote: string | null;
  review_author: string | null;
  linkedin_url: string | null;
  calendly_url: string | null;
  is_active: boolean;
}

export interface BexiConversation {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  tags: string[];
  upvotes: number;
  answer_count: number;
  author_name: string | null;
  created_at: string;
}

export interface CommunityAnswer {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  upvotes: number;
  is_bexi: boolean;
  author_name: string | null;
  created_at: string;
}

export interface CareerScoreHistory {
  id: number;
  user_id: string;
  score: number;
  delta: number | null;
  reason: string | null;
  created_at: string;
}

export interface SalarySub {
  id: string;
  role: string;
  city: string;
  ctc_lpa: number;
  exp_years: number;
  company_type: string | null;
  hike_pct: number | null;
  created_at: string;
}
