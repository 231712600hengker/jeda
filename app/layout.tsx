import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jeda — EMA untuk Mahasiswa Skripsi',
  description:
    'Aplikasi web Ecological Momentary Assessment (EMA) untuk pemantauan stres, ' +
    'kelelahan, dan progres pengerjaan skripsi secara harian dan anonim.',
  keywords: ['stress monitoring', 'mahasiswa', 'skripsi', 'burnout', 'EMA', 'kesehatan mental'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

