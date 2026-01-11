import { supabase } from './supabaseClient'
import type { BorrowRecord } from '../types'

export async function fetchUserBorrows(userId: string) {
  const { data, error } = await supabase
    .from('borrow_records')
    .select('*, books(*), requests(*)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })
  if (error) throw error
  return data as BorrowRecord[]
}

export async function fetchAllBorrows() {
  const { data, error } = await supabase
    .from('borrow_records')
    .select('*, profiles(*), books(*), requests(*)')
    .order('issued_at', { ascending: false })
  if (error) throw error
  return data as BorrowRecord[]
}

export async function returnBorrow(borrowId: string, returnedBy: string) {
  const { error } = await supabase.rpc('return_book_borrow', {
    p_borrow_id: borrowId,
    p_returned_by: returnedBy
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Borrow record not found')
    }
    if (error.message.includes('not active')) {
      throw new Error('This borrow record is already returned')
    }
    throw error
  }

  // Fetch the updated borrow record
  const { data, error: fetchError } = await supabase
    .from('borrow_records')
    .select('*, profiles(*), books(*), requests(*)')
    .eq('id', borrowId)
    .single()

  if (fetchError) throw fetchError
  return data as BorrowRecord
}
