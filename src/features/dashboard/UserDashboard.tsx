import React from 'react'
import { Clock, CheckCircle, AlertCircle, BookMarked } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'
import { useUserBorrows } from '../../hooks/useBorrowRecords'
import { useReturnBorrow } from '../../hooks/useReturnBorrow'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'

export default function UserDashboard() {
  const { user } = useAuth()
  const { data: borrows, isLoading } = useUserBorrows(user?.id)
  const ret = useReturnBorrow()

  if (!user) return <div className="text-center py-12 text-slate-400">Please sign in to view your dashboard</div>

  const activeBorrows = borrows?.filter(b => b.status === 'active') || []
  const overdueBooks = borrows?.filter(b => b.status === 'overdue') || []
  const returnedBooks = borrows?.filter(b => b.status === 'returned') || []

  const stats = [
    {
      title: 'Active Borrows',
      value: activeBorrows.length,
      icon: BookMarked,
      color: 'indigo',
      subtitle: 'Currently checked out',
    },
    {
      title: 'Overdue Books',
      value: overdueBooks.length,
      icon: AlertCircle,
      color: 'red',
      subtitle: 'Action required',
    },
    {
      title: 'Returned Books',
      value: returnedBooks.length,
      icon: CheckCircle,
      color: 'emerald',
      subtitle: 'Returned successfully',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <p className="text-slate-400 mt-1">Track your borrowed books and manage returns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          const colorClasses = {
            indigo: 'bg-red-600/10 border-red-500/20 text-red-400',
            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            red: 'bg-red-500/10 border-red-500/20 text-red-400',
          }[stat.color as keyof typeof colorClasses]

          return (
            <div key={idx} className={`p-6 rounded-lg border transition-all ${colorClasses}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{stat.subtitle}</p>
                </div>
                <Icon className="w-8 h-8 opacity-50" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Borrows */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Active Borrows</h2>
          <p className="text-slate-400 text-sm mt-1">Books you currently have checked out</p>
        </div>

        {isLoading && <SkeletonGrid count={3} />}

        {!isLoading && activeBorrows.length === 0 && (
          <EmptyState
            title="No active borrows"
            description="Visit the Library page to request your first book"
          />
        )}

        <div className="space-y-3">
          {activeBorrows.map((b: any) => {
            const daysLeft = Math.ceil((new Date(b.due_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            const isExpiringSoon = daysLeft <= 3 && daysLeft > 0

            return (
              <div
                key={b.id}
                className={`p-4 rounded-lg border transition-all ${
                  isExpiringSoon
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-slate-800 border-slate-700 hover:border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">Book #{b.book_id}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Issued</p>
                        <p className="text-slate-200">{new Date(b.issued_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Due</p>
                        <p className={isExpiringSoon ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                          {new Date(b.due_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {daysLeft > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">{daysLeft}</div>
                      <div className="text-xs text-slate-400">days left</div>
                    </div>
                  )}
                  <button
                    onClick={() => ret.mutate(b.id)}
                    disabled={ret.isPending}
                    className="ml-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {ret.isPending ? 'Returning...' : 'Return'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Overdue Books */}
      {overdueBooks.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Overdue Books</h2>
            <p className="text-red-400 text-sm mt-1">Please return these books as soon as possible</p>
          </div>

          <div className="space-y-3">
            {overdueBooks.map((b: any) => (
              <div
                key={b.id}
                className="p-4 rounded-lg border bg-red-500/10 border-red-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="font-semibold text-white">Book #{b.book_id}</p>
                    </div>
                    <p className="text-red-400 text-sm mt-2">
                      Due: {new Date(b.due_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => ret.mutate(b.id)}
                    disabled={ret.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    Return Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
