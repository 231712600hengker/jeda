'use client';

import { useState } from 'react';
import { Battery, Flame, Timer } from 'lucide-react';
import type { CheckinInput } from '@/lib/validations';

export default function QuickCheckin({ onSave, onBack }: { onSave: (data: CheckinInput) => Promise<unknown>; onBack: () => void }) {
  const [quickStress, setQuickStress] = useState(5);
  const [quickEnergy, setQuickEnergy] = useState(5);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await onSave({ checkinType: 'quick', quickStress, quickEnergy }); } finally { setSaving(false); }
  };
  const scale = (value: number, onChange: (value: number) => void, tone: 'sage' | 'terra') => (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => (
        <button key={number} type="button" onClick={() => onChange(number)} className={`h-10 rounded-xl text-xs font-semibold transition-colors ${value === number ? tone === 'sage' ? 'bg-[#6b8e7d] text-white' : 'bg-[#d98e73] text-white' : 'border border-[#e4e2df] bg-[#fbf9f6] text-[#4a5568]'}`}>{number}</button>
      ))}
    </div>
  );
  return <div className="mx-auto max-w-2xl animate-fade-in px-4 py-8">
    <div className="rounded-3xl border border-[#e4e2df] bg-white p-6 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08)] sm:p-8">
      <div className="mb-7 flex items-start gap-4 border-b border-[#e4e2df] pb-5"><div className="rounded-2xl border border-[#c5ebd7] bg-[#e8efea] p-3 text-[#4a6b5b]"><Timer className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-[#6b8e7d]">Check-in ringkas · ±30 detik</p><h2 className="font-serif text-xl font-bold">Cukup dua jawaban untuk hari yang padat.</h2><p className="mt-1 text-xs leading-relaxed text-[#4a5568]">Ini dicatat terpisah dari refleksi lengkap, jadi tidak akan mengisi data tidur atau progres yang belum kamu jawab.</p></div></div>
      <div className="space-y-7"><div><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Flame className="h-4 w-4 text-[#d98e73]" /> Seberapa tinggi stresmu saat ini? <span className="ml-auto text-[#d98e73]">{quickStress}/10</span></div>{scale(quickStress, setQuickStress, 'terra')}</div><div><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Battery className="h-4 w-4 text-[#6b8e7d]" /> Seberapa banyak energimu saat ini? <span className="ml-auto text-[#6b8e7d]">{quickEnergy}/10</span></div>{scale(quickEnergy, setQuickEnergy, 'sage')}</div></div>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e4e2df] pt-6 sm:flex-row sm:justify-between"><button type="button" onClick={onBack} className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#4a5568]">Pilih refleksi lengkap</button><button type="button" disabled={saving} onClick={save} className="rounded-full bg-[#6b8e7d] px-6 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan check-in ringkas'}</button></div>
    </div>
  </div>;
}
