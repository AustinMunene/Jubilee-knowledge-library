import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchUserRequests, 
  fetchRequestsForAdmin, 
  createRequest, 
  approveRequest, 
  rejectRequest,
  cancelRequest
} from '../services/requests'
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
      qc.invalidateQueries({ queryKey: ['admin_requests'] })
      qc.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return approveRequest(requestId, user.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_requests'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['books'] })
      qc.invalidateQueries({ queryKey: ['borrows'] })
    }
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return rejectRequest(requestId, user.id, reason)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_requests'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['books'] })
    }
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return cancelRequest(requestId, user.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['admin_requests'] })
      qc.invalidateQueries({ queryKey: ['books'] })
    }
  })
}
