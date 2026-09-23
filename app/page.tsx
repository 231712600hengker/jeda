'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import InformedConsentModal from '@/components/InformedConsentModal';
import CheckInForm from '@/components/CheckInForm';
import DashboardView from '@/components/DashboardView';
import HistoryTable from '@/components/HistoryTable';
import AlertModal from '@/components/AlertModal';
import GuideFaqModal from '@/components/GuideFaqModal';
import SettingsModal from '@/components/SettingsModal';
import { useSession } from '@/hooks/useSession';
import type { CheckinItem, AlertRecord, DetectionResult } from '@/types/jeda';

export default function HomePage() {
  const { session, setSession, isLoading: isSessionLoading, refresh: refreshSession } = useSession();

  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'history'>('dashboard');

  // Modals & Pending State
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAccessCode, setPendingAccessCode] = useState<string>('');
  const [activeAlert, setActiveAlert] = useState<AlertRecord | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Check-ins and Alerts from API
  const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      const [checkinsRes, alertsRes] = await Promise.all([
        fetch('/api/checkins?days=30'),
        fetch('/api/alerts?status=all'),
      ]);

      if (checkinsRes.ok) {
        const data = await checkinsRes.json();
        setCheckins(data.checkins || []);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setCheckins([]);
      setAlerts([]);
    }
  }, [session, fetchData]);

  // 1. Generate code and start consent flow
  const handleStartNew = async () => {
    try {
      const res = await fetch('/api/auth/generate-code', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat kode');

      setPendingAccessCode(data.accessCode);

      // Auto login with generated code to set cookie
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: data.accessCode }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Gagal menyiapkan sesi');

      setShowConsentModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      showToast(msg);
      throw err;
    }
  };

  // 2. Agree to informed consent
  const handleAgreeConsent = async () => {
    try {
      const res = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyetujui persetujuan');

      await refreshSession();
      setShowConsentModal(false);
      setActiveTab('checkin'); // Langsung ke check-in pertama
      showToast(`Akun ${pendingAccessCode} aktif. Selamat datang di Jeda.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses persetujuan';
      showToast(msg);
      throw err;
    }
  };

  // 3. Login with access code
  const handleLogin = async (code: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kode akses tidak valid');

      await refreshSession();
      setActiveTab('dashboard');
      showToast(`Selamat datang kembali, ${data.accessCode}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk';
      showToast(msg);
      throw err;
    }
  };

  // 4. Save checkin via API
  const handleSaveCheckin = async (
    checkinPayload: Omit<CheckinItem, 'id' | 'createdAt'>
  ): Promise<DetectionResult> => {
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan check-in');

      // Refresh data dari API
      await fetchData();

      // Jika ada alerts baru yang dibuat oleh server
      if (data.alerts && data.alerts.length > 0) {
        const latestAlert: AlertRecord = data.alerts[0];
        setActiveAlert(latestAlert);
        setShowAlertModal(true);
      } else {
        showToast('Check-in hari ini berhasil disimpan ke cloud database.');
      }

      setActiveTab('dashboard');

      return {
        isAcute: (data.alerts || []).some((a: AlertRecord) => a.alertType === 'acute'),
        isChronic: (data.alerts || []).some((a: AlertRecord) => a.alertType === 'chronic'),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim check-in';
      showToast(msg);
      throw err;
    }
  };

  // 5. Review Alert via API
  const handleReviewAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/review`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui status alert');
      }
      // Update state lokal
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, reviewedAt: new Date().toISOString() } : a
        )
      );
      showToast('Peringatan ditandai sudah ditinjau.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal meninjau peringatan';
      showToast(msg);
    }
  };

  // 6. Export CSV via API
  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
    showToast('Mengunduh berkas CSV dari server...');
  };

  // 7. Logout via API
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setCheckins([]);
      setAlerts([]);
      setActiveTab('dashboard');
      showToast('Anda telah keluar.');
    } catch {
      setSession(null);
    }
  };

  // 8. Delete Account via API
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus akun');
      }
      setSession(null);
      setCheckins([]);
      setAlerts([]);
      setShowSettingsModal(false);
      setActiveTab('dashboard');
      showToast('Seluruh data dan akun Anda telah dihapus permanen.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus akun';
      showToast(msg);
    }
  };

  // Optional Demo load (inform user)
  const handleLoadDemo = () => {
    showToast('Versi 2.0 terhubung dengan database sungguhan. Silakan isi check-in langsung.');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const firstCheckin = checkins.length > 0 ? checkins[checkins.length - 1].checkinDate : null;
  const lastCheckin = checkins.length > 0 ? checkins[0].checkinDate : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/60 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Top Bar */}
      <Navbar
        session={session}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
        totalCheckins={checkins.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isSessionLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-slate-400 text-xs flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Memeriksa sesi server...</span>
            </div>
          </div>
        ) : !session ? (
          <LandingHero
            onStartNew={handleStartNew}
            onLogin={handleLogin}
            onOpenGuide={() => setShowGuideModal(true)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                checkins={checkins}
                alerts={alerts}
                onOpenCheckin={() => setActiveTab('checkin')}
                onExportCSV={handleExportCSV}
                onReviewAlert={handleReviewAlert}
                onLoadDemo={handleLoadDemo}
              />
            )}

            {activeTab === 'checkin' && (
              <CheckInForm
                userId={session.userId}
                onSave={handleSaveCheckin}
                onCancel={() => setActiveTab('dashboard')}
                existingTodayCheckin={
                  checkins.find((c) => c.checkinDate === todayStr) || null
                }
              />
            )}

            {activeTab === 'history' && (
              <HistoryTable
                checkins={checkins}
                onExportCSV={handleExportCSV}
                onOpenCheckin={() => setActiveTab('checkin')}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <InformedConsentModal
        isOpen={showConsentModal}
        accessCode={pendingAccessCode}
        onAgree={handleAgreeConsent}
        onDecline={() => setShowConsentModal(false)}
      />

      <AlertModal
        isOpen={showAlertModal}
        alert={activeAlert}
        onDismiss={() => setShowAlertModal(false)}
        onExportData={() => {
          handleExportCSV();
          setShowAlertModal(false);
        }}
      />

      <GuideFaqModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        session={session}
        totalCheckins={checkins.length}
        firstCheckinDate={firstCheckin}
        lastCheckinDate={lastCheckin}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Jeda v2.0</span>
            <span aria-hidden="true">·</span>
            <span>Ecological Momentary Assessment untuk Mahasiswa Skripsi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Saragih &amp; Situngkir (2022)</span>
            <span aria-hidden="true">·</span>
            <span>Supabase + Next.js</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Panduan Instrumen
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

