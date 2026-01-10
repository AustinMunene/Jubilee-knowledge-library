// Quick script to check which Supabase instance you're connected to
// Run: node scripts/check-env.js

console.log('🔍 Checking environment configuration...\n')

const url = process.env.VITE_SUPABASE_URL || 'NOT SET'
const key = process.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'

console.log('Local Environment Variables:')
console.log(`  VITE_SUPABASE_URL: ${url}`)
console.log(`  VITE_SUPABASE_ANON_KEY: ${key}`)

if (url === 'NOT SET') {
  console.log('\n⚠️  WARNING: VITE_SUPABASE_URL is not set!')
  console.log('   Create a .env file with your Supabase credentials.')
} else {
  // Extract project ID from URL
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (match) {
    console.log(`\n✅ Connected to Supabase project: ${match[1]}`)
    console.log(`\n📝 To check if Netlify uses the same database:`)
    console.log(`   1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables`)
    console.log(`   2. Compare VITE_SUPABASE_URL with: ${url}`)
    console.log(`   3. If they match → Same database (changes affect both environments)`)
    console.log(`   4. If different → Separate databases (safer for development)`)
  } else {
    console.log('\n⚠️  Could not parse Supabase URL format')
  }
}

