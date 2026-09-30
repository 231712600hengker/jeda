import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal ISO ke string lokal bahasa Indonesia
 * Contoh: "2026-09-23" → "23 Sep 2026"
 */
export function formatDateID(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format tanggal ISO ke label grafik singkat
 * Contoh: "2026-09-23" → "23 Sep"
 */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/**
 * Tanggal hari ini sebagai YYYY-MM-DD dalam zona waktu Asia/Jakarta (WIB, UTC+7).
 * Dipakai di semua tempat agar tanggal konsisten terlepas dari zona server/browser.
 */
export function getTodayString(): string {
  return getDateStringWIB(new Date());
}

/**
 * Konversi objek Date ke string YYYY-MM-DD dalam zona waktu Asia/Jakarta (WIB).
 * Gunakan fungsi ini setiap kali perlu tanggal lokal, bukan .toISOString().split('T')[0].
 */
export function getDateStringWIB(date: Date): string {
  // Intl.DateTimeFormat memastikan konversi timezone dilakukan oleh engine,
  // bukan dengan asumsi offset tetap, sehingga otomatis menangani DST (jika ada).
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

