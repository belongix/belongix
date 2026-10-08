alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.job_targets enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

revoke all on public.profiles, public.resumes, public.resume_versions, public.resume_analyses, public.job_targets, public.ai_conversations, public.ai_messages from anon;
grant select, insert, update, delete on public.profiles, public.resumes, public.resume_versions, public.resume_analyses, public.job_targets, public.ai_conversations, public.ai_messages to authenticated;

create policy profiles_owner_select on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_owner_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_owner_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_owner_delete on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy resumes_owner_select on public.resumes for select to authenticated using ((select auth.uid()) = user_id);
create policy resumes_owner_insert on public.resumes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy resumes_owner_update on public.resumes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy resumes_owner_delete on public.resumes for delete to authenticated using ((select auth.uid()) = user_id);

create policy resume_versions_owner_select on public.resume_versions for select to authenticated using ((select auth.uid()) = user_id);
create policy resume_versions_owner_insert on public.resume_versions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy resume_versions_owner_update on public.resume_versions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy resume_versions_owner_delete on public.resume_versions for delete to authenticated using ((select auth.uid()) = user_id);

create policy resume_analyses_owner_select on public.resume_analyses for select to authenticated using ((select auth.uid()) = user_id);
create policy resume_analyses_owner_insert on public.resume_analyses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy resume_analyses_owner_update on public.resume_analyses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy resume_analyses_owner_delete on public.resume_analyses for delete to authenticated using ((select auth.uid()) = user_id);

create policy job_targets_owner_select on public.job_targets for select to authenticated using ((select auth.uid()) = user_id);
create policy job_targets_owner_insert on public.job_targets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy job_targets_owner_update on public.job_targets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy job_targets_owner_delete on public.job_targets for delete to authenticated using ((select auth.uid()) = user_id);

create policy ai_conversations_owner_select on public.ai_conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy ai_conversations_owner_insert on public.ai_conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ai_conversations_owner_update on public.ai_conversations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy ai_conversations_owner_delete on public.ai_conversations for delete to authenticated using ((select auth.uid()) = user_id);

create policy ai_messages_owner_select on public.ai_messages for select to authenticated using ((select auth.uid()) = user_id);
create policy ai_messages_owner_insert on public.ai_messages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ai_messages_owner_update on public.ai_messages for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy ai_messages_owner_delete on public.ai_messages for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

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