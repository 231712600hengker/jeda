'use client';

import React from 'react';
import type { UserSession } from '@/types/jeda';
import { LayoutDashboard, ClipboardCheck, History, BookOpen, Settings, LogOut, Sparkles, Wind } from 'lucide-react';

import Image from 'next/image';

interface NavbarProps {
  session: UserSession | null;
  activeTab: 'dashboard' | 'checkin' | 'history';
  onSelectTab: (tab: 'dashboard' | 'checkin' | 'history') => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  totalCheckins: number;
  hasCheckedInToday?: boolean;
  onOpenRelaxation?: () => void;
}

export default function Navbar({
  session,
  activeTab,
  onSelectTab,
  onOpenGuide,
  onOpenSettings,
  onLogout,
  totalCheckins,
  hasCheckedInToday,
  onOpenRelaxation,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f6]/90 backdrop-blur-md border-b border-[#e4e2df] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(107,142,125,0.2)] bg-[#6b8e7d] flex items-center justify-center">
            <Image
              src="/jeda-logo.png"
              alt="Jeda Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-[#2d3748] flex items-center gap-1.5 font-serif">
              <span>Jeda</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b8e7d] inline-block mb-0.5" />
            </div>
            <div className="text-[11px] text-[#4a5568] hidden sm:block">
              Ruang Tenang · Teman Perjalanan Skripsimu
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Only when logged in) */}
        {session && (
          <nav className="flex items-center p-1 rounded-full bg-[#f5f0eb] border border-[#e4e2df] shadow-inner">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#6b8e7d] text-white shadow-[0_2px_8px_rgba(107,142,125,0.25)] font-semibold'
                  : 'text-[#4a5568] hover:text-[#2d3748]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dasbor</span>
            </button>

            <button
              onClick={() => onSelectTab('checkin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all relative cursor-pointer ${
                activeTab === 'checkin'
                  ? 'bg-[#6b8e7d] text-white shadow-[0_2px_8px_rgba(107,142,125,0.25)] font-semibold'
                  : 'text-[#4a5568] hover:text-[#2d3748]'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Check-in</span>
              {hasCheckedInToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6b8e7d] sm:static sm:w-auto sm:h-auto sm:bg-transparent" title="Sudah check-in hari ini">
                  <Sparkles className="hidden sm:inline w-3 h-3 text-[#c5ebd7]" />
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#6b8e7d] text-white shadow-[0_2px_8px_rgba(107,142,125,0.25)] font-semibold'
                  : 'text-[#4a5568] hover:text-[#2d3748]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Riwayat</span>
              {totalCheckins > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'history' ? 'bg-[#4a6b5b] text-white' : 'bg-[#eae2d8] text-[#4a5568]'
                }`}>
                  {totalCheckins}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Relaxation Button "Butuh Jeda?" Available Anytime */}
          {onOpenRelaxation && (
            <button
              onClick={onOpenRelaxation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#4a6b5b] bg-[#e8efea] hover:bg-[#c5ebd7] border border-[#c5ebd7] transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Latihan Pernapasan 4-7-8 & Grounding 5-4-3-2-1"
            >
              <Wind className="w-3.5 h-3.5 text-[#6b8e7d]" />
              <span className="hidden md:inline">Butuh Jeda?</span>
            </button>
          )}

          <button
            onClick={onOpenGuide}
            title="Panduan & FAQ"
            className="p-2 rounded-full text-[#4a5568] hover:text-[#2d3748] hover:bg-[#f5f0eb] border border-transparent hover:border-[#e4e2df] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {session && (
            <>
              <button
                onClick={onOpenSettings}
                title="Pengaturan Akun"
                className="p-2 rounded-full text-[#4a5568] hover:text-[#2d3748] hover:bg-[#f5f0eb] border border-transparent hover:border-[#e4e2df] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Keluar"
                className="p-2 rounded-full text-[#4a5568] hover:text-[#d98e73] hover:bg-[#f4ddd4]/40 border border-transparent hover:border-[#f4ddd4] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
