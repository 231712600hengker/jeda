"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cek apakah user sudah login sebelumnya di browser ini
  useEffect(() => {
    const existingId = localStorage.getItem("jeda_user_id");
    if (existingId) {
      router.push("/dashboard");
    }
  }, [router]);

  async function generateNewCode() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Jeda.</h1>
        <p className="text-gray-600 mb-8">Platform pemantauan kesejahteraan psikologis anonim.</p>

        {/* Bagian Pengguna Baru */}
        <div className="mb-8 p-4 border rounded-lg bg-blue-50">
          <h2 className="font-semibold text-blue-900 mb-2">Baru pertama kali?</h2>
          <p className="text-sm text-blue-700 mb-4">Dapatkan kode anonim untuk mulai melacak kondisi Anda secara privat.</p>
          <button
            onClick={generateNewCode}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Buat Kode Anonim Baru"}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">ATAU</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Bagian Pengguna Lama */}
        <div className="text-left">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Punya kode anonim?
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Contoh: JEDA-A1B2C3"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
          {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
          <button
            onClick={loginExistingCode}
            disabled={loading || !inputCode}
            className="w-full mt-4 bg-gray-800 text-white font-bold py-2 px-4 rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}