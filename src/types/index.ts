export type Role = 'admin' | 'user'

export interface User {
  id: string
  name?: string
  username?: string
  email?: string
  role?: Role
  department?: string
  profile_photo_url?: string
}

export interface Book {
  id: string
  title: string
  author: string
  category?: string
  isbn?: string
  cover_url?: string
  description?: string
  total_copies: number
  available_copies: number
  rating?: number
  created_at?: string
}

export interface AdminApprovalRequest {
  id: string
  user_id: string
  requested_at: string
  reviewed_at?: string
  reviewed_by?: string
  status: 'pending' | 'approved' | 'rejected'
  user?: User
}
