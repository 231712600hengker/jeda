# Arsitektur Proyek Jeda

## Tujuan struktur
Struktur folder dibuat agar project tetap mudah dipahami ketika berkembang. Fokus utama:

- memisahkan halaman UI dan route logic
- menjaga data layer terpisah dari view layer
- memudahkan kolaborasi antar pengembang
- menempatkan dokumentasi dan konfigurasi di area yang jelas

## Struktur utama

```text
jeda/
├── app/                     # Entry point Next.js App Router
│   ├── api/                 # Route handlers untuk data dan operasi server
│   ├── checkin/             # Halaman form check-in harian
│   ├── dashboard/           # Halaman ringkasan pola dan insight
│   ├── reflection/          # Halaman refleksi mingguan
│   ├── components/          # Komponen reusable UI app-level
│   ├── globals.css          # Styling global
│   ├── layout.tsx           # Layout umum aplikasi
│   └── page.tsx             # Landing page / onboarding
├── lib/                     # Shared logic & types
│   ├── constants.ts         # Konstanta domain seperti stressor, opsi tidur
│   ├── dummy-data.ts        # Data demo untuk simulasi UI
│   ├── types.ts             # TypeScript types domain
│   ├── user.ts              # Helper local storage user identity
│   └── server/              # server-only utilities, termasuk Supabase admin
├── docs/                    # Dokumentasi proyek
├── public/                  # Asset publik statis
├── supabase/                # Migration SQL / schema support
├── .env.example             # Template environment
├── .gitignore               # Rule repo hygiene
├── README.md                # Dokumentasi utama
├── PROJECT_GOALS.md         # Tujuan proyek
├── package.json             # Scripts & dependency project
├── tsconfig.json            # Konfigurasi TypeScript
├── next.config.ts           # Konfigurasi Next.js
└── eslint.config.mjs        # Config linting
```

## Prinsip arsitektur

### 1. App Router untuk UI
Semua halaman utama berada di `app/` sesuai pola Next.js App Router. Demi keterbacaan, masing-masing feature atau halaman memiliki folder sendiri ketika kompleksitas berkembang.

### 2. Domain logic di `lib/`
Semua model, enum, konstanta, dan helper reusable sebaiknya ditaruh di `lib/` agar tidak tercampur dengan komponen UI langsung.

### 3. Server-only code dipisahkan
Semua file yang membutuhkan environment secret atau akses admin Supabase sebaiknya berada di `lib/server/` agar tidak ikut dibawa ke client bundle.

### 4. Dokumentasi tidak dibuat acak
File seperti `README.md`, `PROJECT_GOALS.md`, dan `docs/*.md` adalah sumber pengetahuan project. Dengan cara ini, repo tetap tetap mudah dimengerti oleh developer baru.

## Rekomendasi pengembangan berikutnya

- Pisahkan halaman yang besar menjadi komponen feature-specific.
- Gunakan folder `features/<nama>` bila project mulai berkembang besar.
- Hindari menaruh logic bisnis di file halaman yang terlalu padat.
- Tambahkan `services/` atau `api/` bila operasi data makin kompleks.
- Simpan rule security dan database notes di `docs/`.

## Clean-up yang sudah diterapkan

- README dibuat lebih relevan dengan proyek
- file environment template diset agar bisa di commit
- dokumentasi keamanan dan arsitektur dibuat terpisah
- struktur folder lebih mudah dipahami untuk proses pengembangan lanjutan
