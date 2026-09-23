'use client';

import React, { useState } from 'react';
import type { CheckinItem } from '@/types/jeda';
import { ChevronDown, ChevronUp, Download, Search } from 'lucide-react';

interface HistoryTableProps {
  checkins: CheckinItem[];
  onExportCSV: () => void;
  onOpenCheckin: () => void;
}

export default function HistoryTable({
  checkins,
  onExportCSV,
  onOpenCheckin,
}: HistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = checkins.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const noteMatch = (c.note || '').toLowerCase().includes(term);
    const dateMatch = c.checkinDate.includes(term);
    const stressorsMatch = (c.stressors || []).join(' ').toLowerCase().includes(term);
    return noteMatch || dateMatch || stressorsMatch;
  });

  const getStressorName = (cat: string) => {
    switch (cat) {
      case 'technical':
        return 'Beban Teknis';
      case 'guidance_bureaucracy':
        return 'Bimbingan Dosen';
      case 'time_management':
        return 'Manajemen Waktu';
      case 'infrastructure':
        return 'Infrastruktur';
      case 'personal':
        return 'Personal';
      default:
        return cat;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Check-in Lengkap</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dokumentasi berkala kondisi psikologis dan progres skripsi Anda ({checkins.length} entri).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari catatan / tanggal..."
              className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-3">
            <div>
              {checkins.length === 0
                ? 'Belum ada data check-in tersimpan. Silakan isi check-in hari ini.'
                : 'Tidak ada data yang cocok dengan kata kunci pencarian Anda.'}
            </div>
            {checkins.length === 0 && (
              <button
                onClick={onOpenCheckin}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                Mulai Check-in
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Tanggal &amp; Waktu</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Kecemasan</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Kelelahan</th>
                  <th className="py-3.5 px-3 font-semibold">Tidur Semalam</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Progres Skripsi</th>
                  <th className="py-3.5 px-3 font-semibold">Status Deteksi</th>
                  <th className="py-3.5 px-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filtered.map((item) => {
                  const combinedAnxiety = item.anxietyQ1 + item.anxietyQ2;
                  const avgFatigue = ((item.fatigueMental + item.fatiguePhysical) / 2).toFixed(1);
                  const avgProg = ((item.progress + item.selfEfficacy) / 2).toFixed(1);
                  const isExpanded = expandedId === item.id;
                  const d = new Date(item.checkinTime);
                  const formattedDate = d.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = d.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        {/* Tanggal & Jam */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{formattedDate}</div>
                          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                            {formattedTime} WIB
                          </div>
                        </td>

                        {/* Kecemasan */}
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              combinedAnxiety >= 5
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {combinedAnxiety} / 6
                          </span>
                        </td>

                        {/* Kelelahan */}
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              Number(avgFatigue) >= 6
                                ? 'text-rose-400 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {avgFatigue} / 10
                          </span>
                        </td>

                        {/* Tidur */}
                        <td className="py-3.5 px-3">
                          <div className="text-slate-200">{item.sleepQuantity}</div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            Kualitas: {item.sleepQuality}
                          </div>
                        </td>

                        {/* Progres */}
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              Number(avgProg) <= 2
                                ? 'text-rose-400 font-bold'
                                : 'text-emerald-400'
                            }
                          >
                            {avgProg} / 5
                          </span>
                        </td>

                        {/* Status Deteksi */}
                        <td className="py-3.5 px-3">
                          {item.anxietyQ1 + item.anxietyQ2 >= 5 || (item.fatigueMental + item.fatiguePhysical) / 2 >= 8 ? (
                            <span className="text-amber-400 font-medium">⚠️ Lonjakan Akut</span>
                          ) : (
                            <span className="text-slate-400">Normal</span>
                          )}
                        </td>

                        {/* Toggle Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Rincian Item */}
                              <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                  Rincian Respon 9 Item:
                                </div>
                                <div className="text-slate-300 space-y-1">
                                  <div>
                                    Kecemasan: Q1 (Gugup/Cemas) = <strong className="text-white">{item.anxietyQ1}</strong> · Q2 (Khawatir) = <strong className="text-white">{item.anxietyQ2}</strong>
                                  </div>
                                  <div>
                                    Kelelahan: Mental = <strong className="text-white">{item.fatigueMental}</strong> · Fisik = <strong className="text-white">{item.fatiguePhysical}</strong>
                                  </div>
                                  <div>
                                    Skripsi: Progres = <strong className="text-white">{item.progress}</strong> · Efikasi Diri = <strong className="text-white">{item.selfEfficacy}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Sumber Stres & Catatan */}
                              <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                  Sumber Stres:
                                </div>
                                {item.stressors && item.stressors.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                                    {item.stressors.map((s, idx) => (
                                      <span key={s}>
                                        {idx > 0 && <span className="text-slate-600 mr-1.5">/</span>}
                                        {getStressorName(s)}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-slate-500">Tidak ada sumber stres terpilih</div>
                                )}

                                {item.note && (
                                  <div className="pt-2 border-t border-slate-800/70 text-slate-300">
                                    <div className="text-[11px] text-slate-400 font-semibold mb-0.5">
                                      Catatan Refleksi:
                                    </div>
                                    <p className="italic text-slate-200">&ldquo;{item.note}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

