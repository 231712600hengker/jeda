'use client';

import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, LineChart } from 'lucide-react';

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
      a: 'Ya, ruang ini sepenuhnya anonim. Kamu masuk hanya menggunakan kode akses unik (tanpa nama, email, NIM, ataupun kata sandi). Datamu tersimpan aman dan terenkripsi, serta tidak pernah dibagikan kepada siapa pun termasuk dosen pembimbing.',
    },
    {
      q: 'Mengapa check-in dibatasi 1 kali per hari?',
      a: 'Refleksi Jeda (kualitas tidur semalam, perasaan tentang progres hari ini, dan kesiapan esok hari) dirancang untuk menangkap satu ritme harian yang utuh. Pembatasan ini menjaga agar kamu tidak lelah mengisi pertanyaan berulang kali. Jika ada kondisi yang berubah di malam hari, kamu cukup menekan tombol "Perbarui Catatan / Jawaban Hari Ini".',
    },
    {
      q: 'Bagaimana jika saya merasa cemas di siang hari?',
      a: 'Kamu tidak perlu mengisi 9 pertanyaan check-in hanya untuk mencari ketenangan. Cukup tekan tombol "Butuh Jeda?" di navigasi atas atau tombol "Latihan Relaksasi" di dasbor untuk langsung membuka panduan napas 4-7-8 atau teknik grounding 5-4-3-2-1 kapan pun kamu butuhkan.',
    },
    {
      q: 'Apa maksud pengingat atau alert yang muncul?',
      a: 'Pengingat bukanlah vonis ataupun penilaian buruk. Ini adalah cermin lembut yang mengingatkanmu saat rasa cemas sedang tinggi atau saat tubuh dan pikiranmu sudah terlalu lelah, agar kamu bisa beristirahat sejenak sebelum kelelahan berlanjut.',
    },
    {
      q: 'Dapatkah saya membuka akun ini di perangkat lain?',
      a: 'Sangat bisa! Datamu tersimpan aman di cloud. Cukup simpan atau catat kode akses unikmu, lalu pilih tombol "Punya Kode Akses" dari HP, tablet, maupun laptop lain kapan saja.',
    },
    {
      q: 'Bisakah saya menghapus data saya?',
      a: 'Tentu saja. Kendali data sepenuhnya milikmu. Di menu Pengaturan (ikon gir), pilih "Hapus Akun & Data Saya". Seluruh catatan dan riwayat refleksimu akan dihapus permanen dari sistem.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3748]/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[#e4e2df] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.12),0_1px_3px_0_rgba(107,142,125,0.06)] text-[#2d3748] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e2df] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b]">
              <HelpCircle className="w-5 h-5 text-[#6b8e7d]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2d3748] tracking-tight font-serif">
                Panduan &amp; Tanya Jawab
              </h2>
              <p className="text-xs text-[#a0aec0]">Mengenal Cara Kerja dan Manfaat Ruang Jeda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#a0aec0] hover:text-[#2d3748] hover:bg-[#f5f0eb] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-6 overflow-y-auto pr-1 text-xs text-[#4a5568] leading-relaxed">
          {/* Section: Cara Membaca Grafik */}
          <div>
            <h3 className="text-sm font-bold text-[#2d3748] font-serif mb-3 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-[#6b8e7d]" />
              <span>Cara Membaca 4 Grafik Dasbor</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#fbf9f6] p-4 rounded-2xl border border-[#e4e2df]">
                <div className="font-semibold text-[#6b8e7d] mb-1">1. Tren Kecemasan (0-6)</div>
                <p className="text-xs text-[#4a5568]">
                  Adaptasi momentary GAD-2. Jika grafik melampaui garis putus-putus terracotta (skor ≥ 5), sistem mengindikasikan lonjakan cemas akut.
                </p>
              </div>

              <div className="bg-[#fbf9f6] p-4 rounded-2xl border border-[#e4e2df]">
                <div className="font-semibold text-[#d98e73] mb-1">2. Tren Kelelahan (1-10)</div>
                <p className="text-xs text-[#4a5568]">
                  Rata-rata kelelahan mental &amp; fisik. Jika berada di atas batas waspada (≥ 6) selama berhari-hari, daya kognitifmu sedang terkuras.
                </p>
              </div>

              <div className="bg-[#fbf9f6] p-4 rounded-2xl border border-[#e4e2df]">
                <div className="font-semibold text-[#4a6b5b] mb-1">3. Tren Progres (1-5)</div>
                <p className="text-xs text-[#4a5568]">
                  Kepuasan kemajuan skripsi &amp; efikasi diri. Nilai ≤ 2 yang bertahan lama menandakan hambatan yang butuh jeda atau bantuan bimbingan.
                </p>
              </div>

              <div className="bg-[#fbf9f6] p-4 rounded-2xl border border-[#e4e2df]">
                <div className="font-semibold text-[#2c4d3f] mb-1">4. Distribusi Sumber Stres</div>
                <p className="text-xs text-[#4a5568]">
                  Menghitung faktor apa yang paling sering memicu stres (teknis riset, bimbingan dosen, atau manajemen waktu).
                </p>
              </div>
            </div>
          </div>

          {/* Section: FAQ Accordion */}
          <div>
            <h3 className="text-sm font-bold text-[#2d3748] font-serif mb-3">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h3>
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#e4e2df] bg-[#fbf9f6] rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-[#2d3748] hover:text-[#6b8e7d] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#6b8e7d] shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#a0aec0] shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#4a5568] border-t border-[#e4e2df] pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Citation */}
          <div className="p-3.5 rounded-2xl bg-[#f5f0eb] border border-[#e4e2df] text-[11px] text-[#4a5568]">
            <strong>Referensi Ilmiah:</strong> Saragih, S. F., &amp; Situngkir, T. T. (2022). Penerapan
            Aplikasi Web Ecological Momentary Assessment (EMA) &quot;Jeda&quot; untuk Deteksi Dini Pola
            Stres dan Pencegahan Burnout pada Mahasiswa Tingkat Akhir. <em>GIAT: Teknologi untuk Masyarakat</em>, 1(1).
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-[#e4e2df] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-semibold bg-[#f5f0eb] hover:bg-[#eae2d8] text-[#4a5568] hover:text-[#2d3748] transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
