import React from 'react'
import { useAdminRequests, useApproveRequest, useRejectRequest } from '../../hooks/useRequests'
import { Loader, CheckCircle, XCircle, User, Mail } from 'lucide-react'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { useBooks } from '../../hooks/useBooks'
import { useToast } from '../../components/Toast'

export default function AdminRequestsPage() {
  const { data: requests, isLoading, error } = useAdminRequests()
  const { data: books } = useBooks()
  const approveMutation = useApproveRequest()
  const rejectMutation = useRejectRequest()
  const { showToast } = useToast()

  const getBookTitle = (bookId: string) => {
    // Check if request has book data joined
    const request = requests?.find((r: any) => r.book_id === bookId)
    if (request?.books) {
      return (request.books as any).title
    }
    // Fallback to books query
    const book = books?.find(b => b.id === bookId)
    return book?.title || `Book ${bookId.slice(0, 8)}...`
  }

  const handleApprove = async (requestId: string) => {
    if (confirm('Approve this book request? This will create a borrow record and reduce available copies.')) {
      try {
        await approveMutation.mutateAsync(requestId)
        showToast('Request approved successfully', 'success')
      } catch (err: any) {
        showToast(err.message || 'Failed to approve request', 'error')
      }
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Optional: Enter a reason for rejection (or leave blank)')
    if (reason !== null) { // User clicked OK (even if reason is empty)
      try {
        await rejectMutation.mutateAsync({ requestId, reason: reason || undefined })
        showToast('Request rejected', 'success')
      } catch (err: any) {
        showToast(err.message || 'Failed to reject request', 'error')
      }
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

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-red-400">Error loading requests. Please try again.</p>
      </div>
    )
  }

  const pendingRequests = requests?.filter((r: any) => r.status === 'pending') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pending Requests</h1>
        <p className="text-slate-400 mt-1">Review and approve book requests</p>
      </div>

      {pendingRequests.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="w-8 h-8 text-slate-400" />}
          title="No pending requests"
          description="All requests have been processed"
        />
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request: any) => {
            const user = request.profiles as any

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

                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {getBookTitle(request.book_id)}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {user && (
                          <>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <User className="w-4 h-4" />
                              {user.name || user.username || 'Unknown User'}
                              {user.username && <span className="text-slate-500">@{user.username}</span>}
                            </div>
                            {user.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </div>
                            )}
                          </>
                        )}
                        <div className="text-xs text-slate-500 mt-2">
                          Requested: {new Date(request.requested_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
