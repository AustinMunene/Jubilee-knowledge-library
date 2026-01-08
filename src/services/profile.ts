import { supabase } from './supabaseClient'
import { uploadProfilePhoto as uploadPhoto } from './storage'
import type { User } from '../types'

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  return uploadPhoto(file, userId)
}

