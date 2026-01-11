import { supabase } from './supabaseClient'
import type { Request } from '../types'

export async function fetchRequestsForAdmin() {
  const { data, error } = await supabase
    .from('requests')
    .select('*, profiles(*), books(*)')
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data as Request[]
}

export async function fetchUserRequests(userId: string) {
  const { data, error } = await supabase
    .from('requests')
    .select('*, books(*)')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data as Request[]
}

export async function createRequest(user_id: string, book_id: string) {
  // Ensure user profile exists - if not, this will fail with foreign key error
  // Check profile exists first to give better error
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user_id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found. Please contact support.')
  }

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

  // Create the request
  const { data, error } = await supabase
    .from('requests')
    .insert({ user_id, book_id })
    .select()
    .single()
  
  if (error) {
    // Provide user-friendly error messages
    if (error.code === '23503') {
      throw new Error('Invalid user or book. Please refresh and try again.')
    }
    if (error.code === '23505') {
      throw new Error('You already have a request for this book')
    }
    throw error
  }

  // Create notification for admins (optional - can be handled by edge function later)
  try {
    await supabase.from('notifications').insert({
      user_id: user_id, // This will be updated to notify admins via edge function
      type: 'request_created',
      title: 'Book Request Created',
      message: 'Your book request has been submitted.',
      metadata: { request_id: data.id, book_id }
    })
  } catch (notifError) {
    // Don't fail request creation if notification fails
    console.warn('Failed to create notification:', notifError)
  }

  return data as Request
}

export async function approveRequest(requestId: string, approvedBy: string) {
  const { data, error } = await supabase.rpc('approve_book_request', {
    p_request_id: requestId,
    p_approved_by: approvedBy,
    p_due_days: 14
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Request not found')
    }
    if (error.message.includes('not pending')) {
      throw new Error('Request is no longer pending')
    }
    if (error.message.includes('not available')) {
      throw new Error('Book is no longer available')
    }
    throw error
  }

  // Fetch the updated request
  const { data: request, error: fetchError } = await supabase
    .from('requests')
    .select('*, profiles(*), books(*)')
    .eq('id', requestId)
    .single()

  if (fetchError) throw fetchError
  return request as Request
}

export async function rejectRequest(requestId: string, rejectedBy: string, reason?: string) {
  const { error } = await supabase.rpc('reject_book_request', {
    p_request_id: requestId,
    p_rejected_by: rejectedBy,
    p_reason: reason || null
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Request not found')
    }
    if (error.message.includes('not pending')) {
      throw new Error('Request is no longer pending')
    }
    throw error
  }

  // Fetch the updated request
  const { data: request, error: fetchError } = await supabase
    .from('requests')
    .select('*, profiles(*), books(*)')
    .eq('id', requestId)
    .single()

  if (fetchError) throw fetchError
  return request as Request
}

export async function cancelRequest(requestId: string, userId: string) {
  // Users can only cancel their own pending requests
  const { data: request, error: fetchError } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !request) {
    throw new Error('Request not found')
  }

  if (request.status !== 'pending') {
    throw new Error('Only pending requests can be cancelled')
  }

  const { data, error } = await supabase
    .from('requests')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data as Request
}
