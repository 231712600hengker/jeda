# Deployment Guide

## Persyaratan

Sebelum deploy, pastikan project sudah punya:

- repository GitHub yang aktif
- project Supabase baru atau yang sudah ada
- akun Vercel (atau platform lain)
- variable environment yang valid

## Environment variables yang wajib diisi

```env
NEXT_PUBLIC_SUPABASE_URL=https://llufvkviyxfuosykafmm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsIn
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi
ANONYMOUS_CODE_HMAC_SECRET=31e24f78b3dd105df9056d1b1ad173fbfaf1b66ecf246360c7a8b3bd3959f17e
SESSION_SECRET=cf2121bba046581572ff32b9c6ea9e6230988503df54c5c672e7e89401409430
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Nilai yang harus disiapkan

- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key dari Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: service role key, hanya untuk server
- `ANONYMOUS_CODE_HMAC_SECRET`: secret minimal 32 karakter untuk hashing kode anonim
- `SESSION_SECRET`: secret minimal 32 karakter untuk signing cookie sesi
- `NEXT_PUBLIC_APP_URL`: URL produksi aplikasi

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Buka dashboard Vercel.
3. Import repository.
4. Pilih framework: Next.js.
5. Masukkan semua environment variables di bagian Environment Variables.
6. Simpan dan deploy.
7. Setelah deploy selesai, buka URL produksi dan coba generate kode anonim.

## Validasi setelah deploy

Setelah aplikasi aktif, cek langkah berikut:

1. Buka halaman utama.
2. Klik tombol untuk membuat kode anonim.
3. Pastikan kode tampil dan tersimpan di localStorage.
4. Coba masuk ke dashboard.
5. Pastikan tidak ada error 401, 500, atau "Kode anonim tidak valid".

## Jika masih gagal

Periksa hal berikut:

- apakah `ANONYMOUS_CODE_HMAC_SECRET` sudah diisi dan panjangnya minimal 32 karakter
- apakah `SESSION_SECRET` sudah diisi dan panjangnya minimal 32 karakter
- apakah `SUPABASE_SERVICE_ROLE_KEY` tidak bocor ke frontend
- apakah `NEXT_PUBLIC_SUPABASE_URL` benar dan project Supabase sudah aktif
- apakah SQL migration sudah dijalankan di Supabase

## Catatan penting

`NEXT_PUBLIC_SUPABASE_ANON_KEY` dan `NEXT_PUBLIC_SUPABASE_URL` bisa dipakai di frontend, tapi key sensitif seperti service role dan session secret hanya boleh dipakai di server-side dan environment deployment.
