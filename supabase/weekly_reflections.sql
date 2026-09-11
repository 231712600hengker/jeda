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

-- Pastikan role anon/authenticated bisa membaca, menulis, dan memperbarui tabel.
-- Jika proyek Anda sudah punya kebijakan RLS untuk public.users, pakai kebijakan yang sama
-- dan jangan menambah kebijakan baru secara publik.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.weekly_reflections to anon, authenticated;

-- Jeda memakai kode anonim buatan aplikasi, bukan Supabase Auth. Karena anon key
-- tidak membawa auth.uid(), policy "milik sendiri" tidak bisa divalidasi oleh RLS.
-- Untuk setup riset/prototipe ini, samakan dengan akses tabel Jeda lain: anon dan
-- authenticated boleh membaca/menulis. Jika aplikasi dipakai publik, pindahkan
-- operasi tulis ke server action/API route dengan service role dan validasi kode.
alter table public.weekly_reflections enable row level security;

drop policy if exists "weekly_reflections_anon_select" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_insert" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_update" on public.weekly_reflections;
drop policy if exists "weekly_reflections_anon_delete" on public.weekly_reflections;

create policy "weekly_reflections_anon_select"
  on public.weekly_reflections for select
  to anon, authenticated
  using (true);

create policy "weekly_reflections_anon_insert"
  on public.weekly_reflections for insert
  to anon, authenticated
  with check (true);

create policy "weekly_reflections_anon_update"
  on public.weekly_reflections for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "weekly_reflections_anon_delete"
  on public.weekly_reflections for delete
  to anon, authenticated
  using (true);
