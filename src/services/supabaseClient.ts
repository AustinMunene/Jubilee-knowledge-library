import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Enhanced error messages with debugging info
if (!SUPABASE_URL) {
  const errorMsg = `Missing VITE_SUPABASE_URL environment variable.\nMode: ${import.meta.env.MODE}\nMake sure you have .env file with VITE_SUPABASE_URL set, or environment variables configured in your deployment platform.`
  console.error('❌', errorMsg)
  throw new Error('Missing env.VITE_SUPABASE_URL')
}

if (!SUPABASE_ANON_KEY) {
  const errorMsg = `Missing VITE_SUPABASE_ANON_KEY environment variable.\nMode: ${import.meta.env.MODE}\nMake sure you have .env file with VITE_SUPABASE_ANON_KEY set, or environment variables configured in your deployment platform.`
  console.error('❌', errorMsg)
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY')
}

// Log which Supabase instance we're connected to (in development and with proper env vars)
const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (import.meta.env.DEV) {
  console.log(`🔗 Connected to Supabase project: ${projectId || 'unknown'}`)
  console.log(`📍 Environment: ${import.meta.env.MODE}`)
} else {
  // Log in production too for debugging
  console.log(`🔗 Production Supabase connected: ${projectId || 'unknown'}`)
}

// Create client with additional options for better error handling
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
