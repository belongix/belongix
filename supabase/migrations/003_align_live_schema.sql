-- Reconcile the live Belongix schema with the production resume workspace.
alter table public.resumes add column if not exists template_key text not null default 'executive';
alter table public.resumes add column if not exists status text not null default 'draft';

alter table public.resume_versions add column if not exists version_name text not null default 'Master Resume';
alter table public.resume_versions add column if not exists target_job_description text not null default '';
alter table public.resume_versions add column if not exists score integer not null default 0;
alter table public.resume_versions add column if not exists updated_at timestamptz not null default now();

update public.resume_versions
set version_name = coalesce(version_name, 'Master Resume'),
    target_job_description = coalesce(target_job_description, ''),
    score = coalesce(score, 0),
    updated_at = coalesce(updated_at, created_at, now())
where version_name is null
   or target_job_description is null
   or score is null
   or updated_at is null;
