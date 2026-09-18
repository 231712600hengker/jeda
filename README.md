# Jeda

Jeda adalah aplikasi web yang membantu pengguna memantau kondisi diri secara ringan, anonim, dan tanpa menghakimi. Aplikasi ini dibuat untuk mendukung mahasiswa dan peneliti yang sedang menjalani proses berat seperti skripsi, tugas akhir, atau pekerjaan akademik yang memakan energi mental.

Tujuan utamanya bukan untuk memberi skor atau diagnosis, melainkan membantu pengguna melihat pola stres, kelelahan, tidur, dan progres harian dalam bentuk yang sederhana dan mudah dipahami.

## Fitur utama

- Check-in harian singkat tentang kecemasan, kelelahan, tidur, dan progres skripsi
- Pemilihan pemicu stres yang umum dialami dalam proses akademik
- Dashboard ringkas untuk melihat tren dan pola dalam rentang waktu tertentu
- Peringatan ringan ketika ada pola yang perlu diperhatikan
- Refleksi mingguan untuk menilai perjalanan kerja secara lebih manusiawi
- Export data ke CSV untuk kebutuhan personal atau evaluasi diri

## Stack teknologi

- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- Recharts

## Struktur folder

```text
jeda/
├── app/
│   ├── api/
│   │   ├── alerts/
│   │   ├── checkin/
│   │   ├── dashboard/
│   │   ├── reflection/
│   │   └── session/
│   ├── checkin/
│   ├── dashboard/
│   ├── reflection/
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── constants.ts
│   ├── dummy-data.ts
│   ├── types.ts
│   ├── user.ts
│   └── server/
├── public/
├── supabase/
│   └── weekly_reflections.sql
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── PROJECT_GOALS.md
├── README.md
├── tsconfig.json
└── docs/
    └── SECURITY.md
```

## Persyaratan

- Node.js 20+
- npm
- Akun Supabase

## Setup lokal

1. Clone repo
2. Install dependency:

```bash
npm install
```

3. Buat file environment lokal berdasarkan contoh:

```bash
copy .env.example .env.local
```

4. Isi nilai variabel environment sesuai project Anda.
5. Jalankan aplikasi:

```bash
npm run dev
```

Buka http://localhost:3000 untuk melihat aplikasi.

## Variabel environment

File `.env.example` berisi variabel berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANONYMOUS_CODE_HMAC_SECRET=
SESSION_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Catatan penting:
- `NEXT_PUBLIC_SUPABASE_URL` dipakai untuk client dan server
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya untuk client-side yang memang aman dipakai publik
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server-side, tidak boleh dikirim ke browser
- `ANONYMOUS_CODE_HMAC_SECRET` dibutuhkan untuk hashing kode anonim
- `SESSION_SECRET` dibutuhkan untuk menandatangani cookie sesi

Untuk deployment ke Vercel atau platform hosting lain, isi variabel yang sama di environment settings. Jangan gunakan nilai yang sama untuk semua project dan pastikan panjang secret minimal 32 karakter.

## Database / Supabase

Sebelum deploy, jalankan SQL migration di Supabase:

```sql
supabase/weekly_reflections.sql
```

Pastikan aturan akses tabel dibatasi dengan benar agar data tidak terlalu terbuka untuk `anon` atau `authenticated` yang tidak dibutuhkan.

## Keamanan dan privasi

Proyek ini menyimpan catatan user di server agar dashboard lintas perangkat dan alert dapat berjalan. Karena itu:

- jangan mengekspos `SUPABASE_SERVICE_ROLE_KEY` ke frontend
- jangan menggunakan key anon untuk operasi sensitif di server
- gunakan Route Handler di Next.js untuk akses protected data
- jangan mengklaim bahwa data aman secara lokal atau terenkripsi penuh jika memang tidak ada mekanisme tersebut di implementasi

Informasi detail ada di [docs/SECURITY.md](docs/SECURITY.md).

## Script yang tersedia

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Status proyek

Proyek ini masih dalam tahap MVP / pengembangan awal. Fokus saat ini adalah:

- pengalaman check-in harian yang ringan
- dashboard pola diri yang mudah dibaca
- keamanan data dan flow autentikasi anonim
- kesiapan fitur refleksi dan percepatan pengembangan berikutnya

## Referensi tambahan

- [PROJECT_GOALS.md](PROJECT_GOALS.md)
- [docs/SECURITY.md](docs/SECURITY.md)

## Catatan pengembang

Repository ini sudah cukup rapi secara dasar, namun untuk scaling ke depan disarankan:

- memisahkan dokumentasi ke folder `docs/`
- menambahkan `.env.example` dan panduan setup
- menjaga agar komponen / halaman tidak terlalu padat logic
- menambah test untuk route handler dan operasi data penting
