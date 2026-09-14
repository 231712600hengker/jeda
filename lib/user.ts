export function getAnonymousCode(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('jeda_anon_code') ?? ''
}

export function saveAnonymousCode(anonymousCode: string) {
  localStorage.setItem('jeda_anon_code', anonymousCode)
  // Key lama dipertahankan untuk UX/routing saja; bukan bukti otorisasi.
  localStorage.setItem('jeda_user_id', 'anonymous-session')
}
