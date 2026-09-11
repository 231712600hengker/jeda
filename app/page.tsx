import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍃</span>
            <span className="text-xl font-bold tracking-tight text-neutral-900">Jeda</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-neutral-600 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/checkin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
            >
              Check-in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center my-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
          <span>🌱</span>
          <span>Pendamping Kesejahteraan Mahasiswa Skripsi</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          Tetap Waras & Bertumbuh <br className="hidden sm:inline" />
          di Tengah Perjalanan Skripsi
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed">
          Skripsi adalah maraton mental. Luangkan 2 menit setiap hari untuk mengenali tingkat kecemasan,
          kelelahan kognitif, dan melihat progresmu secara visual tanpa penghakiman.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/checkin"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base shadow-sm transition"
          >
            Mulai Check-in Hari Ini (2 Menit)
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-800 font-medium px-8 py-3.5 rounded-xl text-base border border-neutral-300 transition"
          >
            Lihat Dashboard & Tren 📊
          </Link>
        </div>

        {/* Value Props / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="text-2xl mb-3">⏱️</div>
            <h3 className="font-semibold text-neutral-900 mb-1">Cepat & Tanpa Beban</h3>
            <p className="text-sm text-neutral-500">
              Cukup 2 menit dengan skala terukur (kecemasan, kelelahan mental, tidur, dan progres harian).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="text-2xl mb-3">📈</div>
            <h3 className="font-semibold text-neutral-900 mb-1">Visualisasi Grafik Tren</h3>
            <p className="text-sm text-neutral-500">
              Lihat dinamika kelelahan dan kecemasanmu dari waktu ke waktu secara objektif dengan grafik interaktif.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="text-2xl mb-3">🛡️</div>
            <h3 className="font-semibold text-neutral-900 mb-1">100% Anonim & Privat</h3>
            <p className="text-sm text-neutral-500">
              Identitas disimpan dengan aman secara anonim di perangkatmu tanpa perlu login rumit.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-xs text-neutral-400">
        Jeda — Ruang Bernapas Pejuang Skripsi.
      </footer>
    </div>
  )
}