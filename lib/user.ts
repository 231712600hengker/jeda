import { supabase } from './supabase'

export async function getOrCreateUser(): Promise<string> {
  const existingId = localStorage.getItem('jeda_user_id')
  if (existingId) return existingId

  const anonymousCode = 'user_' + Math.random().toString(36).substring(2, 10)

  const { data, error } = await supabase
    .from('users')
    .insert({ anonymous_code: anonymousCode })
    .select()
    .single()

  if (error || !data) {
    throw new Error('Gagal membuat user: ' + error?.message)
  }

  localStorage.setItem('jeda_user_id', data.id)
  return data.id
}