import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-sand-50 text-earth-600">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-8 text-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Link href="/" className="text-2xl font-semibold text-earth-800 transition hover:text-sage-700">
            Jeda
          </Link>
          <p className="mt-2 leading-6">
            Ruang anonim untuk mencatat stres, energi, tidur, dan progres skripsi tanpa menghakimi diri sendiri.
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:text-right">
          <Link href="/checkin" className="font-semibold text-sage-700 transition hover:text-sage-900">
            Isi jurnal
          </Link>
          <Link href="/reflection" className="font-semibold text-sage-700 transition hover:text-sage-900">
            Refleksi mingguan
          </Link>
          <Link href="/dashboard" className="font-semibold text-sage-700 transition hover:text-sage-900">
            Dashboard
          </Link>
        </div>
      </div>
      <div className="border-t border-sand-200 px-5 py-4">
        <p className="mx-auto max-w-5xl text-xs leading-5 text-earth-500">
          Jeda adalah alat refleksi mandiri, bukan layanan diagnosis atau darurat. Jika kamu merasa tidak aman, hubungi orang tepercaya atau layanan profesional di sekitarmu.
        </p>
      </div>
    </footer>
  )
}
