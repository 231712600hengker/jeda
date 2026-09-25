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
import RelaxationModal from '@/components/RelaxationModal';
import { useSession } from '@/hooks/useSession';
import type { CheckinItem, AlertRecord, DetectionResult } from '@/types/jeda';
import { Check } from 'lucide-react';

export default function HomePage() {
  const { session, setSession, isLoading: isSessionLoading, refresh: refreshSession } = useSession();

  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'history'>('dashboard');

  // Modals & State
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAccessCode, setPendingAccessCode] = useState<string>('');
  const [activeAlert, setActiveAlert] = useState<AlertRecord | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRelaxationModal, setShowRelaxationModal] = useState(false);
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
        showToast(
          data.isUpdate
            ? 'Catatan refleksi hari ini berhasil diperbarui.'
            : 'Refleksi hari ini berhasil disimpan.'
        );
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
    showToast('Data demo berhasil dimuat ke dalam dasbor.');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckin = checkins.find((c) => c.checkinDate === todayStr) || null;
  const hasCheckedInToday = !!todayCheckin;
  const firstCheckin = checkins.length > 0 ? checkins[checkins.length - 1].checkinDate : null;
  const lastCheckin = checkins.length > 0 ? checkins[0].checkinDate : null;

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#2d3748] flex flex-col font-sans selection:bg-[#c5ebd7] selection:text-[#2c4d3f]">
      {/* Toast Notification (Serene Hearth Sage Toast) */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex w-auto max-w-md items-start gap-2.5 rounded-2xl border border-white/20 bg-[#6b8e7d] px-5 py-3 text-xs font-medium text-white shadow-[0_10px_25px_-5px_rgba(107,142,125,0.3)] animate-fade-in sm:bottom-6 sm:left-auto sm:right-6 sm:w-fit sm:items-center sm:rounded-full sm:text-sm">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="min-w-0">{toastMessage}</span>
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
        hasCheckedInToday={hasCheckedInToday}
        onOpenRelaxation={() => setShowRelaxationModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isSessionLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-[#6b8e7d] text-xs sm:text-sm font-medium flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#6b8e7d] border-t-transparent rounded-full animate-spin" />
              <span>Menyiapkan ruang aman untukmu...</span>
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
                onOpenRelaxation={() => setShowRelaxationModal(true)}
              />
            )}

            {activeTab === 'checkin' && (
              <CheckInForm
                userId={session.userId}
                onSave={handleSaveCheckin}
                onCancel={() => setActiveTab('dashboard')}
                existingTodayCheckin={todayCheckin}
                onOpenRelaxation={() => setShowRelaxationModal(true)}
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
        onOpenRelaxation={() => setShowRelaxationModal(true)}
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

      <RelaxationModal
        isOpen={showRelaxationModal}
        onClose={() => setShowRelaxationModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#e4e2df] bg-[#fbf9f6] py-8 text-xs text-[#a0aec0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="font-semibold text-[#4a5568] font-serif">Jeda</span>
            <span aria-hidden="true">·</span>
            <span>Ruang refleksi dan pemantauan kesejahteraan mahasiswa</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#4a5568]">
            <span className="font-medium text-[#4a6b5b]">made by sixy with &lt;3</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="hover:text-[#2d3748] transition-colors cursor-pointer underline underline-offset-2"
            >
              Panduan &amp; FAQ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
