import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Footer } from './components/footer'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jeda | Ruang untuk melihat pola',
  description: 'Check-in anonim untuk membantu mahasiswa skripsi memahami pola stres, energi, dan progres hariannya.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}<Footer /></body></html>
}
