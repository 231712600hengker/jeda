import { z } from 'zod';

export const CheckinSchema = z.object({
  anxietyQ1: z.number().int().min(0).max(3),
  anxietyQ2: z.number().int().min(0).max(3),
  fatigueMental: z.number().int().min(1).max(10),
  fatiguePhysical: z.number().int().min(1).max(10),
  sleepQuantity: z.enum(['< 5 jam', '5-6 jam', '6-7 jam', '7-8 jam', '> 8 jam']),
  sleepQuality: z.enum(['buruk', 'cukup', 'baik']),
  progress: z.number().int().min(1).max(5),
  selfEfficacy: z.number().int().min(1).max(5),
  stressors: z.array(
    z.enum(['technical', 'guidance_bureaucracy', 'time_management', 'infrastructure', 'personal'])
  ),
  note: z.string().max(500).optional(),
});

export const LoginSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .min(1, 'Kode akses wajib diisi')
    .max(16, 'Kode akses maksimal 16 karakter')
    .toUpperCase(),
});

export const ConsentSchema = z.object({
  agreed: z.literal(true, {
    errorMap: () => ({ message: 'Informed consent harus disetujui untuk melanjutkan.' }),
  }),
});

export type CheckinInput = z.infer<typeof CheckinSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ConsentInput = z.infer<typeof ConsentSchema>;

