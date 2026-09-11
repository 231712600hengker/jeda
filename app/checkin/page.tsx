'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getOrCreateUser } from '@/lib/user'

const STRESSOR_OPTIONS = [
  { value: 'teknis', label: 'Beban Teknis/Kognitif' },
  { value: 'bimbingan', label: 'Bimbingan & Birokrasi' },
  { value: 'manajemen_waktu', label: 'Manajemen Waktu' },
  { value: 'infrastruktur', label: 'Infrastruktur & Lingkungan' },
  { value: 'personal', label: 'Personal' },
]

export default function CheckinPage() {
  const [checkinDate, setCheckinDate] = useState(() => new Date().toISOString().split('T')[0])
  const [anxiety1, setAnxiety1] = useState(0)
  const [anxiety2, setAnxiety2] = useState(0)
  const [fatigueMental, setFatigueMental] = useState(5)
  const [fatiguePhysical, setFatiguePhysical] = useState(5)
  const [sleepQuantity, setSleepQuantity] = useState('6-8 Jam')
  const [sleepQuality, setSleepQuality] = useState('Cukup')
  const [progress1, setProgress1] = useState(3)
  const [progress2, setProgress2] = useState(3)
  const [stressors, setStressors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{ triggered: boolean; reasons: string[] }>({
    triggered: false,
    reasons: [],
  })

  function toggleStressor(value: string) {
    setStressors((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  function handleReset() {
    setAnxiety1(0)
    setAnxiety2(0)
    setFatigueMental(5)
    setFatiguePhysical(5)
    setSleepQuantity('6-8 Jam')
    setSleepQuality('Cukup')
    setProgress1(3)
    setProgress2(3)
    setStressors([])
    setAlertInfo({ triggered: false, reasons: [] })
    setDone(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const userId = await getOrCreateUser()

      const { data: checkin, error } = await supabase
        .from('checkins')
        .insert({
          user_id: userId,
          checkin_date: checkinDate,
          anxiety_1: anxiety1,
          anxiety_2: anxiety2,
          fatigue_mental: fatigueMental,
          fatigue_physical: fatiguePhysical,
          sleep_quantity: sleepQuantity,
          sleep_quality: sleepQuality,
          progress_1: progress1,
          progress_2: progress2,
        })
        .select()
        .single()

      if (error || !checkin) throw new Error(error?.message)

      if (stressors.length > 0) {
        await supabase.from('checkin_stressors').insert(
          stressors.map((category) => ({
            checkin_id: checkin.id,
            category,
          }))
        )
      }

      // Logika Evaluasi Sistem Peringatan (Alerts)
      const anxietyScore = anxiety1 + anxiety2
      const fatigueAvg = (fatigueMental + fatiguePhysical) / 2
      const isAnxietyAlert = anxietyScore >= 5
      const isFatigueAlert = fatigueAvg >= 8

      const reasons: string[] = []
      if (isAnxietyAlert) reasons.push(`Kecemasan akut: skor ${anxietyScore}/6`)
      if (isFatigueAlert) reasons.push(`Kelelahan akut: rata-rata ${fatigueAvg}/10`)

      if (isAnxietyAlert || isFatigueAlert) {
        await supabase.from('alerts').insert({
          user_id: userId,
          alert_type: 'akut',
          trigger_detail: {
            reason: reasons.join(', '),
            reasons,
            anxiety_score: anxietyScore,
            fatigue_avg: fatigueAvg,
            checkin_id: checkin.id,
          },
        })
        setAlertInfo({ triggered: true, reasons })
      } else {
        setAlertInfo({ triggered: false, reasons: [] })
      }

      setDone(true)
    } catch (err) {
      alert('Terjadi kesalahan: ' + (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-neutral-800 hover:text-blue-600 transition">
            Jeda 🍃
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition flex items-center gap-1"
          >
            📊 Lihat Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6">
        {done ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-sm space-y-5 my-8">
            <div className="text-4xl">{alertInfo.triggered ? '⚠️' : '✨'}</div>
            <h2 className="text-xl font-bold text-neutral-800">
              {alertInfo.triggered ? 'Check-in Disimpan (Perhatian Khusus)' : 'Check-in Berhasil Disimpan!'}
            </h2>
            <p className="text-neutral-500 text-sm">
              Terima kasih telah meluangkan waktu sejenak untuk mendengarkan diri sendiri hari ini.
            </p>

            {alertInfo.triggered && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2 text-amber-900">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <span>🚨</span>
                  <span>Ambang Batas Kritis Terdeteksi ({alertInfo.reasons.join(', ')})</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Tingkat ketegangan atau kelelahanmu sedang cukup tinggi. Skripsi adalah proses panjang — jangan ragu
                  untuk mengambil jeda sejenak, menjauh dari layar, atau tidur lebih awal hari ini. Log peringatan telah dicatat ke sistem.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
              >
                Lihat Grafik di Dashboard →
              </Link>
              <button
                onClick={handleReset}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-5 py-2.5 rounded-xl text-sm transition"
              >
                Isi Check-in Lainnya
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check-in Harian</h1>
              <p className="text-sm text-neutral-500 mt-1">
                Refleksi singkat 2 menit untuk melacak kesehatan mental dan fisik selama mengerjakan skripsi.
              </p>
            </div>

            {/* Tanggal Check-in */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Check-in</label>
              <input
                type="date"
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
                className="border border-neutral-300 rounded-lg p-2.5 w-full text-sm bg-neutral-50/50"
              />
            </div>

            {/* Kecemasan 1 */}
            <div className="border-t border-neutral-100 pt-4">
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                1. Seberapa sering merasa cemas/tegang terkait skripsi (24 jam terakhir)?
              </label>
              <select
                value={anxiety1}
                onChange={(e) => setAnxiety1(Number(e.target.value))}
                className="border border-neutral-300 rounded-lg p-2.5 w-full text-sm bg-white"
              >
                <option value={0}>Tidak pernah (0)</option>
                <option value={1}>Beberapa hari (1)</option>
                <option value={2}>Lebih dari separuh hari (2)</option>
                <option value={3}>Hampir setiap hari (3)</option>
              </select>
            </div>

            {/* Kecemasan 2 */}
            <div className="border-t border-neutral-100 pt-4">
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                2. Seberapa sering merasa tidak mampu mengendalikan kekhawatiran?
              </label>
              <select
                value={anxiety2}
                onChange={(e) => setAnxiety2(Number(e.target.value))}
                className="border border-neutral-300 rounded-lg p-2.5 w-full text-sm bg-white"
              >
                <option value={0}>Tidak pernah (0)</option>
                <option value={1}>Beberapa hari (1)</option>
                <option value={2}>Lebih dari separuh hari (2)</option>
                <option value={3}>Hampir setiap hari (3)</option>
              </select>
            </div>

            {/* Kelelahan Mental */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-neutral-800">
                  3. Kelelahan Mental (1=segar, 10=burnout)
                </label>
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {fatigueMental} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fatigueMental}
                onChange={(e) => setFatigueMental(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>1 - Sangat Segar</span>
                <span>5 - Cukup Lelah</span>
                <span>10 - Sangat Burnout</span>
              </div>
            </div>

            {/* Kelelahan Fisik */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-neutral-800">
                  4. Kelelahan Fisik (1=bugar, 10=sangat lelah)
                </label>
                <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {fatiguePhysical} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fatiguePhysical}
                onChange={(e) => setFatiguePhysical(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>1 - Bugar</span>
                <span>5 - Agak Lelah</span>
                <span>10 - Sangat Lelah</span>
              </div>
            </div>

            {/* Durasi & Kualitas Tidur */}
            <div className="border-t border-neutral-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  5. Durasi tidur semalam
                </label>
                <select
                  value={sleepQuantity}
                  onChange={(e) => setSleepQuantity(e.target.value)}
                  className="border border-neutral-300 rounded-lg p-2.5 w-full text-sm bg-white"
                >
                  <option>{'< 4 Jam'}</option>
                  <option>4-6 Jam</option>
                  <option>6-8 Jam</option>
                  <option>{'> 8 Jam'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  6. Kualitas tidur
                </label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="border border-neutral-300 rounded-lg p-2.5 w-full text-sm bg-white"
                >
                  <option>Sering terbangun/Gelisah</option>
                  <option>Cukup</option>
                  <option>Sangat Nyenyak</option>
                </select>
              </div>
            </div>

            {/* Progres 1 */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-neutral-800">
                  7. Hari ini merasa membuat kemajuan berarti (1-5)
                </label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {progress1} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={progress1}
                onChange={(e) => setProgress1(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Progres 2 */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-neutral-800">
                  8. Saya tahu langkah berikutnya yang harus dikerjakan (1-5)
                </label>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {progress2} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={progress2}
                onChange={(e) => setProgress2(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Stressor Checkboxes */}
            <div className="border-t border-neutral-100 pt-4">
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                9. Sumber stres hari ini (boleh pilih lebih dari satu)
              </label>
              <div className="space-y-2">
                {STRESSOR_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition cursor-pointer text-sm ${
                      stressors.includes(opt.value)
                        ? 'bg-blue-50/60 border-blue-300 text-blue-950 font-medium'
                        : 'bg-neutral-50/50 border-neutral-200 text-neutral-700 hover:bg-neutral-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={stressors.includes(opt.value)}
                      onChange={() => toggleStressor(opt.value)}
                      className="rounded accent-blue-600 w-4 h-4"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl w-full shadow-sm transition disabled:opacity-50 text-sm mt-4"
            >
              {submitting ? 'Menyimpan Check-in...' : 'Simpan Check-in'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}