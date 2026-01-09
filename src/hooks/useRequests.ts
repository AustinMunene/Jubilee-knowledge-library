import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserRequests, fetchRequestsForAdmin, createRequest, updateRequestStatus } from '../services/requests'
import { useAuth } from '../app/providers/AuthProvider'

export function useUserRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['requests', user?.id],
    queryFn: () => fetchUserRequests(user!.id),
    enabled: !!user,
  })
}

export function useAdminRequests() {
  return useQuery({
    queryKey: ['admin_requests'],
    queryFn: fetchRequestsForAdmin,
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ user_id, book_id }: { user_id: string; book_id: string }) => createRequest(user_id, book_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    }
  })
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => updateRequestStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_requests'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
    }
  })
}
