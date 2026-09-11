'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Checkin, CheckinStressor, ChartDataPoint, AlertRecord } from '@/lib/types'
import { SLEEP_QUALITY_OPTIONS, STRESSOR_LABELS } from '@/lib/constants'

type Range = '7' | '30' | 'all'

function createDemoCheckins(): Checkin[] {
  const pattern = [
    [2, 2, 7, 6, 2, 2], [2, 1, 6, 5, 3, 3], [3, 2, 8, 7, 1, 2],
    [1, 1, 5, 4, 4, 4], [2, 2, 6, 6, 3, 3], [1, 0, 4, 3, 4, 5], [0, 1, 3, 4, 5, 4],
  ]
  return pattern.map(([anxiety1, anxiety2, mental, physical, progress1, progress2], index) => {
    const date = new Date()
    date.setDate(date.getDate() - (pattern.length - 1 - index))
    return {
      id: `demo-${index}`, user_id: 'demo', checkin_date: date.toISOString().split('T')[0],
      anxiety_1: anxiety1, anxiety_2: anxiety2, fatigue_mental: mental, fatigue_physical: physical,
      sleep_quantity: index === 3 ? '4-6 Jam' : '6-8 Jam', sleep_quality: index === 3 ? SLEEP_QUALITY_OPTIONS[0] : SLEEP_QUALITY_OPTIONS[1],
      progress_1: progress1, progress_2: progress2,
    }
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [stressors, setStressors] = useState<CheckinStressor[]>([])
  const [stressorData, setStressorData] = useState<{ nama: string; jumlah: number }[]>([])
  const [activeAlerts, setActiveAlerts] = useState<AlertRecord[]>([])
  const [anonCode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('jeda_anon_code') || '' : '')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [demoCheckins, setDemoCheckins] = useState<Checkin[] | null>(null)
  const [selectedRange, setSelectedRange] = useState<Range>('30')
  const [exporting, setExporting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const uid = await getOrCreateUser()

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
      router.push('/')
      return
    }
    queueMicrotask(() => {
      void loadData()
    })
  }, [router])

  function handleGenerateDummy() {
    if (demoCheckins) {
      setDemoCheckins(null)
      setActionMessage('Kembali menampilkan data check-in kamu.')
      return
    }
    setDemoCheckins(createDemoCheckins())
    setActionMessage('Mode simulasi aktif. Data contoh ini hanya tampil di browser dan tidak disimpan.')
  }

  function exportCSV() {
    if (activeCheckins.length === 0) return
    setExporting(true)

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

    const rows = activeCheckins.map((c) => [
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
    setActionMessage(`CSV untuk ${activeCheckins.length} check-in sedang diunduh.`)
    setExporting(false)
  }

  const activeCheckins = demoCheckins ?? checkins

  // Format data untuk grafik
  const chartData: ChartDataPoint[] = activeCheckins.map((item) => {
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

  const filteredChartData = selectedRange === 'all' ? chartData : chartData.slice(-Number(selectedRange))

  // Metrik Ringkasan
  const latestCheckin = activeCheckins.length > 0 ? activeCheckins[activeCheckins.length - 1] : null
  const today = new Date().toISOString().split('T')[0]
  const needsDailyReminder = !loading && latestCheckin?.checkin_date !== today
  const latestAnxiety = latestCheckin ? latestCheckin.anxiety_1 + latestCheckin.anxiety_2 : null
  const avgMentalFatigue =
    activeCheckins.length > 0
      ? (activeCheckins.reduce((sum, c) => sum + c.fatigue_mental, 0) / activeCheckins.length).toFixed(1)
      : '-'
  const avgProgress =
    activeCheckins.length > 0
      ? (
          activeCheckins.reduce((sum, c) => sum + (c.progress_1 + c.progress_2) / 2, 0) / activeCheckins.length
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
    <div className="flex-1 bg-sand-50 text-earth-900 pb-16">
      {/* Top Navigation */}
      <header className="bg-sand-50/95 border-b border-sand-200 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-earth-800 hover:text-sage-700 transition">
              Jeda 🍃
            </Link>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sage-50 text-sage-800 border border-sage-200">
              Dashboard
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/reflection"
              className="border border-sand-300 px-3.5 py-2 font-semibold text-earth-700 transition hover:bg-sand-100"
            >
              Refleksi minggu ini
            </Link>
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
              onClick={() => router.push('/checkin')}
              className="bg-sage-700 text-white px-4 py-2 text-sm font-semibold hover:bg-sage-800 transition cursor-pointer shadow-sm"
            >
              + Isi Jurnal Hari Ini
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('jeda_user_id')
                localStorage.removeItem('jeda_anon_code')
                router.push('/')
              }}
              className="border border-sand-300 text-earth-700 px-4 py-2 text-sm font-semibold hover:bg-sand-100 transition cursor-pointer"
            >
              Ganti kode / keluar
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="border border-sand-300 bg-white px-3 py-2 text-xs font-semibold text-earth-700 transition hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportCSV}
              disabled={activeCheckins.length === 0 || exporting}
              className="border border-sage-300 bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800 transition hover:bg-sage-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Unduh seluruh riwayat check-in sebagai CSV"
            >
              ⬇️ Ekspor CSV
            </button>
            <button onClick={handleGenerateDummy} disabled={loading} className="border border-lavender-300 bg-lavender-50 px-3 py-2 text-xs font-semibold text-lavender-800 transition hover:bg-lavender-100 disabled:cursor-not-allowed disabled:opacity-50" title="Tampilkan atau tutup contoh data 7 hari tanpa menyimpan apa pun">
              {demoCheckins ? 'Kembali ke data saya' : 'Lihat data simulasi'}
            </button>
          </div>
        </div>

        {needsDailyReminder && (
          <div className="flex flex-col gap-3 border-l-4 border-sage-400 bg-sage-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sage-900">Belum ada check-in hari ini</p>
              <p className="mt-1 text-sm text-sage-800">Satu menit cukup untuk membantu melihat ritme harimu.</p>
            </div>
            <Link href="/checkin" className="shrink-0 text-sm font-semibold text-sage-800 underline underline-offset-4">Catat sekarang</Link>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3 border-y border-sand-200 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-earth-800">Tampilan data</p>
              <p className="mt-1 text-xs text-earth-600">{demoCheckins ? 'Kamu sedang melihat data contoh yang hanya ada di browser ini.' : `${activeCheckins.length} check-in tersimpan di riwayatmu.`}</p>
            </div>
            <div className="inline-flex w-full border border-sand-300 bg-white sm:w-auto" aria-label="Rentang data">
              {(['7', '30', 'all'] as Range[]).map((range) => (
                <button key={range} onClick={() => setSelectedRange(range)} className={`flex-1 px-3 py-2 text-xs font-semibold transition sm:flex-none ${selectedRange === range ? 'bg-earth-800 text-white' : 'text-earth-600 hover:bg-sand-100'}`}>
                  {range === 'all' ? 'Semua' : `${range} hari`}
                </button>
              ))}
            </div>
          </div>
        )}

        {actionMessage && <div className="flex items-center justify-between border-l-4 border-sage-400 bg-sage-50 px-4 py-3 text-sm text-sage-900"><span>{actionMessage}</span><button onClick={() => setActionMessage(null)} className="ml-4 text-xs font-semibold underline underline-offset-4">Tutup</button></div>}

        {/* Active Alerts Banner */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
              className="bg-lavender-50 border-l-4 border-lavender-500 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
              >
                <div>
                  <h3 className="text-lavender-900 font-bold flex items-center gap-2">
                    <span>🚨</span>
                    <span>Peringatan: Skor Kritis Terdeteksi</span>
                  </h3>
                  <p className="text-lavender-800 text-sm mt-0.5">
                    Sistem mendeteksi tingkat kecemasan/kelelahan yang tinggi pada check-in Anda. 
                    Mohon pertimbangkan untuk beristirahat atau berkonsultasi jika kondisi berlanjut.
                  </p>
                  {typeof alert.trigger_detail === 'object' && alert.trigger_detail?.reason && (
                    <p className="text-lavender-700 text-xs mt-1 font-medium">
                      Pemicu: {alert.trigger_detail.reason}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => alert.id && handleAcknowledge(alert.id)}
                  className="bg-lavender-100 text-lavender-900 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-lavender-200 transition shrink-0 self-start sm:self-center cursor-pointer"
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
          <div className="p-12 text-center text-earth-400 font-medium">
            Memuat data check-in...
          </div>
        )}

        {/* Empty State */}
        {!loading && activeCheckins.length === 0 && (
          <div className="bg-white border border-sand-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="text-4xl mb-3">🌱</div>
            <h2 className="text-lg font-semibold mb-1">Belum Ada Riwayat Check-in</h2>
            <p className="text-earth-500 text-sm mb-6">
              Mulai rekam kondisi harimu atau gunakan tombol simulasi untuk melihat visualisasi grafik langsung.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/checkin"
                className="bg-sage-700 hover:bg-sage-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
              >
                Mulai Check-in Sekarang
              </Link>
            </div>
          </div>
        )}

        {!loading && activeCheckins.length > 0 && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm">
                <p className="text-xs text-earth-500 font-medium uppercase">Kecemasan Terakhir</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{latestAnxiety !== null ? `${latestAnxiety}/6` : '-'}</span>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${anxietyBadge.color}`}>
                    {anxietyBadge.text}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm">
                <p className="text-xs text-earth-500 font-medium uppercase">Rata-rata Kelelahan Mental</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{avgMentalFatigue}</span>
                  <span className="text-xs text-earth-400">/ 10</span>
                </div>
                <p className="text-xs text-earth-500 mt-2">
                  {Number(avgMentalFatigue) >= 7 ? '⚠️ Indikasi kelelahan tinggi' : 'Tingkat kelelahan wajar'}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm">
                <p className="text-xs text-earth-500 font-medium uppercase">Rata-rata Progres</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{avgProgress}</span>
                  <span className="text-xs text-earth-400">/ 5</span>
                </div>
                <p className="text-xs text-earth-500 mt-2">Momentum pengerjaan</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-sm">
                <p className="text-xs text-earth-500 font-medium uppercase">Total Riwayat</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{activeCheckins.length}</span>
                  <span className="text-xs text-earth-500">hari tercatat</span>
                </div>
                <p className="text-xs text-earth-500 mt-2">
                  Tidur semalam: {latestCheckin?.sleep_quantity || '-'}
                </p>
              </div>
            </div>

            {/* Chart 1: Kelelahan Mental vs Fisik */}
            <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-earth-800">Tren Kelelahan Mental & Fisik</h3>
                  <p className="text-xs text-earth-500">Skala 1 (Sangat Bugar) hingga 10 (Burnout / Sangat Lelah)</p>
                </div>
                <div className="text-xs text-earth-400">
                  {filteredChartData.length} titik data
                </div>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ded0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#73604f' }} />
                    <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} tick={{ fontSize: 12, fill: '#73604f' }} />
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
                      stroke="#745a96"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#745a96' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fatiguePhysical"
                      stroke="#557357"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#557357' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Tren Kecemasan */}
            <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-earth-800">Tren Tingkat Kecemasan</h3>
                  <p className="text-xs text-earth-500">Skor Gabungan (0 = Tenang, 6 = Sangat Cemas/Gelisah)</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anxietyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#aa95c7" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#aa95c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ded0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#73604f' }} />
                    <YAxis domain={[0, 6]} ticks={[0, 2, 4, 6]} tick={{ fontSize: 12, fill: '#73604f' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                      formatter={(val) => [`${val} / 6`, 'Total Skor Kecemasan']}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAnxiety"
                      stroke="#8d75af"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#anxietyGrad)"
                      dot={{ r: 4, fill: '#8d75af' }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Progres & Kejelasan Langkah */}
            <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base text-earth-800">Tren Progres & Arah Skripsi</h3>
                  <p className="text-xs text-earth-500">Skala 1 (Stuck / Bingung) hingga 5 (Kemajuan Signifikan / Sangat Jelas)</p>
                </div>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ded0" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#73604f' }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#73604f' }} />
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
                      stroke="#557357"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#557357' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="progressNextStep"
                      stroke="#9c8065"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#9c8065' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Analisis Pemicu Stres (Bar Chart) */}
            {stressorData.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-earth-800">Frekuensi Pemicu Stres</h3>
                  <p className="text-xs text-earth-500">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ded0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#73604f' }} />
                      <YAxis
                        dataKey="nama"
                        type="category"
                        width={140}
                        tick={{ fontSize: 11, fill: '#5a4b3d' }}
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
                      <Bar dataKey="jumlah" fill="#745a96" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Grid Rincian Badge */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-sand-100">
                  {stressorData.map((item) => (
                    <div
                      key={item.nama}
                      className="p-2.5 rounded-xl border border-sand-200 bg-sand-50/70 flex flex-col justify-between"
                    >
                      <span className="text-xs font-medium text-earth-600 line-clamp-1">{item.nama}</span>
                      <span className="text-sm font-bold text-lavender-700 mt-1">{item.jumlah}x</span>
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
