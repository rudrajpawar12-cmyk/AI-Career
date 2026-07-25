-- Resume Analyzer: persisted AI analysis history.
--
-- This is additive only — it does not touch the existing `resumes` table
-- or storage bucket. Run this once against your Supabase project (SQL
-- Editor, or `supabase db push` if you use the CLI) before using the
-- Resume Analyzer.

create table if not exists public.resume_analyses (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  -- Kept nullable + ON DELETE SET NULL so analysis history survives even if
  -- the source resume row is later deleted; resume_file_name is denormalized
  -- below so the history list always has a label to show.
  resume_id         uuid references public.resumes(id) on delete set null,
  resume_file_name  text not null,

  ats_score         integer not null check (ats_score between 0 and 100),
  clarity_score     integer not null check (clarity_score between 0 and 100),
  keyword_score     integer not null check (keyword_score between 0 and 100),
  impact_score      integer not null check (impact_score between 0 and 100),

  strengths         jsonb not null default '[]'::jsonb,
  weaknesses        jsonb not null default '[]'::jsonb,
  missing_skills    jsonb not null default '[]'::jsonb,
  suggestions       jsonb not null default '[]'::jsonb,

  created_at        timestamptz not null default now()
);

create index if not exists resume_analyses_user_id_created_at_idx
  on public.resume_analyses (user_id, created_at desc);

create index if not exists resume_analyses_resume_id_idx
  on public.resume_analyses (resume_id);

alter table public.resume_analyses enable row level security;

drop policy if exists "Users can view their own resume analyses" on public.resume_analyses;
create policy "Users can view their own resume analyses"
  on public.resume_analyses
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own resume analyses" on public.resume_analyses;
create policy "Users can insert their own resume analyses"
  on public.resume_analyses
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own resume analyses" on public.resume_analyses;
create policy "Users can delete their own resume analyses"
  on public.resume_analyses
  for delete
  using (auth.uid() = user_id);
