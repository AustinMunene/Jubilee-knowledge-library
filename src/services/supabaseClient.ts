import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing env.VITE_SUPABASE_URL')
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY')
}

// Log which Supabase instance we're connected to (only in development)
if (import.meta.env.DEV) {
  const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  console.log(`🔗 Connected to Supabase project: ${projectId || 'unknown'}`)
  console.log(`📍 Environment: ${import.meta.env.MODE}`)
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
