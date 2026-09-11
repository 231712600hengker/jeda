"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CONSENT_KEY = "jeda_consent_given";

export default function LandingPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Cek apakah user sudah login sebelumnya di browser ini
  useEffect(() => {
    const existingId = localStorage.getItem("jeda_user_id");
    if (existingId) {
      router.push("/dashboard");
    }
  }, [router]);

  async function createAnonymousUser() {
    setLoading(true);
    // Buat kode acak 6 karakter, misal: JEDA-A1B2C3
    const newCode = "JEDA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from("users")
      .insert([{ anonymous_code: newCode }])
      .select()
      .single();

    if (error) {
      setErrorMsg("Gagal membuat kode anonim. Coba lagi.");
      setLoading(false);
      return;
    }

    // Simpan data ke browser
    localStorage.setItem("jeda_user_id", data.id);
    localStorage.setItem("jeda_anon_code", data.anonymous_code);

    // Beri peringatan agar user mencatat kodenya
    alert(`PENTING: Kode Anda adalah ${newCode}\n\nHarap simpan/screenshot kode ini untuk mengakses riwayat Anda di perangkat lain.`);
    router.push("/checkin");
  }

  // Tombol "Buat Kode Anonim Baru" masuk sini dulu, bukan langsung createAnonymousUser
  function handleStartClick() {
    const alreadyConsented = localStorage.getItem(CONSENT_KEY);
    if (alreadyConsented) {
      createAnonymousUser();
    } else {
      setErrorMsg("");
      setShowConsent(true);
    }
  }

  function handleConfirmConsent() {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setShowConsent(false);
    createAnonymousUser();
  }

  async function loginExistingCode() {
    if (!inputCode) return;
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("users")
      .select("id, anonymous_code")
      .eq("anonymous_code", inputCode.trim().toUpperCase())
      .single();

    if (error || !data) {
      setErrorMsg("Kode tidak ditemukan. Silakan periksa kembali.");
      setLoading(false);
      return;
    }

    localStorage.setItem("jeda_user_id", data.id);
    localStorage.setItem("jeda_anon_code", data.anonymous_code);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 p-5 text-earth-900">
      <div className="max-w-md w-full border border-sand-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-sage-700 mb-3">Untuk mahasiswa yang sedang menyelesaikan skripsi</p>
        <h1 className="font-serif text-4xl font-semibold text-earth-900 mb-3">Jeda</h1>
        <p className="text-sm leading-6 text-earth-600 mb-8">Ruang anonim untuk memahami pola stres, energi, dan progresmu dari hari ke hari.</p>

        {/* Bagian Pengguna Baru */}
        <div className="mb-8 border-l-4 border-sage-400 bg-sage-50 p-5">
          <h2 className="font-serif text-xl font-semibold text-sage-900 mb-2">Mulai dari satu check-in</h2>
          <p className="text-sm leading-6 text-sage-800 mb-4">Buat kode anonim untuk menyimpan catatan pribadimu. Jeda tidak meminta nama, NIM, atau email.</p>
          <button
            onClick={handleStartClick}
            disabled={loading}
            className="w-full bg-sage-700 text-white font-semibold py-3 px-4 hover:bg-sage-800 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Buat Kode Anonim Baru"}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-sand-200"></div>
          <span className="flex-shrink-0 mx-4 text-earth-400 text-xs">ATAU</span>
          <div className="flex-grow border-t border-sand-200"></div>
        </div>

        {/* Bagian Pengguna Lama */}
        <div className="text-left">
          <label className="block text-earth-700 text-sm font-semibold mb-2">
            Punya kode anonim?
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Contoh: JEDA-A1B2C3"
            className="w-full px-3 py-2.5 border border-sand-300 bg-sand-50 focus:outline-none focus:border-sage-500 uppercase text-earth-800"
          />
          {errorMsg && <p className="text-rose-700 text-sm mt-2">{errorMsg}</p>}
          <button
            onClick={loginExistingCode}
            disabled={loading || !inputCode}
            className="w-full mt-4 border border-earth-700 text-earth-800 font-semibold py-3 px-4 hover:bg-earth-50 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </div>

      {showConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="font-serif text-2xl font-semibold text-earth-800 mb-3">Persetujuan partisipasi</h2>
            <div className="text-sm leading-6 text-earth-600 space-y-3 mb-4">
              <p>
                Jeda adalah alat pemantauan kesejahteraan mandiri yang dikembangkan sebagai
                bagian dari penelitian akademik. Sebelum melanjutkan, mohon baca poin-poin
                berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <b>Tujuan:</b> Mencatat kondisi kecemasan, kelelahan, dan progres skripsi
                  harian untuk membantu Anda memantau diri sendiri.
                </li>
                <li>
                  <b>Anonimitas:</b> Tidak ada nama, email, atau NIM yang diminta. Identitas Anda
                  hanya berupa kode acak yang Anda simpan sendiri.
                </li>
                <li>
                  <b>Sukarela:</b> Partisipasi bersifat sukarela. Anda bisa berhenti mengisi
                  kapan saja tanpa konsekuensi apa pun.
                </li>
                <li>
                  <b>Bukan layanan darurat:</b> Notifikasi dalam aplikasi ini bersifat
                  informatif, bukan pengganti konsultasi profesional. Jika Anda mengalami
                  krisis, segera hubungi layanan konseling kampus atau layanan darurat.
                </li>
                <li>
                  <b>Penggunaan data:</b> Data agregat dan anonim dapat digunakan untuk
                  keperluan evaluasi/penelitian, tanpa dapat ditelusuri kembali ke identitas
                  pribadi Anda.
                </li>
              </ul>
            </div>
            <label className="flex items-start gap-2 text-sm text-earth-700 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              <span>
                Saya memahami dan menyetujui poin-poin di atas, serta bersedia berpartisipasi
                secara sukarela.
              </span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConsent(false)}
                className="flex-1 py-2.5 border border-sand-300 text-earth-700 hover:bg-sand-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmConsent}
                disabled={!consentChecked || loading}
                className="flex-1 py-2.5 bg-sage-700 text-white font-semibold hover:bg-sage-800 transition disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Saya Setuju & Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
