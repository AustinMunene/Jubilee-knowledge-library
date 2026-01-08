import { supabase } from './supabaseClient'

export async function createBorrow(user_id: string, book_id: string, days = 14) {
  const issued_at = new Date()
  const due = new Date(issued_at.getTime() + days * 24 * 60 * 60 * 1000)

  // start a transaction-like sequence
  const { data: borrow, error: e1 } = await supabase.from('borrow_records').insert({
    user_id,
    book_id,
    issued_at: issued_at.toISOString(),
    due_at: due.toISOString(),
    status: 'active'
  }).select().single()
  if (e1) throw e1

  // decrement available copies
  const { data: book, error: e2 } = await supabase.rpc('decrement_book_available', { p_book_id: book_id })
  if (e2) {
    // attempt rollback by marking borrow as returned
    await supabase.from('borrow_records').update({ status: 'returned', returned_at: new Date().toISOString() }).eq('id', borrow.id)
    throw e2
  }

  return borrow
}

export async function returnBorrow(borrowId: string) {
  // set returned_at and update status
  const { data, error } = await supabase.from('borrow_records').update({ returned_at: new Date().toISOString(), status: 'returned' }).eq('id', borrowId).select().single()
  if (error) throw error

  // increment available copies via RPC
  await supabase.rpc('increment_book_available', { p_book_id: data.book_id })
  return data
}
