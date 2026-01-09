import { supabase } from './supabaseClient'
import { createBorrow } from './borrow'

export async function fetchRequestsForAdmin() {
  const { data, error } = await supabase.from('requests').select('*, profiles(*)').order('requested_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchUserRequests(userId: string) {
  const { data, error } = await supabase.from('requests').select('*').eq('user_id', userId).order('requested_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRequest(user_id: string, book_id: string) {
  // Check if book is available
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', book_id)
    .single()

  if (bookError) throw new Error('Book not found')
  if (book.available_copies < 1) throw new Error('Book is not available')

  // Check if user already has a pending request for this book
  const { data: existing } = await supabase
    .from('requests')
    .select('id')
    .eq('user_id', user_id)
    .eq('book_id', book_id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    throw new Error('You already have a pending request for this book')
  }

  const { data, error } = await supabase
    .from('requests')
    .insert({ user_id, book_id })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateRequestStatus(requestId: string, status: 'approved' | 'rejected') {
  // Approving will create a borrow record and decrement available_copies
  const { data: req, error: e1 } = await supabase.from('requests').select('*').eq('id', requestId).single()
  if (e1) throw e1

  if (status === 'approved') {
    // create borrow for 14 days by default
    await createBorrow(req.user_id, req.book_id, 14)
  }

  const { data, error } = await supabase.from('requests').update({ status }).eq('id', requestId).select().single()
  if (error) throw error
  return data
}
