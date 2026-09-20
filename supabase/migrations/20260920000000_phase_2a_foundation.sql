create extension if not exists "pgcrypto";

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_name text not null,
  storage_path text,
  duration numeric check (duration is null or duration >= 0),
  status text not null default 'queued' check (status in ('queued', 'processing', 'ready', 'needs_review', 'failed')),
  risk_level text check (risk_level is null or risk_level in ('safe', 'low', 'moderate', 'high', 'critical')),
  risk_score numeric check (risk_score is null or risk_score between 0 and 1),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moderation_results (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  processing_job_id text,
  source text not null check (source in ('demo', 'backend')),
  status text not null default 'completed' check (status in ('queued', 'processing', 'completed', 'failed')),
  risk_level text check (risk_level is null or risk_level in ('safe', 'low', 'moderate', 'high', 'critical')),
  risk_score numeric check (risk_score is null or risk_score between 0 and 1),
  summary jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  moderation_result_id uuid references public.moderation_results(id) on delete set null,
  chunk_id integer not null check (chunk_id >= 0),
  start_seconds numeric not null check (start_seconds >= 0),
  end_seconds numeric not null check (end_seconds >= start_seconds),
  timecode text not null,
  modality text not null check (modality in ('visual', 'audio', 'text')),
  threat text not null,
  score numeric not null check (score between 0 and 1),
  action text not null check (action in ('allow', 'flag', 'mute', 'blur', 'block')),
  confidence numeric not null check (confidence between 0 and 1),
  reviewed boolean not null default false,
  reason text not null default '',
  signals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.review_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.moderation_events(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'resolved')),
  reviewer_id uuid references auth.users(id) on delete set null,
  decision_action text check (decision_action is null or decision_action in ('allow', 'flag', 'mute', 'blur', 'block')),
  decision_source text check (decision_source is null or decision_source in ('ai', 'human')),
  decision_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create table if not exists public.model_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  modality text not null check (modality in ('visual', 'audio', 'text')),
  status text not null default 'ready' check (status in ('ready', 'evaluating', 'archived')),
  deployment text not null default 'not_connected' check (deployment in ('not_connected', 'demo_active', 'offline')),
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (name, version)
);

create index if not exists videos_created_at_idx on public.videos (created_at desc);
create index if not exists videos_status_idx on public.videos (status);
create index if not exists moderation_results_video_id_idx on public.moderation_results (video_id, created_at desc);
create index if not exists moderation_events_video_id_idx on public.moderation_events (video_id, start_seconds);
create index if not exists moderation_events_reviewed_idx on public.moderation_events (reviewed);
create index if not exists review_tasks_status_idx on public.review_tasks (status, created_at);
create index if not exists review_tasks_event_id_idx on public.review_tasks (event_id);
create index if not exists model_versions_modality_idx on public.model_versions (modality, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
before update on public.videos
for each row execute function public.set_updated_at();

alter table public.videos enable row level security;
alter table public.moderation_results enable row level security;
alter table public.moderation_events enable row level security;
alter table public.review_tasks enable row level security;
alter table public.model_versions enable row level security;

create policy "Authenticated users can read videos" on public.videos for select to authenticated using (true);
create policy "Authenticated users can create videos" on public.videos for insert to authenticated with check (true);
create policy "Authenticated users can update videos" on public.videos for update to authenticated using (true) with check (true);

create policy "Authenticated users can read moderation results" on public.moderation_results for select to authenticated using (true);
create policy "Authenticated users can create moderation results" on public.moderation_results for insert to authenticated with check (true);

create policy "Authenticated users can read moderation events" on public.moderation_events for select to authenticated using (true);
create policy "Authenticated users can create moderation events" on public.moderation_events for insert to authenticated with check (true);
create policy "Authenticated users can update moderation events" on public.moderation_events for update to authenticated using (true) with check (true);

create policy "Authenticated users can read review tasks" on public.review_tasks for select to authenticated using (true);
create policy "Authenticated users can create review tasks" on public.review_tasks for insert to authenticated with check (true);
create policy "Authenticated users can update review tasks" on public.review_tasks for update to authenticated using (true) with check (true);

create policy "Authenticated users can read model versions" on public.model_versions for select to authenticated using (true);
create policy "Authenticated users can create model versions" on public.model_versions for insert to authenticated with check (true);
create policy "Authenticated users can update model versions" on public.model_versions for update to authenticated using (true) with check (true);