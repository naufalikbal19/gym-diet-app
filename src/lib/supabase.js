import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[GymTrack] Supabase env vars missing!\n' +
    'VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING',
    '\nVITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗ MISSING'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
)
