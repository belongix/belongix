import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://efhcfuaxgbzuqlmhlsxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGNmdWF4Z2J6dXFsbWhsc3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDg1NzgsImV4cCI6MjA5MjcyNDU3OH0.vpFvBPnKkrMMONXo9z6FemJ2qIlRChRloQYRB0LMdjY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  company: string | null;
  city: string | null;
  experience: string | null;
  skills: string | null;
  bio: string | null;
  career_score: number;
  plan: 'free' | 'pro';
  avatar_url: string | null;
  linkedin_url: string | null;
  phone: string | null;
  open_to_work: boolean;
  created_at: string;
}