# Keamanan dan Privasi

## Ringkasan
Aplikasi Jeda menggunakan Supabase dan Next.js. Karena data pengguna terkait check-in, refleksi, dan alert diproses di server, semua operasi sensitif harus dilakukan melalui Route Handler yang berjalan di server-side.

## Aturan utama

### 1. Jangan pakai service role key di frontend
`SUPABASE_SERVICE_ROLE_KEY` adalah key dengan akses administratif. Nilai ini tidak boleh tampil di browser atau di client-side code.

### 2. Gunakan anon key hanya untuk kebutuhan publik
`NEXT_PUBLIC_SUPABASE_ANON_KEY` boleh dipakai hanya untuk kebutuhan yang memang bersifat publik. Untuk fitur yang menyimpan atau membaca data pengguna, gunakan server-side flow yang sudah dibatasi.

### 3. Guard semua route yang sensitif
Halaman seperti dashboard dan check-in harus memastikan user memiliki identitas yang valid sebelum membuka data. Dalam proyek ini, identitas pengguna didasarkan pada `jeda_anon_code` yang disimpan di browser dan divalidasi pada server.

### 4. Jalankan SQL migration sebelum deploy
File `supabase/weekly_reflections.sql` perlu dijalankan di Supabase SQL Editor agar struktur database sesuai dengan kebutuhan aplikasi.

## Privacy note
Versi ini menyimpan catatan check-in dan refleksi di server agar dashboard lintas perangkat, alert, dan fitur history dapat bekerja. Data tidak dienkripsi di client-side dan tidak disimpan di IndexedDB untuk kebutuhan aplikasi ini.

Artinya, klaim seperti "data aman sepenuhnya di browser" atau "server tidak menyimpan catatan mentah" tidak berlaku untuk versi saat ini.

## Recomendasi deploy
- simpan secret pada environment deployment, bukan di repo
- gunakan `.env.local` untuk pengembangan lokal
- pastikan .env tidak di-commit ke Git
- aktifkan pembatasan akses Supabase dan review policy secara berkala
