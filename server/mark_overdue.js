const { createClient } = require('@supabase/supabase-js')
const sgMail = require('@sendgrid/mail')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  try {
    // Get overdue borrow records first
    const { data: overdues, error: e1 } = await supabase
      .from('borrow_records')
      .select('id, user_id, book_id, due_at')
      .eq('status', 'active')
      .lt('due_at', new Date().toISOString())

    if (e1) throw e1

    // Mark them as overdue
    const { data, error } = await supabase.rpc('mark_overdue_borrows')
    if (error) throw error
    console.log(`Marked ${data} borrow records as overdue`)

    // Send emails for each overdue
    if (SENDGRID_API_KEY && overdues && overdues.length > 0) {
      for (const borrow of overdues) {
        try {
          // Fetch user email
          const { data: profile } = await supabase.from('profiles').select('email').eq('id', borrow.user_id).single()
          const { data: book } = await supabase.from('books').select('title').eq('id', borrow.book_id).single()
          
          if (profile?.email && book?.title) {
            const msg = {
              to: profile.email,
              from: process.env.SENDGRID_FROM_EMAIL || 'noreply@jubilee-library.local',
              subject: `📚 Overdue book reminder: ${book.title}`,
              html: `
                <p>Hello,</p>
                <p>You have an overdue book:</p>
                <p><strong>${book.title}</strong></p>
                <p>This was due on <strong>${new Date(borrow.due_at).toLocaleDateString()}</strong>.</p>
                <p>Please return it at your earliest convenience.</p>
                <p>Best regards,<br>Jubilee Knowledge Library</p>
              `
            }
            await sgMail.send(msg)
            console.log(`Sent overdue email to ${profile.email}`)
          }
        } catch (emailErr) {
          console.error('Email send error:', emailErr.message)
        }
      }
    }
  } catch (err) {
    console.error('Failed to run overdue job', err)
    process.exit(1)
  }
}

run()
