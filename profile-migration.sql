-- Safe profile migration for the resume-only Belongix product.
create table if not exists public.career_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  target_role text,
  email text,
  phone text,
  city text,
  linkedin_url text,
  summary text,
  skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_profiles enable row level security;
drop policy if exists "career_profiles_select_own" on public.career_profiles;
create policy "career_profiles_select_own" on public.career_profiles for select using (auth.uid() = user_id);
drop policy if exists "career_profiles_insert_own" on public.career_profiles;
create policy "career_profiles_insert_own" on public.career_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "career_profiles_update_own" on public.career_profiles;
create policy "career_profiles_update_own" on public.career_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "career_profiles_delete_own" on public.career_profiles;
create policy "career_profiles_delete_own" on public.career_profiles for delete using (auth.uid() = user_id);
