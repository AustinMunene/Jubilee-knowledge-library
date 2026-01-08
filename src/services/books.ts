import { supabase } from './supabaseClient'
import type { Book } from '../types'

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Book[]
}

export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error) throw error
  return data as Book
}

export async function createBook(payload: Partial<Book>) {
  const { data, error } = await supabase.from('books').insert(payload).select().single()
  if (error) throw error
  return data as Book
}

export async function updateBook(id: string, payload: Partial<Book>) {
  const { data, error } = await supabase.from('books').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Book
}

export async function deleteBook(id: string) {
  const { data, error } = await supabase.from('books').delete().eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function bulkDeleteBooks(ids: string[]) {
  const { data, error } = await supabase.from('books').delete().in('id', ids)
  if (error) throw error
  return data
}
