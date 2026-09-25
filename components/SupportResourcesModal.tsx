'use client';

import { ExternalLink, HeartHandshake, Phone, ShieldAlert, X } from 'lucide-react';

export default function SupportResourcesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#2d3748]/50 p-4 backdrop-blur-sm animate-fade-in">
    <div role="dialog" aria-modal="true" aria-labelledby="support-title" className="my-8 w-full max-w-lg rounded-3xl border border-[#e4e2df] bg-white p-6 text-[#2d3748] shadow-xl sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-3"><div className="flex gap-3"><div className="rounded-2xl border border-[#c5ebd7] bg-[#e8efea] p-3 text-[#4a6b5b]"><HeartHandshake className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[#6b8e7d]">Dukungan nasional Indonesia</p><h2 id="support-title" className="font-serif text-xl font-bold">Kamu tidak harus melewatinya sendiri.</h2></div></div><button type="button" onClick={onClose} aria-label="Tutup" className="p-1 text-[#a0aec0]"><X className="h-5 w-5" /></button></div>
      <p className="mb-5 text-sm leading-relaxed text-[#4a5568]">Jeda bukan layanan darurat atau pengganti tenaga profesional. Pilih jalur yang paling aman untuk kondisimu saat ini.</p>
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#c5ebd7] bg-[#e8efea]/60 p-4"><div className="flex gap-2"><HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-[#6b8e7d]" /><div><h3 className="text-sm font-semibold">Butuh teman bicara atau dukungan emosional</h3><p className="mt-1 text-xs leading-relaxed text-[#4a5568]">Healing119 dari Kementerian Kesehatan menyediakan dukungan psikologis awal dan rujukan. Ini bukan terapi atau konseling jangka panjang.</p><a href="https://healing119.id" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#6b8e7d] px-4 py-2 text-xs font-semibold text-white"><ExternalLink className="h-3.5 w-3.5" />Buka Healing119</a></div></div></div>
        <div className="rounded-2xl border border-[#d98e73]/70 bg-[#fdf3ee] p-4"><div className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#a6634b]" /><div><h3 className="text-sm font-semibold">Ada bahaya medis segera atau kamu tidak merasa aman</h3><p className="mt-1 text-xs leading-relaxed text-[#4a5568]">Hubungi layanan gawat darurat medis 119 atau datangi unit gawat darurat/fasilitas kesehatan terdekat. Bila memungkinkan, jangan sendirian—hubungi orang tepercaya di dekatmu.</p><a href="tel:119" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d98e73] bg-white px-4 py-2 text-xs font-semibold text-[#a6634b]"><Phone className="h-3.5 w-3.5" />Hubungi 119</a></div></div></div>
      </div>
      <p className="mt-5 text-[11px] leading-relaxed text-[#a0aec0]">Ketersediaan kanal dapat berubah. Jika Healing119 tidak terhubung, coba kembali melalui situsnya atau pilih bantuan medis terdekat sesuai kondisi.</p>
    </div>
  </div>;
}
