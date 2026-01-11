import { useQuery } from '@tanstack/react-query'
import { fetchUserBorrows, fetchAllBorrows } from '../services/borrow'
import { useAuth } from '../app/providers/AuthProvider'

export function useUserBorrows(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId || user?.id
  
  return useQuery({
    queryKey: ['borrows', targetUserId],
    queryFn: () => fetchUserBorrows(targetUserId!),
    enabled: !!targetUserId,
  })
}

export function useAllBorrows() {
  return useQuery({
    queryKey: ['admin_borrows'],
    queryFn: fetchAllBorrows,
  })
}
