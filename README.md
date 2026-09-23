# Jeda v2.0 — Ecological Momentary Assessment (EMA) untuk Mahasiswa Skripsi

Aplikasi web pemantauan stres, kelelahan, kualitas tidur, dan progres pengerjaan skripsi berbasis **Next.js (App Router) + TypeScript, Tailwind CSS, dan Supabase (PostgreSQL)**.

> **Referensi Ilmiah:**  
> Saragih, S. F., & Situngkir, T. T. (2022). Penerapan Aplikasi Web Ecological Momentary Assessment (EMA) "Jeda" untuk Deteksi Dini Pola Stres dan Pencegahan Burnout pada Mahasiswa Tingkat Akhir. *GIAT: Teknologi untuk Masyarakat*, 1(1).

---

## 🚀 Perbedaan Kritis v2.0 vs Versi Lama

| Fitur | Versi Lama (jeda-omega) | Versi Baru (v2.0) |
|---|---|---|
| **Database** | Hanya `localStorage` di browser | **Supabase (PostgreSQL)** dengan schema relasional penuh |
| **Akses Lintas Perangkat** | ❌ Tidak bisa (data hilang jika ganti HP/laptop) | ✅ **Bisa** — login kode akses dari perangkat mana pun |
| **API Endpoints** | Route dibuat tapi tidak dipanggil | ✅ Semua 8 endpoint terhubung nyata dengan frontend |
| **Sesi Pengguna** | State memori browser | **JWT session dalam httpOnly Cookie** aman |
| **Keamanan & Privasi** | Tanpa RLS | **Row-Level Security (RLS)** & tanpa pengumpulan PII |

---

## 📋 Prasyarat & Persiapan Database (Supabase)

1. Buat akun gratis di [supabase.com](https://supabase.com) dan buat **Project Baru**.
2. Masuk ke menu **SQL Editor** di dashboard Supabase Anda.
3. Jalankan query dari berkas [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) untuk membuat tabel:
   - `users` (kode akses anonim & persetujuan)
   - `checkins` (9 item instrumen EMA + catatan)
   - `checkin_stressors` (kategori sumber stres)
   - `alerts` (riwayat peringatan akut & kronis)
4. Jalankan query dari berkas [`supabase/migrations/002_rls.sql`](supabase/migrations/002_rls.sql) untuk mengaktifkan Row-Level Security.

---

## ⚙️ Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi variabel berikut (dapat diperoleh dari **Project Settings → API** di Supabase):

```env
# URL Project Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Secret Key (Server-only, jangan diekspos ke client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret untuk session cookie (minimal 32 karakter acak)
JWT_SECRET=rahasia-kunci-jwt-jeda-minimal-32-karakter-acak
```

---

## 💻 Menjalankan di Lokal

```bash
# 1. Install dependensi
npm install --legacy-peer-deps

# 2. Jalankan server pengembangan
npm run dev

# 3. Buka di browser
http://localhost:3000
```

---

## 🧪 Menguji Logika Deteksi Alert (Unit Test)

Algoritma deteksi alert akut & kronis (termasuk peredaman 3 hari sesuai PRD Appendix B) dapat diuji langsung:

```bash
npx tsx lib/__tests__/detection.test.ts
```

---

## 🚢 Deploy ke Vercel

1. Push repository ke GitHub.
2. Impor project ke [Vercel](https://vercel.com).
3. Masukkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) di menu Vercel Settings.
4. Klik **Deploy**!

