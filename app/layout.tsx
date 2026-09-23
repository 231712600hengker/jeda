import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Jeda — Ruang Refleksi & Pemantauan Skripsi Mahasiswa',
  description:
    'Aplikasi web Ecological Momentary Assessment (EMA) untuk pemantauan stres, ' +
    'kelelahan, dan progres pengerjaan skripsi secara harian, aman, dan anonim.',
  keywords: ['stress monitoring', 'mahasiswa', 'skripsi', 'burnout', 'EMA', 'kesehatan mental', 'jeda'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf9f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-[#fbf9f6] text-[#2d3748] antialiased selection:bg-[#c5ebd7] selection:text-[#2c4d3f]">
        {children}
      </body>
    </html>
  );
}
