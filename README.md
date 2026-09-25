# 🌿 Jeda — Ruang Refleksi & Pemantauan Kesejahteraan Mahasiswa

**Jeda** adalah aplikasi web refleksi diri yang tenang, aman, dan sepenuhnya anonim, dirancang khusus untuk menemani mahasiswa (terutama yang sedang menempuh tugas akhir/skripsi) dalam menyadari ritme emosi, tingkat kelelahan, kualitas tidur, dan kemajuan karya mereka tanpa rasa terhakimi.

---

## ✨ Fitur Utama

- 🍃 **1 Kali Refleksi Harian (Daily Check-in)**  
  Pertanyaan ringkas yang dirancang selesai dalam waktu kurang dari 2 menit. Setelah selesai, tab check-in bertransformasi menjadi ruang afirmasi hangat dengan opsi *"Perbarui Catatan / Jawaban Hari Ini"* jika ada perubahan kondisi di malam hari.

- 🌬️ **Fitur "Butuh Jeda" (Tersedia Kapan Saja)**  
  Akses instan ke latihan ketenangan tanpa harus mengisi check-in:
  - **Latihan Pernapasan 4-7-8**: Panduan visual lingkaran animasi dengan ritme Tarik Napas (4d), Tahan (7d), dan Hembuskan (8d).
  - **Teknik Grounding 5-4-3-2-1**: Panduan bertahap untuk menstabilkan fokus sensorik saat pikiran terasa penuh.

- 📊 **Dasbor Ritme & Visualisasi Pola**  
  Empat grafik visual interaktif untuk memahami hubungan antara:
  1. *Naik Turun Rasa Cemas*
  2. *Tingkat Kelelahan Mental & Fisik*
  3. *Kemajuan & Keyakinan Diri*
  4. *Faktor yang Sering Menguras Energi (Tantangan Teknis, Bimbingan Dosen, Waktu, Suasana, Personal)*

- 🕯️ **Pengingat Lembut (Caring Alerts)**  
  Mendeteksi lonjakan stres atau kelelahan berkepanjangan dan memberikan saran pemulihan yang menenangkan.

- 🔒 **100% Anonim & Berdaulat**  
  Tanpa nama, tanpa email, dan tanpa NIM. Pengguna masuk menggunakan **Kode Akses Unik** yang dapat digunakan di HP, tablet, maupun laptop. Seluruh riwayat dapat diunduh (format CSV) atau dihapus permanen kapan saja.

---

## 🎨 Konsep Desain: *"Serene Hearth"*

Aplikasi ini mengusung estetika visual **Serene Hearth** untuk memberikan kenyamanan psikologis:
- **Warna Utama**: *Sage Green* (`#6b8e7d`) — menghadirkan ketenangan, rasa aman, dan keseimbangan.
- **Warna Aksen**: *Warm Terracotta* (`#d98e73`) — kehangatan manusiawi dan energi positif.
- **Latar Kanvas**: *Soft Cream* (`#fbf9f6`) — lembut di mata dan tidak menyilaukan.
- **Tipografi**: *Plus Jakarta Sans* — ramah, elegan, dan nyaman dibaca.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend / Framework**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualisasi Data**: [Recharts](https://recharts.org/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Database & Cloud Storage**: [Supabase](https://supabase.com/) (PostgreSQL dengan Row-Level Security)
- **Autentikasi & Sesi**: Custom JWT Session via secure `httpOnly` Cookie
- **Validasi Data**: [Zod](https://zod.dev/)
- **Testing**: Node Test Runner & `tsx`

---

## 🚀 Memulai di Komputer Lokal

### 1. Kloning Repositori & Pasang Dependensi

```bash
git clone https://github.com/231712600hengker/jeda.git
cd jeda
npm install
```

### 2. Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Lengkapi kredensial Supabase dan JWT secret:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=kunci-rahasia-jwt-anda-minimal-32-karakter-acak
```

### 3. Migrasi Database (Supabase)

Jalankan query SQL berikut di **SQL Editor** pada dashboard Supabase Anda secara berurutan:
1. `supabase/migrations/001_initial_schema.sql` — Membuat tabel `users`, `checkins`, `checkin_stressors`, dan `alerts`.
2. `supabase/migrations/002_rls.sql` — Mengaktifkan Row-Level Security (RLS).
3. `supabase/migrations/003_daily_checkin_constraint.sql` — Menambahkan constraint unik 1 check-in per hari.
4. `supabase/migrations/004_quick_checkins.sql` — Menambahkan check-in ringkas (stres dan energi) tanpa mengisi data refleksi lengkap secara artifisial.

### 4. Menjalankan Server Pengembangan

```bash
# Menjalankan unit test otomatis
npm test

# Menjalankan server lokal
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧪 Pengujian Otomatis

Proyek ini dilengkapi dengan 18 unit tests yang menguji logika deteksi stres, enkripsi sesi JWT, dan integritas validasi Zod:

```bash
npm test
```

---

## 📁 Struktur Direktori

```
jeda/
├── app/                  # Next.js App Router (Halaman & API Routes)
│   ├── api/              # REST API (auth, checkins, alerts, export, user)
│   ├── globals.css       # Token warna Serene Hearth & animasi
│   ├── layout.tsx        # Root layout dengan font Plus Jakarta Sans
│   └── page.tsx          # Halaman utama & manajemen alur state
├── components/           # Komponen UI
│   ├── AlertModal.tsx    # Modal pengingat & pendampingan
│   ├── CheckInForm.tsx   # Form refleksi 5 langkah & completion sanctuary
│   ├── DashboardView.tsx # Grafik Recharts & pelacak streak ritme
│   ├── GuideFaqModal.tsx # Panduan penggunaan & tanya jawab
│   ├── HistoryTable.tsx  # Tabel riwayat & ekspor data
│   ├── LandingHero.tsx   # Halaman selamat datang & login kode akses
│   ├── Navbar.tsx        # Navigasi atas, logo Jeda, & tombol "Butuh Jeda?"
│   ├── RelaxationModal.tsx # Latihan napas 4-7-8 & grounding 5-4-3-2-1
│   └── SettingsModal.tsx # Pengaturan akun, ekspor data, & hapus akun
├── hooks/                # Custom React hooks (useSession)
├── lib/                  # Logika deteksi, validasi Zod, auth JWT, & Supabase client
├── public/               # Aset statis & logo Jeda
└── types/                # Definisi tipe TypeScript
```

---

<div align="center">
  <sub>made by sixy with ❤️</sub>
</div>
