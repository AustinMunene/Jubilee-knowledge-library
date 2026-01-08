import { supabase } from './supabaseClient'
import type { AdminApprovalRequest } from '../types'

export async function fetchPendingAdminRequests(): Promise<AdminApprovalRequest[]> {
  const { data, error } = await supabase
    .from('admin_approval_requests')
    .select('*, user:profiles!admin_approval_requests_user_id_fkey(*)')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })

  if (error) throw error
  return data as AdminApprovalRequest[]
}

export async function createAdminRequest(userId: string) {
  const { data, error } = await supabase
    .from('admin_approval_requests')
    .insert({ user_id: userId })
    .select()
    .single()

  if (error) {
    // If already exists, return existing
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('admin_approval_requests')
        .select('*')
        .eq('user_id', userId)
        .single()
      return existing
    }
    throw error
  }
  return data
}

export async function approveAdminRequest(requestId: string, reviewedBy: string) {
  const { error } = await supabase.rpc('approve_admin_request', {
    p_request_id: requestId,
    p_reviewed_by: reviewedBy,
  })

  if (error) throw error
}

export async function rejectAdminRequest(requestId: string, reviewedBy: string) {
  const { error } = await supabase.rpc('reject_admin_request', {
    p_request_id: requestId,
    p_reviewed_by: reviewedBy,
  })

  if (error) throw error
}

export async function getUserAdminRequestStatus(userId: string) {
  const { data, error } = await supabase
    .from('admin_approval_requests')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

