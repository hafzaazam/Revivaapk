import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const looksLikeUrl = /^https?:\/\//i.test(url)

/** True when Vite env has a usable project URL + anon key */
export const isSupabaseConfigured = Boolean(looksLikeUrl && anonKey)

/**
 * Browser Supabase client. Null when env is missing/invalid so the app
 * still boots before keys are added (no "Invalid supabaseUrl" crash).
 */
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
