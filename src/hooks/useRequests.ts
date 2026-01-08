import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserRequests, fetchRequestsForAdmin, createRequest, updateRequestStatus } from '../services/requests'
import { useAuth } from '../app/providers/AuthProvider'

export function useUserRequests() {
  const { user } = useAuth()
  return useQuery(['requests', user?.id], () => fetchUserRequests(user!.id), { enabled: !!user })
}

export function useAdminRequests() {
  return useQuery(['admin_requests'], fetchRequestsForAdmin)
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation(({ user_id, book_id }: { user_id: string; book_id: string }) => createRequest(user_id, book_id), {
    onSuccess() { qc.invalidateQueries(['requests']) }
  })
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient()
  return useMutation(({ id, status }: { id: string; status: 'approved' | 'rejected' }) => updateRequestStatus(id, status), {
    onSuccess() { qc.invalidateQueries(['admin_requests']); qc.invalidateQueries(['requests']) }
  })
}
