import React from 'react'
import { BarChart3, Users, BookMarked, AlertCircle, Shield } from 'lucide-react'
import { useBooks } from '../../hooks/useBooks'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../services/supabaseClient'
import { usePendingAdminRequests } from '../../hooks/useAdminApproval'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: books } = useBooks()
  const { data: pendingAdminRequests } = usePendingAdminRequests()

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [borrowsRes, requestsRes, overdueRes] = await Promise.all([
        supabase
          .from('borrow_records')
          .select('*', { count: 'exact' })
          .eq('status', 'active'),
        supabase
          .from('requests')
          .select('*', { count: 'exact' })
          .eq('status', 'pending'),
        supabase
          .from('borrow_records')
          .select('*', { count: 'exact' })
          .eq('status', 'overdue'),
      ])

      return {
        activeBorrows: borrowsRes.count || 0,
        pendingRequests: requestsRes.count || 0,
        overdueBooks: overdueRes.count || 0,
      }
    },
  })

  const totalBooks = books?.length || 0
  const availableBooks = books?.reduce((sum, b) => sum + (b.available_copies || 0), 0) || 0
  const borrowedBooks = (totalBooks * 100 - availableBooks * 100) / 100

  const cards = [
    {
      title: 'Total Books',
      value: totalBooks,
      icon: BarChart3,
      color: 'indigo',
      subtitle: `${availableBooks} available`,
    },
    {
      title: 'Active Borrows',
      value: stats?.activeBorrows || 0,
      icon: BookMarked,
      color: 'emerald',
      subtitle: 'Currently borrowed',
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: Users,
      color: 'blue',
      subtitle: 'Awaiting approval',
    },
    {
      title: 'Overdue Books',
      value: stats?.overdueBooks || 0,
      icon: AlertCircle,
      color: 'red',
      subtitle: 'Action required',
    },
    {
      title: 'Admin Requests',
      value: pendingAdminRequests?.length || 0,
      icon: Shield,
      color: 'amber',
      subtitle: 'Pending approvals',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of library operations and pending actions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          const colorClasses = {
            indigo: 'bg-red-600/10 border-red-500/20 text-red-400',
            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
            red: 'bg-red-500/10 border-red-500/20 text-red-400',
            amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          }[card.color as keyof typeof colorClasses]

          return (
            <div
              key={idx}
              className={`p-6 rounded-lg border transition-all ${colorClasses} hover:shadow-lg hover:shadow-${card.color}-500/10`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{card.subtitle}</p>
                </div>
                <Icon className="w-8 h-8 opacity-50" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Pending Requests</h2>
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Manage and approve pending book requests</p>
            <Link
              to="/app/admin/requests"
              className="block w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              View Requests
            </Link>
          </div>
        </div>

        {/* Book Management */}
        <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Book Management</h2>
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Add, edit, or remove books from the library</p>
            <Link
              to="/app/admin/books"
              className="block w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Manage Books
            </Link>
          </div>
        </div>

        {/* Admin Approvals */}
        <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Admin Approvals</h2>
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">
              Review and approve requests for admin access ({pendingAdminRequests?.length || 0} pending)
            </p>
            <Link
              to="/app/admin/approvals"
              className="block w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              View Approvals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
