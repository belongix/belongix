-- Belongix clean core schema. Apply after creating a fresh Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text not null default '',
  location text not null default '',
  target_role text not null default '',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My Resume',
  template_key text not null default 'executive',
  status text not null default 'draft' check(status in ('draft','ready','archived')),
  active_version_id uuid,
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
  score integer not null default 0 check(score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ begin
  if not exists(select 1 from pg_constraint where conname='resumes_active_version_fk') then
    alter table public.resumes add constraint resumes_active_version_fk foreign key(active_version_id) references public.resume_versions(id) on delete set null;
  end if;
end $$;
create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  resume_version_id uuid not null references public.resume_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer not null default 0 check(overall_score between 0 and 100),
  ats_score integer not null default 0 check(ats_score between 0 and 100),
  content_score integer not null default 0 check(content_score between 0 and 100),
  keyword_score integer not null default 0 check(keyword_score between 0 and 100),
  impact_score integer not null default 0 check(impact_score between 0 and 100),
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
  role text not null check(role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_idx on public.resumes(user_id);
create index if not exists resume_versions_user_idx on public.resume_versions(user_id);
create index if not exists resume_analyses_user_idx on public.resume_analyses(user_id);
create index if not exists job_targets_user_idx on public.job_targets(user_id);
create index if not exists ai_conversations_user_idx on public.ai_conversations(user_id);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.job_targets enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
revoke all on public.profiles,public.resumes,public.resume_versions,public.resume_analyses,public.job_targets,public.ai_conversations,public.ai_messages from anon;
grant select,insert,update,delete on public.profiles,public.resumes,public.resume_versions,public.resume_analyses,public.job_targets,public.ai_conversations,public.ai_messages to authenticated;

drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_owner_all on public.profiles for all to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
drop policy if exists resumes_owner_all on public.resumes;
create policy resumes_owner_all on public.resumes for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists resume_versions_owner_all on public.resume_versions;
create policy resume_versions_owner_all on public.resume_versions for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists resume_analyses_owner_all on public.resume_analyses;
create policy resume_analyses_owner_all on public.resume_analyses for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists job_targets_owner_all on public.job_targets;
create policy job_targets_owner_all on public.job_targets for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists ai_conversations_owner_all on public.ai_conversations;
create policy ai_conversations_owner_all on public.ai_conversations for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists ai_messages_owner_all on public.ai_messages;
create policy ai_messages_owner_all on public.ai_messages for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists resumes_updated_at on public.resumes;
create trigger resumes_updated_at before update on public.resumes for each row execute function public.set_updated_at();
drop trigger if exists resume_versions_updated_at on public.resume_versions;
create trigger resume_versions_updated_at before update on public.resume_versions for each row execute function public.set_updated_at();
drop trigger if exists job_targets_updated_at on public.job_targets;
create trigger job_targets_updated_at before update on public.job_targets for each row execute function public.set_updated_at();
drop trigger if exists ai_conversations_updated_at on public.ai_conversations;
create trigger ai_conversations_updated_at before update on public.ai_conversations for each row execute function public.set_updated_at();
