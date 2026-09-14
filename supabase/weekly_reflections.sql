-- Jalankan sekali di Supabase SQL Editor sebelum membuka halaman /reflection.
create extension if not exists pgcrypto;

create table if not exists public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  reflection text not null check (char_length(reflection) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_reflections_user_week_idx
  on public.weekly_reflections (user_id, week_start desc);

-- Semua akses data pribadi hanya lewat Route Handler Next.js menggunakan
-- SUPABASE_SERVICE_ROLE_KEY. Jangan pernah mengekspos key tersebut ke browser.
alter table public.weekly_reflections enable row level security;

drop policy if exists "weekly_reflections_anon_select" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_insert" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_update" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_delete" on public.weekly_reflections;

revoke all on public.users, public.checkins, public.checkin_stressors, public.alerts, public.weekly_reflections from anon, authenticated;
revoke usage on schema public from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.users, public.checkins, public.checkin_stressors, public.alerts, public.weekly_reflections to service_role;
