'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getOrCreateUser } from '@/lib/user'

const STRESSOR_OPTIONS = [
  { value: 'teknis', label: 'Beban teknis atau kognitif' },
  { value: 'bimbingan', label: 'Bimbingan atau birokrasi' },
  { value: 'manajemen_waktu', label: 'Manajemen waktu' },
  { value: 'infrastruktur', label: 'Lingkungan atau fasilitas' },
  { value: 'personal', label: 'Hal personal di luar skripsi' },
]

type Intervention = { title: string; description: string; steps: string[] }
type AlertInfo = { triggered: boolean; reasons: string[]; intervention: Intervention | null }

function areConsecutiveDates(checkins: { checkin_date: string }[]) {
  return checkins.every((checkin, index) => {
    if (index === checkins.length - 1) return true
    const current = new Date(`${checkin.checkin_date}T00:00:00`)
    const previous = new Date(`${checkins[index + 1].checkin_date}T00:00:00`)
    return Math.round((current.getTime() - previous.getTime()) / 86_400_000) === 1
  })
}

async function checkChronicAlert(userId: string): Promise<string | null> {
  const WINDOW_DAYS = 5
  const { data: recent, error } = await supabase
    .from('checkins')
    .select('checkin_date, progress_1, progress_2, fatigue_mental, fatigue_physical')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(WINDOW_DAYS)

  if (error || !recent || recent.length < WINDOW_DAYS || !areConsecutiveDates(recent)) return null
  const avgProgress = recent.reduce((sum, item) => sum + (item.progress_1 + item.progress_2) / 2, 0) / recent.length
  const avgFatigue = recent.reduce((sum, item) => sum + (item.fatigue_mental + item.fatigue_physical) / 2, 0) / recent.length
  if (avgProgress > 2 || avgFatigue < 6) return null

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const { data: existingAlerts } = await supabase.from('alerts').select('id').eq('user_id', userId).eq('alert_type', 'kronis').eq('acknowledged', false).gte('triggered_at', threeDaysAgo.toISOString())
  if (existingAlerts?.length) return null

  const reason = `Pola stagnasi ${WINDOW_DAYS} hari: progres rata-rata ${avgProgress.toFixed(1)}/5 dan kelelahan ${avgFatigue.toFixed(1)}/10`
  await supabase.from('alerts').insert({ user_id: userId, alert_type: 'kronis', trigger_detail: { reason, reasons: [reason], avg_progress: avgProgress, avg_fatigue: avgFatigue, window_days: WINDOW_DAYS } })
  return reason
}

function getIntervention(isAnxietyAlert: boolean, isFatigueAlert: boolean, chronicReason: string | null, stressors: string[], sleepQuantity: string): Intervention {
  if (chronicReason) return { title: 'Kecilkan langkah berikutnya', description: 'Pola beberapa hari terakhir terlihat berat. Ini bukan penilaian atas kemampuanmu, hanya tanda untuk membuat tugas terasa lebih mungkin dikerjakan.', steps: ['Pilih satu tugas yang selesai dalam 15 menit.', 'Tulis satu pertanyaan spesifik untuk pembimbing atau teman.', 'Tutup pekerjaan setelah satu langkah kecil itu selesai.'] }
  if (isAnxietyAlert || isFatigueAlert) return { title: 'Beri ruang untuk pulih hari ini', description: 'Keteganganmu sedang tinggi. Jeda singkat dapat membantu tubuh dan pikiran kembali punya ruang.', steps: ['Jauh dari layar selama 10 menit.', 'Minum air dan ubah posisi tubuh.', 'Tentukan waktu berhenti yang realistis untuk malam ini.'] }
  if (sleepQuantity === '< 4 Jam' || sleepQuantity === '4-6 Jam') return { title: 'Prioritaskan energi dulu', description: 'Tidur yang kurang sering membuat tugas terasa lebih berat dari ukurannya. Hari ini, pilih target yang lebih ringan dan cukup.', steps: ['Pilih pekerjaan administrasi atau membaca singkat.', 'Tunda keputusan besar bila memungkinkan.', 'Siapkan satu kebiasaan kecil untuk tidur lebih awal.'] }
  if (stressors.includes('bimbingan')) return { title: 'Buat bimbingan lebih terarah', description: 'Ketidakjelasan sering terasa melelahkan. Membawa pertanyaan yang sempit bisa membuat percakapan berikutnya lebih ringan.', steps: ['Tulis satu hal yang sudah dicoba.', 'Rumuskan satu pertanyaan yang bisa dijawab.', 'Simpan catatan singkat tentang langkah setelah bimbingan.'] }
  return { title: 'Pertahankan ritme yang cukup', description: 'Kamu sudah menyempatkan diri untuk memperhatikan kondisi hari ini. Tidak semua hari harus terasa produktif untuk tetap berarti.', steps: ['Pilih satu prioritas kecil untuk besok.', 'Sisakan waktu tanpa skripsi malam ini.'] }
}

export default function CheckinPage() {
  useEffect(() => { if (!localStorage.getItem('jeda_user_id')) window.location.href = '/' }, [])
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
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({ triggered: false, reasons: [], intervention: null })

  function toggleStressor(value: string) { setStressors((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]) }
  function handleReset() {
    setAnxiety1(0); setAnxiety2(0); setFatigueMental(5); setFatiguePhysical(5); setSleepQuantity('6-8 Jam'); setSleepQuality('Cukup'); setProgress1(3); setProgress2(3); setStressors([]); setAlertInfo({ triggered: false, reasons: [], intervention: null }); setDone(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const userId = await getOrCreateUser()
      const { data: checkin, error } = await supabase.from('checkins').insert({ user_id: userId, checkin_date: checkinDate, anxiety_1: anxiety1, anxiety_2: anxiety2, fatigue_mental: fatigueMental, fatigue_physical: fatiguePhysical, sleep_quantity: sleepQuantity, sleep_quality: sleepQuality, progress_1: progress1, progress_2: progress2 }).select().single()
      if (error || !checkin) throw new Error(error?.message)
      if (stressors.length) {
        const { error: stressorError } = await supabase.from('checkin_stressors').insert(stressors.map((category) => ({ checkin_id: checkin.id, category })))
        if (stressorError) throw stressorError
      }
      const anxietyScore = anxiety1 + anxiety2
      const fatigueAverage = (fatigueMental + fatiguePhysical) / 2
      const isAnxietyAlert = anxietyScore >= 5
      const isFatigueAlert = fatigueAverage >= 8
      const reasons = [...(isAnxietyAlert ? [`Kecemasan tinggi: skor ${anxietyScore}/6`] : []), ...(isFatigueAlert ? [`Kelelahan tinggi: rata-rata ${fatigueAverage}/10`] : [])]
      if (reasons.length) {
        const { error: alertError } = await supabase.from('alerts').insert({ user_id: userId, alert_type: 'akut', trigger_detail: { reason: reasons.join(', '), reasons, anxiety_score: anxietyScore, fatigue_avg: fatigueAverage, checkin_id: checkin.id } })
        if (alertError) throw alertError
      }
      const chronicReason = await checkChronicAlert(userId)
      if (chronicReason) reasons.push(chronicReason)
      setAlertInfo({ triggered: reasons.length > 0, reasons, intervention: getIntervention(isAnxietyAlert, isFatigueAlert, chronicReason, stressors, sleepQuantity) })
      setDone(true)
    } catch (error) { alert(`Terjadi kendala saat menyimpan: ${(error as Error).message}`) } finally { setSubmitting(false) }
  }

  return <div className="min-h-screen bg-sand-50 text-earth-900 pb-16">
    <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/95 backdrop-blur"><div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="font-serif text-2xl font-semibold text-earth-800 transition hover:text-sage-700">Jeda</Link><Link href="/dashboard" className="text-sm font-semibold text-sage-700 transition hover:text-sage-900">Ke dashboard</Link></div></header>
    <main className="mx-auto max-w-xl px-5 py-10">
      {!done && <Link href="/dashboard" className="mb-7 inline-block text-sm font-semibold text-earth-600 transition hover:text-sage-700">Kembali ke ringkasan</Link>}
      {done ? <section className="border border-sand-200 bg-white px-6 py-9 shadow-sm sm:px-10">
        <p className="text-sm font-semibold text-sage-700">Check-in tersimpan</p><h1 className="mt-2 font-serif text-3xl leading-tight text-earth-900">Terima kasih sudah memberi ruang untuk diri sendiri.</h1><p className="mt-4 text-sm leading-6 text-earth-600">Catatan ini hanya untuk membantumu melihat pola, bukan menilai seberapa baik kamu menjalani hari.</p>
        {alertInfo.triggered && <div className="mt-7 border-l-4 border-lavender-400 bg-lavender-50 px-5 py-4"><p className="text-sm font-semibold text-lavender-800">Ada pola yang perlu diperhatikan</p><p className="mt-1 text-sm leading-6 text-lavender-800">{alertInfo.reasons.join('. ')}.</p></div>}
        {alertInfo.intervention && <div className="mt-6 border-t border-sand-200 pt-6"><p className="text-sm font-semibold text-sage-700">Untuk sekarang</p><h2 className="mt-1 font-serif text-2xl text-earth-800">{alertInfo.intervention.title}</h2><p className="mt-2 text-sm leading-6 text-earth-600">{alertInfo.intervention.description}</p><ol className="mt-4 space-y-2 text-sm leading-6 text-earth-700">{alertInfo.intervention.steps.map((step, index) => <li key={step}><span className="mr-2 font-semibold text-sage-700">{index + 1}.</span>{step}</li>)}</ol></div>}
        <p className="mt-8 text-xs leading-5 text-earth-500">Jeda bukan layanan diagnosis atau darurat. Saat kamu merasa tidak aman atau butuh bantuan segera, hubungi orang tepercaya atau layanan profesional di sekitarmu.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard" className="bg-sage-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-sage-800">Lihat pola saya</Link><button onClick={handleReset} className="border border-sand-300 px-5 py-3 text-sm font-semibold text-earth-700 transition hover:bg-sand-100">Catat check-in lain</button></div>
      </section> : <section className="border border-sand-200 bg-white px-6 py-8 shadow-sm sm:px-10">
        <p className="text-sm font-semibold text-sage-700">Kurang dari dua menit</p><h1 className="mt-2 font-serif text-3xl text-earth-900">Bagaimana harimu sejauh ini?</h1><p className="mt-3 text-sm leading-6 text-earth-600">Jawab seperlunya. Tidak ada jawaban yang perlu dibuat terlihat baik.</p>
        <div className="mt-8 space-y-9">
          <div className="border-t border-sand-200 pt-6"><p className="text-sm font-semibold text-earth-800">Hari ini</p><label className="mt-3 block text-sm text-earth-600" htmlFor="checkin-date">Tanggal check-in</label><input id="checkin-date" type="date" value={checkinDate} onChange={(event) => setCheckinDate(event.target.value)} className="mt-1.5 w-full border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-earth-800 outline-none focus:border-sage-500" /></div>
          <div className="border-t border-sand-200 pt-6 space-y-5"><div><p className="text-sm font-semibold text-earth-800">Pikiran</p><p className="mt-1 text-sm text-earth-600">Dalam 24 jam terakhir:</p></div><NumberSelect label="Seberapa sering kamu merasa cemas atau tegang tentang skripsi?" value={anxiety1} onChange={setAnxiety1} /><NumberSelect label="Seberapa sering kekhawatiran terasa sulit dikendalikan?" value={anxiety2} onChange={setAnxiety2} /></div>
          <div className="border-t border-sand-200 pt-6 space-y-6"><p className="text-sm font-semibold text-earth-800">Tubuh dan energi</p><RangeField label="Kelelahan mental" value={fatigueMental} onChange={setFatigueMental} low="Segar" high="Sangat lelah" max={10} /><RangeField label="Kelelahan fisik" value={fatiguePhysical} onChange={setFatiguePhysical} low="Bugar" high="Sangat lelah" max={10} /><div className="grid gap-5 sm:grid-cols-2"><TextSelect label="Durasi tidur semalam" value={sleepQuantity} onChange={setSleepQuantity} options={['< 4 Jam', '4-6 Jam', '6-8 Jam', '> 8 Jam']} /><TextSelect label="Kualitas tidur" value={sleepQuality} onChange={setSleepQuality} options={['Sering terbangun atau gelisah', 'Cukup', 'Sangat nyenyak']} /></div></div>
          <div className="border-t border-sand-200 pt-6 space-y-6"><p className="text-sm font-semibold text-earth-800">Skripsi hari ini</p><RangeField label="Aku merasa membuat kemajuan yang berarti" value={progress1} onChange={setProgress1} low="Belum terasa" high="Sangat terasa" max={5} /><RangeField label="Aku tahu langkah berikutnya yang perlu dikerjakan" value={progress2} onChange={setProgress2} low="Belum jelas" high="Sangat jelas" max={5} /><div><p className="text-sm font-medium text-earth-700">Apa yang paling membebani hari ini?</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{STRESSOR_OPTIONS.map((option) => <label key={option.value} className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm transition ${stressors.includes(option.value) ? 'border-sage-400 bg-sage-50 text-sage-900' : 'border-sand-200 text-earth-700 hover:bg-sand-50'}`}><input type="checkbox" checked={stressors.includes(option.value)} onChange={() => toggleStressor(option.value)} className="h-4 w-4 accent-sage-700" />{option.label}</label>)}</div></div></div>
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="mt-9 w-full bg-sage-700 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Menyimpan catatan...' : 'Simpan catatan hari ini'}</button>
      </section>}
    </main>
  </div>
}

function NumberSelect({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block text-sm font-medium text-earth-700">{label}<select value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full border border-sand-300 bg-white px-3 py-2.5 text-sm font-normal text-earth-800 outline-none focus:border-sage-500"><option value={0}>Tidak pernah</option><option value={1}>Beberapa hari</option><option value={2}>Lebih dari separuh hari</option><option value={3}>Hampir setiap hari</option></select></label>
}

function TextSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block text-sm font-medium text-earth-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-sand-300 bg-white px-3 py-2.5 text-sm font-normal text-earth-800 outline-none focus:border-sage-500">{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function RangeField({ label, value, onChange, low, high, max }: { label: string; value: number; onChange: (value: number) => void; low: string; high: string; max: number }) {
  return <div><div className="flex items-end justify-between gap-4"><label className="text-sm font-medium text-earth-700">{label}</label><output className="text-sm font-semibold text-sage-700">{value}/{max}</output></div><input type="range" min={1} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full cursor-pointer accent-sage-700" /><div className="mt-1 flex justify-between text-xs text-earth-500"><span>{low}</span><span>{high}</span></div></div>
}
