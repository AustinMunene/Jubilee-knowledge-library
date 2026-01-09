import { useMutation, useQueryClient } from '@tanstack/react-query'
import { returnBorrow } from '../services/borrow'

export function useReturnBorrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => returnBorrow(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrows'] })
      qc.invalidateQueries({ queryKey: ['books'] })
    }
  })
}
