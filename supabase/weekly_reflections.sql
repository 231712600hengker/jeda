-- Jalankan sekali di Supabase SQL Editor sebelum menggunakan aplikasi.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  anonymous_code_hash text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checkin_date date not null,
  anxiety_1 integer not null check (anxiety_1 between 0 and 3),
  anxiety_2 integer not null check (anxiety_2 between 0 and 3),
  fatigue_mental integer not null check (fatigue_mental between 1 and 10),
  fatigue_physical integer not null check (fatigue_physical between 1 and 10),
  sleep_quantity text not null,
  sleep_quality text not null,
  progress_1 integer not null check (progress_1 between 1 and 5),
  progress_2 integer not null check (progress_2 between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create table if not exists public.checkin_stressors (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  alert_type text not null check (alert_type in ('akut', 'kronis')),
  triggered_at timestamptz not null default now(),
  trigger_detail jsonb not null default '{}'::jsonb,
  acknowledged boolean not null default false
);

create table if not exists public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  reflection text not null check (char_length(reflection) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists users_anonymous_code_hash_idx
  on public.users (anonymous_code_hash);

create index if not exists checkins_user_date_idx
  on public.checkins (user_id, checkin_date desc);

create index if not exists checkin_stressors_checkin_idx
  on public.checkin_stressors (checkin_id);

create index if not exists alerts_user_triggered_idx
  on public.alerts (user_id, triggered_at desc);

create index if not exists weekly_reflections_user_week_idx
  on public.weekly_reflections (user_id, week_start desc);

-- Semua akses data pribadi hanya lewat Route Handler Next.js menggunakan
-- SUPABASE_SERVICE_ROLE_KEY. Jangan pernah mengekspos key tersebut ke browser.
alter table public.users enable row level security;
alter table public.checkins enable row level security;
alter table public.checkin_stressors enable row level security;
alter table public.alerts enable row level security;
alter table public.weekly_reflections enable row level security;

drop policy if exists "users_service_role_all" on public.users;
drop policy if exists "checkins_service_role_all" on public.checkins;
drop policy if exists "checkin_stressors_service_role_all" on public.checkin_stressors;
drop policy if exists "alerts_service_role_all" on public.alerts;
drop policy if exists "weekly_reflections_service_role_all" on public.weekly_reflections;

drop policy if exists "users_anon_select" on public.users;
drop policy if exists "checkins_anon_select" on public.checkins;
drop policy if exists "checkin_stressors_anon_select" on public.checkin_stressors;
drop policy if exists "alerts_anon_select" on public.alerts;
drop policy if exists "weekly_reflections_anon_select" on public.weekly_reflections;

drop policy if exists "users_anon_insert" on public.users;
drop policy if exists "checkins_anon_insert" on public.checkins;
drop policy if exists "checkin_stressors_anon_insert" on public.checkin_stressors;
drop policy if exists "alerts_anon_insert" on public.alerts;
drop policy if exists "weekly_reflections_anon_insert" on public.weekly_reflections;

revoke all on public.users, public.checkins, public.checkin_stressors, public.alerts, public.weekly_reflections from anon, authenticated;
revoke usage on schema public from anon, authenticated;

grant usage on schema public to service_role;
grant all on public.users, public.checkins, public.checkin_stressors, public.alerts, public.weekly_reflections to service_role;
