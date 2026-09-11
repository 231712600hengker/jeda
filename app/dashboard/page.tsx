'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { getOrCreateUser } from '@/lib/user'
import { Checkin, CheckinStressor, ChartDataPoint, StressorCount, AlertRecord } from '@/lib/types'
import { generateDummyCheckins, STRESSOR_LABELS } from '@/lib/dummy-data'

// Tombol data simulasi hanya tampil kalau flag ini diaktifkan lewat env var.
// JANGAN aktifkan di environment yang dipakai untuk pilot test sungguhan,
// supaya partisipan tidak bisa tidak sengaja mengotori data asli mereka.
const DEMO_DATA_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === 'true'

export default function DashboardPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [stressors, setStressors] = useState<CheckinStressor[]>([])
  const [stressorData, setStressorData] = useState<{ nama: string; jumlah: number }[]>([])
  const [activeAlerts, setActiveAlerts] = useState<AlertRecord[]>([])
  const [anonCode, setAnonCode] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isGenerating, startGenerateTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const uid = await getOrCreateUser()
      setUserId(uid)

      const { data: cData, error: cErr } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', uid)
        .order('checkin_date', { ascending: true })

      if (cErr) throw cErr

      const fetchedCheckins = cData || []
      setCheckins(fetchedCheckins)

      if (fetchedCheckins.length > 0) {
        const ids = fetchedCheckins.map((c) => c.id)
        const { data: sData, error: sErr } = await supabase
          .from('checkin_stressors')
          .select('*')
          .in('checkin_id', ids)

        if (!sErr && sData) {
          setStressors(sData)
        }
      } else {
        setStressors([])
      }

      // 2. Query Data Alerts yang belum direspons (acknowledged: false)
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', uid)
        .eq('acknowledged', false)
        .order('triggered_at', { ascending: false })

      if (!alertsError && alertsData) {
        setActiveAlerts(alertsData)
      }

      // 3. Query Data Stressors dari Supabase
      const { data: stressorsInfo, error: stressorsError } = await supabase
        .from('checkin_stressors')
        .select('category, checkins!inner(user_id)')
        .eq('checkins.user_id', uid)

      if (!stressorsError && stressorsInfo) {
        const counts: Record<string, number> = {}
        stressorsInfo.forEach((item: { category: string }) => {
          counts[item.category] = (counts[item.category] || 0) + 1
        })

        const formattedStressors = Object.keys(counts)
          .map((key) => ({
            nama: STRESSOR_LABELS[key] || key.replace('_', ' ').toUpperCase(),
            jumlah: counts[key],
          }))
          .sort((a, b) => b.jumlah - a.jumlah)

        setStressorData(formattedStressors)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg((err as Error).message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  // 3. Amankan Rute (Route Protection)
  useEffect(() => {
    const storedUserId = localStorage.getItem('jeda_user_id')
    if (!storedUserId) {
      window.location.href = '/'
      return
    }
    setAnonCode(localStorage.getItem('jeda_anon_code') || '')
    loadData()
  }, [])

  function handleGenerateDummy() {
    if (!userId) return
    startGenerateTransition(async () => {
      try {
        await generateDummyCheckins(userId, 7)
        await loadData()
      } catch (err) {
        alert('Gagal membuat data dummy: ' + (err as Error).message)
      }
    })
  }

  function exportCSV() {
    if (checkins.length === 0) return

    const stressorsByCheckin: Record<string, string[]> = {}
    stressors.forEach((s) => {
      if (!stressorsByCheckin[s.checkin_id]) stressorsByCheckin[s.checkin_id] = []
      stressorsByCheckin[s.checkin_id].push(STRESSOR_LABELS[s.category] || s.category)
    })

    const headers = [
      'tanggal',
      'anxiety_1',
      'anxiety_2',
      'total_kecemasan',
      'kelelahan_mental',
      'kelelahan_fisik',
      'durasi_tidur',
      'kualitas_tidur',
      'progres_bermakna',
      'kejelasan_langkah',
      'sumber_stres',
    ]

    const rows = checkins.map((c) => [
      c.checkin_date,
      c.anxiety_1,
      c.anxiety_2,
      c.anxiety_1 + c.anxiety_2,
      c.fatigue_mental,
      c.fatigue_physical,
      c.sleep_quantity,
      c.sleep_quality,
      c.progress_1,
      c.progress_2,
      (stressorsByCheckin[c.id] || []).join('; '),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jeda-checkins-${anonCode || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Format data untuk grafik
  const chartData: ChartDataPoint[] = checkins.map((item) => {
    const parts = item.checkin_date.split('-')
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.checkin_date

    return {
      date: item.checkin_date,
      displayDate,
      totalAnxiety: item.anxiety_1 + item.anxiety_2,
      anxiety1: item.anxiety_1,
      anxiety2: item.anxiety_2,
      fatigueMental: item.fatigue_mental,
      fatiguePhysical: item.fatigue_physical,
      progressMeaningful: item.progress_1,
      progressNextStep: item.progress_2,
      sleepQuantity: item.sleep_quantity,
      sleepQuality: item.sleep_quality,
    }
  })

  // Hitung Stressor paling sering
  const stressorMap: Record<string, number> = {}
  stressors.forEach((s) => {
    stressorMap[s.category] = (stressorMap[s.category] || 0) + 1
  })

  const stressorStats: StressorCount[] = Object.entries(STRESSOR_LABELS).map(([key, label]) => ({
    category: key,
    label,
    count: stressorMap[key] || 0,
  })).sort((a, b) => b.count - a.count)

  // Metrik Ringkasan
  const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null
  const latestAnxiety = latestCheckin ? latestCheckin.anxiety_1 + latestCheckin.anxiety_2 : null
  const avgMentalFatigue =
    checkins.length > 0
      ? (checkins.reduce((sum, c) => sum + c.fatigue_mental, 0) / checkins.length).toFixed(1)
      : '-'
  const avgProgress =
    checkins.length > 0
      ? (
          checkins.reduce((sum, c) => sum + (c.progress_1 + c.progress_2) / 2, 0) / checkins.length
        ).toFixed(1)
      : '-'

  function getAnxietyBadge(score: number | null) {
    if (score === null) return { text: 'Belum ada catatan', color: 'bg-sand-100 text-earth-600' }
    if (score <= 2) return { text: 'Terasa terkendali', color: 'bg-sage-100 text-sage-800' }
    if (score <= 4) return { text: 'Perlu perhatian', color: 'bg-lavender-100 text-lavender-800' }
    return { text: 'Waktunya beri jeda', color: 'bg-lavender-200 text-lavender-900' }
  }

  const anxietyBadge = getAnxietyBadge(latestAnxiety)

  // 3. Buat Fungsi untuk Menutup Notifikasi (Acknowledge)
  async function handleAcknowledge(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId)

    if (!error) {
      // Hapus dari tampilan layar tanpa perlu refresh halaman
      setActiveAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 text-earth-900 pb-16">
      {/* Top Navigation */}
      <header className="bg-sand-50/95 border-b border-sand-200 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-neutral-800 hover:text-blue-600 transition">
              Jeda 🍃
            </Link>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/checkin"
              className="bg-sage-700 hover:bg-sage-800 text-white font-medium px-3.5 py-2 shadow-sm transition"
            >
              + Check-in Hari Ini
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {/* 1. Bar Navigasi & Kode Akses */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-sand-200 pb-5">
          <div className="text-earth-600 text-sm">
            Kode Akses:{' '}
            <span className="font-mono font-bold text-earth-800 bg-sand-100 px-2.5 py-1 border border-sand-200">
              {anonCode || '-'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = '/checkin')}
              className="bg-sage-700 text-white px-4 py-2 text-sm font-semibold hover:bg-sage-800 transition cursor-pointer shadow-sm"
            >
              + Isi Jurnal Hari Ini
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('jeda_user_id')
                localStorage.removeItem('jeda_anon_code')
                window.location.href = '/'
              }}
              className="border border-sand-300 text-earth-700 px-4 py-2 text-sm font-semibold hover:bg-sand-100 transition cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Banner / Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Pola yang kamu catat</h1>
            <p className="text-earth-600 text-sm mt-2">
              Lihat kecenderungan hari-hari yang terasa ringan maupun berat, tanpa perlu menghakimi diri sendiri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="text-xs px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-100 bg-white transition disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={checkins.length === 0}
              className="text-xs px-3 py-1.5 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
              title="Unduh seluruh riwayat check-in sebagai CSV"
            >
              ⬇️ Ekspor CSV
            </button>
            {DEMO_DATA_ENABLED && (
              <button
                onClick={handleGenerateDummy}
                disabled={isGenerating || loading}
                className="text-xs px-3 py-1.5 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
                title="Tambahkan data simulasi 7 hari untuk melihat grafik lebih lengkap"
              >
                {isGenerating ? 'Menambahkan...' : '✨ Tambah Data Simulasi (7 Hari)'}
              </button>
            )}
          </div>
        </div>

        {/* Active Alerts Banner */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
              >
                <div>
                  <h3 className="text-red-800 font-bold flex items-center gap-2">
                    <span>🚨</span>
                    <span>Peringatan: Skor Kritis Terdeteksi</span>
                  </h3>
                  <p className="text-red-700 text-sm mt-0.5">
                    Sistem mendeteksi tingkat kecemasan/kelelahan yang tinggi pada check-in Anda. 
                    Mohon pertimbangkan untuk beristirahat atau berkonsultasi jika kondisi berlanjut.
                  </p>
                  {typeof alert.trigger_detail === 'object' && alert.trigger_detail?.reason && (
                    <p className="text-red-600 text-xs mt-1 font-medium">
                      Pemicu: {alert.trigger_detail.reason}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => alert.id && handleAcknowledge(alert.id)}
                  className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition shrink-0 self-start sm:self-center cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center text-neutral-400 font-medium">
            Memuat data check-in...
          </div>
        )}

        {/* Empty State */}
        {!loading && checkins.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="text-4xl mb-3">🌱</div>
            <h2 className="text-lg font-semibold mb-1">Belum Ada Riwayat Check-in</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Mulai rekam kondisi harimu atau gunakan tombol simulasi untuk melihat visualisasi grafik langsung.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/checkin"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
              >
                Mulai Check-in Sekarang
              </Link>
              {DEMO_DATA_ENABLED && (
                <button
                  onClick={handleGenerateDummy}
                  disabled={isGenerating}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-4 py-2 rounded-lg text-sm transition"
                >
                  {isGenerating ? 'Membuat Data...' : 'Isi Data Simulasi (7 Hari)'}
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && checkins.length > 0 && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase">Kecemasan Terakhir</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{latestAnxiety !== null ? `${latestAnxiety}/6` : '-'}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${anxietyBadge.color}`}>
                    {anxietyBadge.text}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase">Rata-rata Kelelahan Mental</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{avgMentalFatigue}</span>
                  <span className="text-xs text-neutral-400">/ 10</span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {Number(avgMentalFatigue) >= 7 ? '⚠️ Indikasi kelelahan tinggi' : 'Tingkat kelelahan wajar'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase">Rata-rata Progres</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{avgProgress}</span>
                  <span className="text-xs text-neutral-400">/ 5</span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">Momentum pengerjaan</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase">Total Riwayat</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{checkins.length}</span>
                  <span className="text-xs text-neutral-500">hari tercatat</span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Tidur semalam: {latestCheckin?.sleep_quantity || '-'}
                </p>
              </div>
            </div>

            {/* Chart 1: Kelelahan Mental vs Fisik */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-neutral-800">Tren Kelelahan Mental & Fisik</h3>
                  <p className="text-xs text-neutral-500">Skala 1 (Sangat Bugar) hingga 10 (Burnout / Sangat Lelah)</p>
                </div>
                <div className="text-xs text-neutral-400">
                  {checkins.length} titik data
                </div>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#737373' }} />
                    <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      formatter={(val, name) => [
                        `${val}/10`,
                        name === 'fatigueMental' ? 'Kelelahan Mental' : 'Kelelahan Fisik',
                      ]}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      formatter={(val) => (val === 'fatigueMental' ? 'Kelelahan Mental' : 'Kelelahan Fisik')}
                    />
                    <Line
                      type="monotone"
                      dataKey="fatigueMental"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#8b5cf6' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fatiguePhysical"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#06b6d4' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Tren Kecemasan */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-neutral-800">Tren Tingkat Kecemasan</h3>
                  <p className="text-xs text-neutral-500">Skor Gabungan (0 = Tenang, 6 = Sangat Cemas/Gelisah)</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anxietyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#737373' }} />
                    <YAxis domain={[0, 6]} ticks={[0, 2, 4, 6]} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      formatter={(val) => [`${val} / 6`, 'Total Skor Kecemasan']}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAnxiety"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#anxietyGrad)"
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Progres & Kejelasan Langkah */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-neutral-800">Tren Progres & Arah Skripsi</h3>
                  <p className="text-xs text-neutral-500">Skala 1 (Stuck / Bingung) hingga 5 (Kemajuan Signifikan / Sangat Jelas)</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#737373' }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      formatter={(val, name) => [
                        `${val}/5`,
                        name === 'progressMeaningful' ? 'Kemajuan Berarti' : 'Kejelasan Langkah Berikutnya',
                      ]}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      formatter={(val) => (val === 'progressMeaningful' ? 'Kemajuan Berarti' : 'Kejelasan Langkah Berikutnya')}
                    />
                    <Line
                      type="monotone"
                      dataKey="progressMeaningful"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="progressNextStep"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Analisis Pemicu Stres (Bar Chart) */}
            {stressorData.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-neutral-800">Frekuensi Pemicu Stres</h3>
                  <p className="text-xs text-neutral-500">
                    Analisis pemicu stres yang paling sering dicatat selama pengerjaan skripsi.
                  </p>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stressorData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#737373' }} />
                      <YAxis
                        dataKey="nama"
                        type="category"
                        width={140}
                        tick={{ fontSize: 11, fill: '#525252' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e5e5e5',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [`${val} kali`, 'Frekuensi']}
                      />
                      <Bar dataKey="jumlah" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Grid Rincian Badge */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-neutral-100">
                  {stressorData.map((item) => (
                    <div
                      key={item.nama}
                      className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/70 flex flex-col justify-between"
                    >
                      <span className="text-xs font-medium text-neutral-600 line-clamp-1">{item.nama}</span>
                      <span className="text-sm font-bold text-purple-700 mt-1">{item.jumlah}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
