export const SLEEP_QUANTITY_OPTIONS = ['< 4 Jam', '4-6 Jam', '6-8 Jam', '> 8 Jam'] as const

export const SLEEP_QUALITY_OPTIONS = ['Sering terbangun atau gelisah', 'Cukup', 'Sangat nyenyak'] as const

export const STRESSOR_OPTIONS = [
  { value: 'teknis', label: 'Beban teknis atau kognitif' },
  { value: 'bimbingan', label: 'Bimbingan atau birokrasi' },
  { value: 'manajemen_waktu', label: 'Manajemen waktu' },
  { value: 'infrastruktur', label: 'Lingkungan atau fasilitas' },
  { value: 'personal', label: 'Hal personal di luar skripsi' },
] as const

export const STRESSOR_LABELS: Record<string, string> = {
  teknis: 'Beban teknis/kognitif',
  bimbingan: 'Bimbingan dan birokrasi',
  manajemen_waktu: 'Manajemen waktu',
  infrastruktur: 'Infrastruktur dan lingkungan',
  personal: 'Personal',
}
