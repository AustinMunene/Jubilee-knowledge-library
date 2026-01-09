import React from 'react'
import { useUserRequests } from '../../hooks/useRequests'
import { useAuth } from '../../app/providers/AuthProvider'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { useBooks } from '../../hooks/useBooks'

export default function RequestsPage() {
  const { user } = useAuth()
  const { data: requests, isLoading, error } = useUserRequests()
  const { data: books } = useBooks()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Please sign in to view your requests</p>
      </div>
    )
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

  const getBookTitle = (bookId: string) => {
    const book = books?.find(b => b.id === bookId)
    return book?.title || `Book ${bookId.slice(0, 8)}...`
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Rejected' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Requests</h1>
        <p className="text-slate-400 mt-1">Track the status of your book requests</p>
      </div>

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No requests yet"
          description="Start by browsing the library and requesting a book"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => {
            const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = config.icon

            return (
              <div
                key={request.id}
                className={`p-6 rounded-lg border ${config.bg} ${config.border} transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      <h3 className="text-lg font-semibold text-white">
                        {getBookTitle(request.book_id)}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color} ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Requested: {new Date(request.requested_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
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
