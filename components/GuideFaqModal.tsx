'use client';

import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, LineChart, AreaChart, BarChart2 } from 'lucide-react';

interface GuideFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideFaqModal({ isOpen, onClose }: GuideFaqModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Apakah aplikasi Jeda aman dan anonim?',
      a: 'Ya, data Anda sepenuhnya anonim. Anda masuk hanya menggunakan kode akses unik (tanpa nama, email, nomor induk mahasiswa, atau kata sandi). Data Anda disimpan terenkripsi di server PostgreSQL (Supabase) dan tidak pernah dibagikan ke pihak ketiga atau pihak kampus.',
    },
    {
      q: 'Apa arti dari peringatan (Alert Akut & Kronis) yang muncul?',
      a: 'Peringatan bukanlah diagnosis klinis ataupun penilaian akademis. Peringatan adalah cerminan reflektif berbasis Ecological Momentary Assessment (EMA) untuk membantu Anda menyadari saat stres melonjak drastis (Akut) atau saat Anda mulai mengalami keletihan berkepanjangan disertai hambatan progres (Kronis / indikasi awal burnout).',
    },
    {
      q: 'Dapatkah saya menggunakan akun saya di perangkat lain?',
      a: 'Sangat bisa! Berbeda dengan versi lama, Jeda v2.0 menyimpan data di database cloud server. Cukup simpan atau catat kode akses Anda (contoh: JD-A7F2K9), lalu pilih "Masuk Kembali" dari HP, laptop, atau browser lain.',
    },
    {
      q: 'Bisakah saya menghapus data saya?',
      a: 'Tentu. Kedaulatan data sepenuhnya di tangan Anda. Di menu Pengaturan (ikon gir), pilih "Hapus Akun & Data Saya". Seluruh riwayat check-in, stressors, dan alert Anda akan dihapus permanen dari database.',
    },
    {
      q: 'Bagaimana jika saya lupa kode akses?',
      a: 'Karena aplikasi bersifat anonim mutlak tanpa email pemulihan, sistem tidak dapat mereset kode akses Anda. Pastikan mencatat kode Anda di tempat aman. Jika hilang, Anda harus membuat akun baru melalui tombol Mulai Baru.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-slate-100 animate-fade-in my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Panduan Penggunaan &amp; FAQ
              </h2>
              <p className="text-xs text-slate-400">Prinsip EMA &amp; Cara Membaca Dasbor Jeda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-6 overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          {/* Section: Cara Membaca Grafik */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <span>Cara Membaca Dasbor 4 Grafik</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="font-semibold text-amber-400 mb-1">1. Tren Kecemasan (0-6)</div>
                <p className="text-[11px] text-slate-400">
                  Adaptasi momentary GAD-2. Jika grafik menyentuh atau melampaui garis putus-putus
                  kuning (skor ≥ 5), sistem mengindikasikan lonjakan cemas akut.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="font-semibold text-rose-400 mb-1">2. Tren Kelelahan (1-10)</div>
                <p className="text-[11px] text-slate-400">
                  Rata-rata kelelahan mental &amp; fisik. Jika berada di atas batas merah (≥ 6) selama
                  berhari-hari, energi kognitif Anda berada di ambang kejenuhan.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="font-semibold text-emerald-400 mb-1">3. Tren Progres (1-5)</div>
                <p className="text-[11px] text-slate-400">
                  Kemajuan &amp; efikasi diri pengerjaan skripsi. Nilai ≤ 2 yang bertahan lama
                  menandakan hambatan atau kebuntuan yang perlu dicari solusinya.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="font-semibold text-sky-400 mb-1">4. Distribusi Stresor</div>
                <p className="text-[11px] text-slate-400">
                  Menghitung faktor apa yang paling sering Anda pilih sebagai pemicu stres (misal:
                  teknis riset, bimbingan dosen, atau manajemen waktu).
                </p>
              </div>
            </div>
          </div>

          {/* Section: FAQ Accordion */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2.5">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-[11px] text-slate-400 border-t border-slate-800/50 pt-2 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Citation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500">
            <strong>Referensi Ilmiah:</strong> Saragih, S. F., &amp; Situngkir, T. T. (2022). Penerapan
            Aplikasi Web Ecological Momentary Assessment (EMA) &quot;Jeda&quot; untuk Deteksi Dini Pola
            Stres dan Pencegahan Burnout pada Mahasiswa Tingkat Akhir. <em>GIAT: Teknologi untuk Masyarakat</em>, 1(1).
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

