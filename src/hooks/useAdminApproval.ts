import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPendingAdminRequests,
  createAdminRequest,
  approveAdminRequest,
  rejectAdminRequest,
  getUserAdminRequestStatus,
} from '../services/adminApproval'
import { useAuth } from '../app/providers/AuthProvider'

export function usePendingAdminRequests() {
  return useQuery({
    queryKey: ['admin_approval_requests', 'pending'],
    queryFn: fetchPendingAdminRequests,
  })
}

export function useCreateAdminRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('Not authenticated')
      return createAdminRequest(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_approval_requests'] })
    },
  })
}

export function useApproveAdminRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return approveAdminRequest(requestId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_approval_requests'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useRejectAdminRequest() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      return rejectAdminRequest(requestId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_approval_requests'] })
    },
  })
}

export function useUserAdminRequestStatus() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['admin_approval_requests', 'user', user?.id],
    queryFn: () => {
      if (!user?.id) return null
      return getUserAdminRequestStatus(user.id)
    },
    enabled: !!user?.id,
  })
}

