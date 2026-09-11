'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getOrCreateUser } from '@/lib/user'

function getWeekStart() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date.toISOString().split('T')[0]
}

function getFriendlyReflectionError(error: unknown) {
  if (error && typeof error === 'object') {
    const record = error as { message?: string }
    return `Refleksi belum tersimpan: ${record.message ?? String(error)}`
  }

  return `Refleksi belum tersimpan: ${String(error ?? '')}`
}

export default function ReflectionPage() {
  const [reflection, setReflection] = useState('')
  const [weekStart, setWeekStart] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReflection() {
      const storedUserId = localStorage.getItem('jeda_user_id')
      if (!storedUserId) {
        window.location.href = '/'
        return
      }

      const currentWeek = getWeekStart()
      setWeekStart(currentWeek)
      const { data, error: loadError } = await supabase
        .from('weekly_reflections')
        .select('reflection')
        .eq('user_id', storedUserId)
        .eq('week_start', currentWeek)
        .maybeSingle()

      if (loadError && loadError.code !== 'PGRST116') setError('Refleksi belum dapat dimuat. Pastikan tabel weekly_reflections sudah dibuat di Supabase.')

      if (data) setReflection(data.reflection)
      setLoading(false)
    }

    loadReflection()
  }, [])

  async function saveReflection() {
    const trimmedReflection = reflection.trim()
    if (!trimmedReflection || !weekStart) return

    setSaving(true)
    setError('')

    try {
      const userId = await getOrCreateUser()
      const { error: saveError } = await supabase.from('weekly_reflections').upsert(
        { user_id: userId, week_start: weekStart, reflection: trimmedReflection, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,week_start' },
      )

      if (saveError) throw saveError
    } catch (saveError) {
      setError(getFriendlyReflectionError(saveError))
    } finally {
      setSaving(false)
    }
  }

  return <div className="min-h-screen bg-sand-50 text-earth-900 pb-16">
    <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/95 backdrop-blur"><div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="font-serif text-2xl font-semibold text-earth-800 hover:text-sage-700">Jeda</Link><Link href="/dashboard" className="text-sm font-semibold text-sage-700 hover:text-sage-900">Ke dashboard</Link></div></header>
    <main className="mx-auto max-w-xl px-5 py-10">
      <Link href="/dashboard" className="text-sm font-semibold text-earth-600 hover:text-sage-700">Kembali ke ringkasan</Link>
      <section className="mt-7 border border-sand-200 bg-white px-6 py-8 shadow-sm sm:px-10">
        <p className="text-sm font-semibold text-sage-700">Refleksi mingguan</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight">Apa yang ingin kamu bawa dari minggu ini?</h1>
        <p className="mt-3 text-sm leading-6 text-earth-600">Tidak perlu rapi atau panjang. Tulis satu hal yang terasa penting, sulit, atau patut dihargai.</p>
        {loading ? <p className="mt-8 text-sm text-earth-500">Menyiapkan ruang refleksi...</p> : <>
          <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setError('') }} maxLength={2000} rows={9} placeholder="Contoh: Minggu ini aku menyadari bahwa..." className="mt-8 w-full resize-y border border-sand-300 bg-sand-50 p-4 text-sm leading-6 text-earth-800 outline-none placeholder:text-earth-400 focus:border-sage-500" />
          <div className="mt-2 flex items-center justify-between text-xs text-earth-500"><span>{reflection.length}/2000 karakter</span></div>
          {error && <p className="mt-4 border-l-4 border-lavender-400 bg-lavender-50 px-4 py-3 text-sm leading-6 text-lavender-900">{error}</p>}
          <button onClick={saveReflection} disabled={saving || !reflection.trim()} className="mt-7 w-full bg-sage-700 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan refleksi...' : 'Simpan refleksi minggu ini'}</button>
        </>}
      </section>
    </main>
  </div>
}
