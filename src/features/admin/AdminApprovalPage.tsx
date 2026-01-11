import React from 'react'
import { usePendingAdminRequests, useApproveAdminRequest, useRejectAdminRequest } from '../../hooks/useAdminApproval'
import { Loader, CheckCircle, XCircle, User, Mail, Shield } from 'lucide-react'
import { Skeleton } from '../../components/Skeleton'

export default function AdminApprovalPage() {
  const { data: requests, isLoading } = usePendingAdminRequests()
  const approveMutation = useApproveAdminRequest()
  const rejectMutation = useRejectAdminRequest()

  const handleApprove = async (requestId: string) => {
    if (confirm('Are you sure you want to approve this admin request?')) {
      await approveMutation.mutateAsync(requestId)
    }
  }

  const handleReject = async (requestId: string) => {
    if (confirm('Are you sure you want to reject this admin request?')) {
      await rejectMutation.mutateAsync(requestId)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Approval Requests</h1>
        <p className="text-slate-400 mt-1">Review and approve requests for admin access</p>
      </div>

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <div className="p-12 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
          <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No pending admin approval requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const user = request.user as any
            return (
              <div
                key={request.id}
                className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center text-white font-medium">
                      {user?.profile_photo_url ? (
                        <img
                          src={user.profile_photo_url}
                          alt={user.name || user.username || 'User'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {user?.name || user?.username || 'Unknown User'}
                        </h3>
                        {user?.username && (
                          <span className="text-sm text-slate-400">@{user.username}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {user?.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        )}
                        {user?.department && (
                          <div className="text-sm text-slate-400">
                            Department: {user.department}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-2">
                          Requested: {new Date(request.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approveMutation.isPending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {rejectMutation.isPending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

