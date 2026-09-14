import Link from 'next/link'

export function Brand({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return <Link href={href} className="inline-flex items-center" aria-label="Jeda, kembali ke beranda">
    <img src="/logo.svg" alt="Jeda" className={compact ? 'h-9 w-auto' : 'h-11 w-auto'} />
  </Link>
}
