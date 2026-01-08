import { useMutation, useQueryClient } from '@tanstack/react-query'
import { returnBorrow } from '../services/borrow'

export function useReturnBorrow() {
  const qc = useQueryClient()
  return useMutation((id: string) => returnBorrow(id), {
    onSuccess() {
      qc.invalidateQueries(['borrows'])
      qc.invalidateQueries(['books'])
    }
  })
}
