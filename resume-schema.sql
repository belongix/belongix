-- Belongix resume storage + secure creation path
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  content jsonb not null default '{}'::jsonb,
  target_job text,
  career_level text,
  template text not null default 'classic',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes
  add column if not exists title text not null default 'Untitled Resume',
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists target_job text,
  add column if not exists career_level text,
  add column if not exists template text not null default 'classic',
  add column if not exists is_deleted boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.resumes enable row level security;

-- Remove any legacy INSERT/ALL policy so quota enforcement cannot be bypassed.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='resumes' and cmd in ('INSERT','ALL')
  loop
    execute format('drop policy if exists %I on public.resumes', p.policyname);
  end loop;
end $$;

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own" on public.resumes for select using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
-- Intentionally no direct INSERT policy. New resumes must be created through
-- create_resume_with_quota(), which atomically enforces the billing entitlement.

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own" on public.resumes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own" on public.resumes for delete using (auth.uid() = user_id);

create index if not exists resumes_user_updated_idx on public.resumes(user_id, updated_at desc);

create or replace function public.touch_resumes_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists resumes_updated_at on public.resumes;
create trigger resumes_updated_at
before update on public.resumes
for each row execute function public.touch_resumes_updated_at();

create or replace function public.create_resume_with_quota(
  p_title text,
  p_content jsonb,
  p_target_job text default null,
  p_career_level text default null,
  p_template text default 'classic'
)
returns public.resumes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  b public.billing_subscriptions;
  r public.resumes;
  is_paid boolean;
begin
  if uid is null then raise exception 'UNAUTHORIZED'; end if;

  insert into public.billing_subscriptions(user_id, plan_code, status, resumes_limit)
  values (uid, 'free', 'active', 1)
  on conflict (user_id) do nothing;

  select * into b from public.billing_subscriptions where user_id = uid for update;
  is_paid := b.plan_code in ('plus','pro');

  if is_paid then
    if b.status not in ('authenticated','active') then
      raise exception 'SUBSCRIPTION_INACTIVE';
    end if;
    if b.current_period_end is not null and b.current_period_end <= now() then
      raise exception 'SUBSCRIPTION_PERIOD_EXPIRED';
    end if;
  end if;

  if b.resumes_used >= b.resumes_limit then
    raise exception 'RESUME_LIMIT_REACHED';
  end if;

  insert into public.resumes(user_id,title,content,target_job,career_level,template)
  values (
    uid,
    coalesce(nullif(trim(p_title),''),'Untitled Resume'),
    coalesce(p_content,'{}'::jsonb),
    nullif(trim(p_target_job),''),
    nullif(trim(p_career_level),''),
    coalesce(nullif(trim(p_template),''),'classic')
  ) returning * into r;

  update public.billing_subscriptions
  set resumes_used = resumes_used + 1
  where user_id = uid;

  return r;
end;
$$;

revoke all on function public.create_resume_with_quota(text,jsonb,text,text,text) from public;
grant execute on function public.create_resume_with_quota(text,jsonb,text,text,text) to authenticated;

create or replace function public.get_resume_quota()
returns table(
  plan_code text,
  status text,
  resumes_limit integer,
  resumes_used integer,
  resumes_remaining integer,
  current_period_end timestamptz,
  cancel_at_period_end boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  b public.billing_subscriptions;
begin
  if uid is null then raise exception 'UNAUTHORIZED'; end if;
  insert into public.billing_subscriptions(user_id, plan_code, status, resumes_limit)
  values (uid, 'free', 'active', 1)
  on conflict (user_id) do nothing;
  select * into b from public.billing_subscriptions where user_id = uid;
  return query select b.plan_code,b.status,b.resumes_limit,b.resumes_used,
    greatest(b.resumes_limit-b.resumes_used,0),b.current_period_end,b.cancel_at_period_end;
end;
$$;

revoke all on function public.get_resume_quota() from public;
grant execute on function public.get_resume_quota() to authenticated;
