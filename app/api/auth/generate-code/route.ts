// POST /api/auth/generate-code
// Membuat kode akses anonim baru dan menyimpan user baru ke Supabase
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Generate kode akses anonim format "JD-XXXXXX"
 * Karakter: alfanumerik, tanpa 0,1,I,O untuk menghindari kebingungan
 */
function generateAccessCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JD-${code}`;
}

export async function POST() {
  try {
    // Generate kode unik (retry jika collision)
    let accessCode: string = '';
    let userId: string = '';
    let attempts = 0;

    while (attempts < 5) {
      accessCode = generateAccessCode();

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          access_code: accessCode,
          consent_agreed: false,
        })
        .select('id')
        .single();

      if (!error && data) {
        userId = data.id;
        break;
      }

      // Jika collision (kode sudah ada), coba lagi
      if (error?.code === '23505') {
        attempts++;
        continue;
      }

      // Error lain
      throw error;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Gagal membuat kode akses. Coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ accessCode, userId }, { status: 201 });
  } catch (err) {
    console.error('[generate-code]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

