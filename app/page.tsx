'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brand } from '@/app/components/brand'
import { saveAnonymousCode } from '@/lib/user'

const CONSENT_KEY = 'jeda_consent_given'

function Icon({ children }: { children: string }) { return <span className="material-symbols-outlined" aria-hidden="true">{children}</span> }

export default function LandingPage() {
  const router = useRouter()
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'new' | 'existing'>('new')
  const [hasStoredSession, setHasStoredSession] = useState(false)

  useEffect(() => {
    setHasStoredSession(Boolean(localStorage.getItem('jeda_anon_code')))
  }, [])

  async function createAnonymousUser() {
    setLoading(true); setErrorMsg('')
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      saveAnonymousCode(data.anonymousCode); setNewCode(data.anonymousCode)
    } catch { setErrorMsg('Kode belum dapat dibuat. Coba lagi sebentar.') } finally { setLoading(false) }
  }

  async function handleCopyCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(newCode)
      } else {
        // Fallback untuk browser/konteks lama yang tidak punya Clipboard API
        const textarea = document.createElement('textarea')
        textarea.value = newCode
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function handleStartClick() { localStorage.getItem(CONSENT_KEY) ? createAnonymousUser() : setShowConsent(true) }
  function handleConfirmConsent() { localStorage.setItem(CONSENT_KEY, new Date().toISOString()); setShowConsent(false); createAnonymousUser() }

  async function loginExistingCode() {
    if (!inputCode.trim()) return
    setLoading(true); setErrorMsg('')
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', anonymousCode: inputCode }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      saveAnonymousCode(data.anonymousCode); router.push('/dashboard')
    } catch { setErrorMsg('Kode tidak ditemukan. Periksa kembali kode yang disimpan.') } finally { setLoading(false) }
  }

  if (newCode) return <main className="flex min-h-[calc(100vh-10rem)] flex-1 items-center justify-center overflow-hidden bg-sand-50 p-5"><section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-ambient sm:p-10"><Brand /><p className="mt-8 text-xs font-semibold uppercase tracking-[.16em] text-sage-700">Kunci rahasiamu siap</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-earth-900">Simpan kunci ini di tempat yang aman.</h1><p className="mt-3 leading-7 text-earth-600">Kunci ini diperlukan untuk membuka ruang refleksimu di perangkat lain.</p><div className="mt-7 rounded-2xl bg-sand-100 px-5 py-5 text-center font-mono text-xl font-bold tracking-wider text-sage-800 sm:text-2xl">{newCode}</div><button onClick={handleCopyCode} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-sage-50 py-3 text-sm font-semibold text-sage-800"><Icon>{copied ? 'check' : 'content_copy'}</Icon>{copied ? 'Tersalin!' : 'Salin kunci'}</button><button onClick={() => router.push('/checkin')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 py-3.5 font-semibold text-white shadow-ambient transition hover:bg-sage-700">Mulai check-in pertama<Icon>arrow_forward</Icon></button></section></main>

  return <main className="relative flex-1 overflow-hidden bg-sand-50"><div className="pointer-events-none absolute -top-32 left-1/2 -z-0 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-sage-200/40 blur-3xl" /><header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5"><Brand compact />{hasStoredSession && <button onClick={() => router.push('/dashboard')} className="rounded-full bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-800">Lanjutkan ruangku</button>}</header><div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 lg:grid-cols-12 lg:items-center lg:pt-16"><section className="lg:col-span-7"><span className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold uppercase tracking-[.13em] text-sage-700"><span className="h-2 w-2 rounded-full bg-sage-600" />Ruang teduh tanpa penghakiman</span><p className="mt-9 text-sm font-semibold uppercase tracking-[.18em] text-lavender-500">Perjalanan kembali ke diri</p><h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-earth-900 sm:text-5xl">Beri dirimu ruang untuk <span className="text-sage-600">bernapas</span> dan merasa.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-earth-600">Jeda adalah ruang anonim untuk mencatat stres, energi, tidur, dan progres skripsimu—pelan-pelan, tanpa tuntutan.</p><div className="mt-9 flex gap-4 rounded-3xl bg-sand-100 p-5"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage-200 text-sage-700"><Icon>air</Icon></div><div><p className="font-semibold text-earth-800">Tarik napas pelan-pelan.</p><p className="mt-1 text-sm leading-6 text-earth-600">Tak semua harus selesai hari ini. Satu check-in kecil sudah cukup.</p></div></div></section><section className="lg:col-span-5"><div className="rounded-3xl bg-white p-6 shadow-ambient sm:p-8"><div className="grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1"><button onClick={() => setTab('new')} className={`rounded-full px-3 py-2.5 text-sm font-semibold transition ${tab === 'new' ? 'bg-white text-sage-700 shadow-sm' : 'text-earth-600'}`}>Kode baru</button><button onClick={() => setTab('existing')} className={`rounded-full px-3 py-2.5 text-sm font-semibold transition ${tab === 'existing' ? 'bg-white text-sage-700 shadow-sm' : 'text-earth-600'}`}>Masuk dengan kode</button></div>{tab === 'new' ? <div className="mt-7"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-earth-900">Kunci ketenanganmu</h2><p className="mt-1 text-sm leading-6 text-earth-600">Buat identitas tanpa nama, surel, atau kata sandi.</p></div><span className="rounded-full bg-sage-200 p-3 text-sage-800"><Icon>vpn_key</Icon></span></div><div className="mt-6 rounded-2xl bg-sand-100 p-4 text-sm leading-6 text-earth-600"><div className="flex items-center gap-2 font-semibold text-sage-800"><Icon>lock</Icon>Kunci hanya diketahui olehmu</div><p className="mt-2">Simpan kunci yang dibuat agar kamu dapat kembali ke catatanmu.</p></div><button onClick={handleStartClick} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 py-3.5 font-semibold text-white shadow-ambient transition hover:bg-sage-700 disabled:opacity-50">{loading ? 'Menyiapkan kunci...' : 'Buat kunci anonim'}<Icon>arrow_forward</Icon></button></div> : <div className="mt-7"><h2 className="text-xl font-semibold text-earth-900">Selamat datang kembali</h2><p className="mt-1 text-sm leading-6 text-earth-600">Masukkan kunci yang pernah kamu simpan.</p><label className="mt-6 block text-xs font-semibold uppercase tracking-[.13em] text-earth-600">Kunci akses</label><div className="relative mt-2"><Icon>key</Icon><input value={inputCode} onChange={(event) => setInputCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && loginExistingCode()} placeholder="JEDA-xxxx-xxxx" className="w-full rounded-2xl bg-sand-100 px-4 py-3.5 pl-11 font-mono uppercase text-earth-800 outline-none ring-sage-400 focus:ring-2" /></div>{errorMsg && <p className="mt-3 text-sm text-red-700">{errorMsg}</p>}<button onClick={loginExistingCode} disabled={loading || !inputCode.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 py-3.5 font-semibold text-white shadow-ambient disabled:opacity-50">{loading ? 'Membuka...' : 'Buka ruangku'}<Icon>lock_open</Icon></button></div>}<div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-earth-600"><span>✓ Tanpa email</span><span>✓ Tanpa kata sandi</span><span>✓ Tanpa iklan</span></div></div></section></div>{showConsent && <Consent checked={consentChecked} setChecked={setConsentChecked} onClose={() => setShowConsent(false)} onConfirm={handleConfirmConsent} loading={loading} />}</main>
}

function Consent({ checked, setChecked, onClose, onConfirm, loading }: { checked: boolean; setChecked: (checked: boolean) => void; onClose: () => void; onConfirm: () => void; loading: boolean }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-earth-900/30 p-5 backdrop-blur-sm"><section className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"><h2 className="text-2xl font-semibold text-earth-900">Persetujuan partisipasi</h2><p className="mt-3 text-sm leading-7 text-earth-600">Jeda membantu kamu mencatat kondisi harian secara anonim. Ini bukan layanan diagnosis atau darurat; hubungi orang tepercaya atau layanan profesional bila kamu merasa tidak aman.</p><label className="mt-6 flex gap-3 rounded-2xl bg-sand-100 p-4 text-sm leading-6 text-earth-700"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1 accent-sage-700" /><span>Saya memahami dan bersedia berpartisipasi secara sukarela.</span></label><div className="mt-6 flex gap-3"><button onClick={onClose} className="flex-1 rounded-full bg-sand-100 py-3 font-semibold text-earth-700">Batal</button><button onClick={onConfirm} disabled={!checked || loading} className="flex-1 rounded-full bg-sage-600 py-3 font-semibold text-white disabled:opacity-50">Saya setuju</button></div></section></div> }