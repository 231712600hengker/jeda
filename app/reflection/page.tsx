'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brand } from '@/app/components/brand'
import { useRouter } from 'next/navigation'
import { getAnonymousCode } from '@/lib/user'

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
  const router = useRouter()
  const [reflection, setReflection] = useState('')
  const [weekStart, setWeekStart] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    async function loadReflection() {
      const anonymousCode = getAnonymousCode()
      if (!anonymousCode) {
        router.push('/')
        return
      }

      const currentWeek = getWeekStart()
      setWeekStart(currentWeek)
      const response = await fetch('/api/reflection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymousCode, weekStart: currentWeek }) })
      const data = await response.json()
      if (!response.ok) setError(data.error ?? 'Refleksi belum dapat dimuat.')
      else setReflection(data.reflection)
      setLoading(false)
    }

    loadReflection()
  }, [router])

  async function saveReflection() {
    const trimmedReflection = reflection.trim()
    if (!trimmedReflection || !weekStart) return

    setSaving(true)
    setError('')
    setSavedMessage('')

    try {
      const response = await fetch('/api/reflection', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymousCode: getAnonymousCode(), weekStart, reflection: trimmedReflection }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setReflection(trimmedReflection)
      setSavedMessage('Refleksi minggu ini sudah tersimpan.')
    } catch (saveError) {
      setError(getFriendlyReflectionError(saveError))
    } finally {
      setSaving(false)
    }
  }

  return <div className="flex-1 bg-sand-50 text-earth-900 pb-16">
    <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/95 backdrop-blur"><div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4"><Brand href="/dashboard" compact /><Link href="/dashboard" className="text-sm font-semibold text-sage-700 hover:text-sage-900">Ke dashboard</Link></div></header>
    <main className="mx-auto max-w-xl px-5 py-10">
      <Link href="/dashboard" className="text-sm font-semibold text-earth-600 hover:text-sage-700">Kembali ke ringkasan</Link>
      <section className="mt-7 rounded-3xl border border-sand-200 bg-white px-6 py-8 shadow-ambient sm:px-10">
        <p className="text-sm font-semibold text-sage-700">Refleksi mingguan</p>
        <h1 className="mt-2 text-3xl leading-tight">Apa yang ingin kamu bawa dari minggu ini?</h1>
        <p className="mt-3 text-sm leading-6 text-earth-600">Tidak perlu rapi atau panjang. Tulis satu hal yang terasa penting, sulit, atau patut dihargai.</p>
        {loading ? <p className="mt-8 text-sm text-earth-500">Menyiapkan ruang refleksi...</p> : <>
          <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setError(''); setSavedMessage('') }} maxLength={2000} rows={9} placeholder="Contoh: Minggu ini aku menyadari bahwa..." className="mt-8 w-full resize-y border border-sand-300 bg-sand-50 p-4 text-sm leading-6 text-earth-800 outline-none placeholder:text-earth-400 focus:border-sage-500" />
          <div className="mt-2 flex items-center justify-between text-xs text-earth-500"><span>{reflection.length}/2000 karakter</span></div>
          {error && <p className="mt-4 border-l-4 border-lavender-400 bg-lavender-50 px-4 py-3 text-sm leading-6 text-lavender-900">{error}</p>}
          {savedMessage && <p className="mt-4 border-l-4 border-sage-400 bg-sage-50 px-4 py-3 text-sm leading-6 text-sage-900">{savedMessage}</p>}
          <button onClick={saveReflection} disabled={saving || !reflection.trim()} className="mt-7 w-full bg-sage-700 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan refleksi...' : 'Simpan refleksi minggu ini'}</button>
        </>}
      </section>
    </main>
  </div>
}
