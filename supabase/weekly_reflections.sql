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

-- Jika database Anda memiliki RLS aktif pada tabel ini, pastikan policy yang ada
-- mengizinkan pengguna anon atau authenticated mengakses record miliknya sendiri.
-- Atau aktifkan RLS bila memang belum aktif:
-- alter table public.weekly_reflections enable row level security;

-- Jeda memakai kode anonim buatan aplikasi, bukan Supabase Auth. Samakan akses
-- tabel ini dengan kebijakan tabel Jeda yang sudah ada pada proyek Anda.
-- Jangan menambahkan kebijakan RLS publik baru bila tabel existing memakai aturan lain.
