create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  location text not null default '',
  target_role text not null default '',
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Master Resume',
  active_version_id uuid,
  template_key text not null default 'executive',
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_name text not null default 'Master Resume',
  content jsonb not null default '{}'::jsonb,
  target_job_description text not null default '',
  score integer not null default 0 check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes add column if not exists active_version_id uuid;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'resumes_active_version_fk') then
    alter table public.resumes add constraint resumes_active_version_fk foreign key (active_version_id) references public.resume_versions(id) on delete set null;
  end if;
end $$;

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  resume_version_id uuid not null references public.resume_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer not null default 0 check (overall_score between 0 and 100),
  ats_score integer not null default 0 check (ats_score between 0 and 100),
  content_score integer not null default 0 check (content_score between 0 and 100),
  keyword_score integer not null default 0 check (keyword_score between 0 and 100),
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.job_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null default '',
  location text not null default '',
  description text not null default '',
  keywords jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  title text not null default 'Bexi conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_idx on public.resumes(user_id);
create index if not exists resume_versions_user_idx on public.resume_versions(user_id);
create index if not exists resume_analyses_user_idx on public.resume_analyses(user_id);
create index if not exists job_targets_user_idx on public.job_targets(user_id);
create index if not exists ai_conversations_user_idx on public.ai_conversations(user_id);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id);