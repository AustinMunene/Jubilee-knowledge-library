/**
 * Seed script for Jubilee Knowledge Library
 * Run with: npx tsx scripts/seedBooks.ts
 * 
 * This script seeds 5 real books into the Supabase database.
 * It checks for duplicates before inserting.
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL or SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// Try to load dotenv if available, otherwise use process.env directly
try {
  const dotenv = require('dotenv')
  const path = require('path')
  dotenv.config({ path: path.join(__dirname, '../.env') })
} catch (e) {
  // dotenv not installed, use process.env directly
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL or SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\n💡 You can either:')
  console.error('   1. Add them to your .env file')
  console.error('   2. Export them before running:')
  console.error('      export SUPABASE_URL="your-url"')
  console.error('      export SUPABASE_SERVICE_ROLE_KEY="your-key"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const books = [
  {
    title: 'Narrative and Numbers',
    author: 'Aswath Damodaran',
    category: 'Finance',
    description: 'A comprehensive guide to valuation that bridges the gap between storytelling and numbers. Learn how to value companies by combining narrative elements with quantitative analysis, making investment decisions more informed and strategic.',
    total_copies: 3,
    available_copies: 3,
    cover_url: null,
  },
  {
    title: 'Value Investing: From Graham to Buffett and Beyond (2nd Ed.)',
    author: 'Bruce Greenwald',
    category: 'Finance',
    description: 'An authoritative exploration of value investing principles from Benjamin Graham to Warren Buffett. This second edition provides updated insights and practical frameworks for identifying undervalued securities and building long-term wealth.',
    total_copies: 3,
    available_copies: 3,
    cover_url: null,
  },
  {
    title: 'A Random Walk Down Wall Street: The Time-Tested Strategy for Successful Investing',
    author: 'Burton Malkiel',
    category: 'Finance',
    description: 'A classic investment guide that explains why a diversified portfolio of index funds is the most reliable path to long-term wealth. Malkiel debunks market timing and stock picking myths while providing evidence-based strategies for individual investors.',
    total_copies: 3,
    available_copies: 3,
    cover_url: "https://dczebbdgvogvoiphjycx.supabase.co/storage/v1/object/sign/images/A%20random%20walk%20down%20wallstreet.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83ZDhmYjNlYS0wZDc2LTQ4NjktODk5OC1hYzZkODhiZDYyNzYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvQSByYW5kb20gd2FsayBkb3duIHdhbGxzdHJlZXQuanBnIiwiaWF0IjoxNzY4MDcxNDgyLCJleHAiOjIwODM0MzE0ODJ9.yvccvZc-lv8XSriAvSwynqwol7mVSeDoodRqCv99EE0",
  },
  {
    title: 'The Handbook of Fixed Income Securities',
    author: 'Frank J. Fabozzi',
    category: 'Finance',
    description: 'The definitive reference for fixed income markets, covering bonds, derivatives, and structured products. Essential reading for finance professionals seeking to understand debt instruments, yield curves, and portfolio management strategies.',
    total_copies: 3,
    available_copies: 3,
    cover_url: null,
  },
  {
    title: 'The Venture Mindset',
    author: 'Ilya Strebulaev and Alex Dang',
    category: 'Business',
    description: 'A practical guide to thinking like a venture capitalist, whether you\'re an entrepreneur, investor, or corporate leader. Learn how to evaluate opportunities, make bold decisions, and build high-growth businesses using VC principles.',
    total_copies: 3,
    available_copies: 3,
    cover_url: null,
  },
]

async function seedBooks() {
  console.log('🌱 Starting book seeding process...\n')

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const book of books) {
    try {
      // Check if book already exists (by title and author)
      const { data: existing, error: checkError } = await supabase
        .from('books')
        .select('id, title')
        .eq('title', book.title)
        .eq('author', book.author)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking for "${book.title}":`, checkError.message)
        errors++
        continue
      }

      if (existing) {
        console.log(`⏭️  Skipping "${book.title}" - already exists`)
        skipped++
        continue
      }

      // Insert the book
      const { data, error: insertError } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single()

      if (insertError) {
        console.error(`❌ Error inserting "${book.title}":`, insertError.message)
        errors++
        continue
      }

      console.log(`✅ Inserted: "${book.title}" by ${book.author}`)
      inserted++
    } catch (err: any) {
      console.error(`❌ Exception inserting "${book.title}":`, err.message)
      errors++
    }
  }

  console.log('\n📊 Seeding Summary:')
  console.log(`   ✅ Inserted: ${inserted}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`\n✨ Done!`)
}

seedBooks()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

