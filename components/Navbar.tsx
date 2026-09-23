'use client';

import React from 'react';
import type { UserSession } from '@/types/jeda';
import { LayoutDashboard, ClipboardCheck, History, BookOpen, Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  session: UserSession | null;
  activeTab: 'dashboard' | 'checkin' | 'history';
  onSelectTab: (tab: 'dashboard' | 'checkin' | 'history') => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  totalCheckins: number;
}

export default function Navbar({
  session,
  activeTab,
  onSelectTab,
  onOpenGuide,
  onOpenSettings,
  onLogout,
  totalCheckins,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 font-mono text-sm shadow-sm">
            J
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Jeda</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
              EMA · Monitoring Stres Skripsi
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Only when logged in) */}
        {session && (
          <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dasbor</span>
            </button>

            <button
              onClick={() => onSelectTab('checkin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'checkin'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Check-in</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Riwayat</span>
              {totalCheckins > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {totalCheckins}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            title="Panduan & FAQ"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {session && (
            <>
              <button
                onClick={onOpenSettings}
                title="Pengaturan Akun"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Keluar"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors"
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

