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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[#2d3748]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2d3748] tracking-tight font-serif">Riwayat Refleksi Lengkap</h2>
          <p className="text-xs sm:text-sm text-[#4a5568] mt-0.5">
            Dokumentasi berkala kondisi psikologis dan progres skripsi Anda ({checkins.length} entri tercatat).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0aec0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari catatan / tanggal..."
              className="pl-9 pr-4 py-2 bg-[#fbf9f6] border border-[#e4e2df] rounded-full text-xs text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:border-[#6b8e7d]"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="px-4 py-2 rounded-full bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] text-xs font-semibold text-[#4a5568] hover:text-[#2d3748] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6b8e7d]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#e4e2df] rounded-3xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#4a5568] space-y-4">
            <div>
              {checkins.length === 0
                ? 'Belum ada data check-in tersimpan. Silakan isi check-in hari ini.'
                : 'Tidak ada data yang cocok dengan kata kunci pencarian Anda.'}
            </div>
            {checkins.length === 0 && (
              <button
                onClick={onOpenCheckin}
                className="px-6 py-2.5 rounded-full bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Mulai Check-in
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f6] border-b border-[#e4e2df] text-[#4a5568] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-5">Tanggal &amp; Waktu</th>
                  <th className="py-4 px-3 text-right">Kecemasan</th>
                  <th className="py-4 px-3 text-right">Kelelahan</th>
                  <th className="py-4 px-3">Tidur Semalam</th>
                  <th className="py-4 px-3 text-right">Progres Skripsi</th>
                  <th className="py-4 px-3">Status Deteksi</th>
                  <th className="py-4 px-5 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f0eb]">
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
                        className={`hover:bg-[#f5f0eb]/50 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#f5f0eb]/70' : ''
                        }`}
                      >
                        {/* Tanggal & Jam */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-[#2d3748]">{formattedDate}</div>
                          <div className="text-[11px] text-[#a0aec0] font-mono tabular-nums">
                            {formattedTime} WIB
                          </div>
                        </td>

                        {/* Kecemasan */}
                        <td className="py-4 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              combinedAnxiety >= 5
                                ? 'text-[#d98e73] font-bold'
                                : 'text-[#2d3748]'
                            }
                          >
                            {combinedAnxiety} / 6
                          </span>
                        </td>

                        {/* Kelelahan */}
                        <td className="py-4 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              Number(avgFatigue) >= 6
                                ? 'text-[#d98e73] font-bold'
                                : 'text-[#2d3748]'
                            }
                          >
                            {avgFatigue} / 10
                          </span>
                        </td>

                        {/* Tidur */}
                        <td className="py-4 px-3">
                          <div className="text-[#2d3748] font-medium">{item.sleepQuantity}</div>
                          <div className="text-[11px] text-[#a0aec0] capitalize">
                            Kualitas: {item.sleepQuality}
                          </div>
                        </td>

                        {/* Progres */}
                        <td className="py-4 px-3 text-right font-mono tabular-nums">
                          <span
                            className={
                              Number(avgProg) <= 2
                                ? 'text-[#a6634b] font-bold'
                                : 'text-[#6b8e7d] font-bold'
                            }
                          >
                            {avgProg} / 5
                          </span>
                        </td>

                        {/* Status Alert */}
                        <td className="py-4 px-3">
                          {item.acuteAlertTriggered || item.chronicAlertTriggered ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f4ddd4] text-[#a6634b]">
                              Pemicu Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e8efea] text-[#4a6b5b]">
                              Normal
                            </span>
                          )}
                        </td>

                        {/* Expand Icon */}
                        <td className="py-4 px-5 text-right text-[#a0aec0]">
                          {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-[#fbf9f6]">
                          <td colSpan={7} className="p-5">
                            <div className="space-y-4">
                              {/* 9 Items Detail Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-white rounded-2xl border border-[#e4e2df]">
                                  <div className="text-[10px] text-[#a0aec0] font-medium">GAD-2 Item 1 (Gelisah)</div>
                                  <div className="font-mono text-sm font-bold text-[#2d3748] mt-0.5">
                                    Skor: {item.anxietyQ1} / 3
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-[#e4e2df]">
                                  <div className="text-[10px] text-[#a0aec0] font-medium">GAD-2 Item 2 (Khawatir)</div>
                                  <div className="font-mono text-sm font-bold text-[#2d3748] mt-0.5">
                                    Skor: {item.anxietyQ2} / 3
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-[#e4e2df]">
                                  <div className="text-[10px] text-[#a0aec0] font-medium">Kelelahan Mental</div>
                                  <div className="font-mono text-sm font-bold text-[#2d3748] mt-0.5">
                                    Skor: {item.fatigueMental} / 10
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-[#e4e2df]">
                                  <div className="text-[10px] text-[#a0aec0] font-medium">Kelelahan Fisik</div>
                                  <div className="font-mono text-sm font-bold text-[#2d3748] mt-0.5">
                                    Skor: {item.fatiguePhysical} / 10
                                  </div>
                                </div>
                              </div>

                              {/* Stressors */}
                              <div>
                                <div className="text-xs font-semibold text-[#4a5568] mb-1.5">
                                  Sumber Hambatan / Stres yang Dipilih:
                                </div>
                                {item.stressors && item.stressors.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.stressors.map((s) => (
                                      <span
                                        key={s}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-[#e8efea] text-[#4a6b5b] border border-[#c5ebd7]"
                                      >
                                        {getStressorName(s)}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#a0aec0] italic">Tidak ada pemicu stres yang ditandai.</span>
                                )}
                              </div>

                              {/* Note */}
                              {item.note && (
                                <div className="p-3.5 bg-white rounded-2xl border border-[#e4e2df] text-xs leading-relaxed text-[#4a5568]">
                                  <span className="font-semibold text-[#2d3748]">Catatan Refleksi: </span>
                                  &ldquo;{item.note}&rdquo;
                                </div>
                              )}
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
