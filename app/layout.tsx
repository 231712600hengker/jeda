import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Footer } from './components/footer'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jeda | Ruang untuk melihat pola',
  description: 'Check-in anonim untuk membantu mahasiswa skripsi memahami pola stres, energi, dan progres hariannya.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}<Footer /></body></html>
}
