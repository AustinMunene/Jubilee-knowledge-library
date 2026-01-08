import { supabase } from './supabaseClient'

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'book-covers')
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string = 'book-covers',
  folder?: string
): Promise<string> {
  // Generate a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL')
  }

  return urlData.publicUrl
}

/**
 * Upload a book cover image
 */
export async function uploadBookCover(file: File): Promise<string> {
  return uploadFile(file, 'book-covers', 'covers')
}

/**
 * Upload a profile photo
 * @param file - The file to upload
 * @param userId - The user's ID for folder organization
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  return uploadFile(file, 'profile-photos', userId)
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

