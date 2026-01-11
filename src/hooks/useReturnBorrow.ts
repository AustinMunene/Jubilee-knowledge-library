import { useMutation, useQueryClient } from '@tanstack/react-query'
import { returnBorrow } from '../services/borrow'
import { useAuth } from '../app/providers/AuthProvider'

export function useReturnBorrow() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (borrowId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return returnBorrow(borrowId, user.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrows'] })
      qc.invalidateQueries({ queryKey: ['admin_borrows'] })
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
    }
  })
}
