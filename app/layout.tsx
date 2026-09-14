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
  return <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /></head><body className="min-h-full flex flex-col">{children}<Footer /></body></html>
}
