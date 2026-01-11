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

export interface Request {
  id: string
  user_id: string
  book_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_at: string
  approved_at?: string
  rejected_at?: string
  cancelled_at?: string
  approved_by?: string
  rejected_by?: string
  rejection_reason?: string
  profiles?: User
  books?: Book
}

export interface BorrowRecord {
  id: string
  user_id: string
  book_id: string
  request_id?: string
  issued_at: string
  due_at?: string
  returned_at?: string
  status: 'active' | 'overdue' | 'returned'
  profiles?: User
  books?: Book
  requests?: Request
}

export interface Review {
  id: string
  book_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
  profiles?: User
  books?: Book
}

export interface Notification {
  id: string
  user_id: string
  type: 'request_created' | 'request_approved' | 'request_rejected' | 'return_recorded' | 'overdue_reminder'
  title: string
  message?: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}
