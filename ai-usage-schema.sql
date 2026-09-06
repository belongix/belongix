-- Belongix AI usage ledger. Required by the resume-ai Edge Function.
create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage for select using (auth.uid() = user_id);

create or replace function public.consume_ai_usage(p_user_id uuid, p_limit integer default 50)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then raise exception 'UNAUTHORIZED'; end if;
  insert into public.ai_usage(user_id, usage_date, count)
  values (p_user_id, current_date, 0)
  on conflict (user_id) do update
    set usage_date = excluded.usage_date,
        count = case when public.ai_usage.usage_date = excluded.usage_date then public.ai_usage.count else 0 end,
        updated_at = now();
  select count into c from public.ai_usage where user_id = p_user_id;
  if c >= greatest(p_limit,0) then return false; end if;
  update public.ai_usage set count = count + 1, updated_at = now() where user_id = p_user_id;
  return true;
end;
$$;

revoke all on function public.consume_ai_usage(uuid,integer) from public;
grant execute on function public.consume_ai_usage(uuid,integer) to authenticated;
