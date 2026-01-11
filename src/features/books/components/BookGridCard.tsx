import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Star, Eye } from 'lucide-react'
import type { Book } from '../../../types'
import { useCreateRequest } from '../../../hooks/useRequests'
import { useAuth } from '../../../app/providers/AuthProvider'
import { useToast } from '../../../components/Toast'

interface BookGridCardProps {
  book: Book
}

export default function BookGridCard({ book }: BookGridCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createRequest = useCreateRequest()
  const { showToast } = useToast()

  const available = book.available_copies > 0

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await createRequest.mutateAsync({ user_id: user.id, book_id: book.id })
      showToast('Book request submitted successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to request book', 'error')
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/app/books/${book.id}`)
  }

  return (
    <div 
                className="group cursor-pointer rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10"
    >
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mb-3 border border-red-500/30">
              <BookOpen className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-xs text-slate-500 text-center font-medium">No Cover</p>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-10">
          {available ? (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg">
              {book.available_copies} available
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg">
              Unavailable
            </span>
          )}
        </div>

        {/* Category Badge */}
        {book.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium border border-slate-700">
              {book.category}
            </span>
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full space-y-2">
            {available && user?.role !== 'admin' && (
              <button 
                onClick={handleRequest}
                disabled={createRequest.isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg hover:shadow-red-500/50"
              >
                {createRequest.isPending ? 'Requesting...' : 'Request Book'}
              </button>
            )}
            <button 
              onClick={handleViewDetails}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700/90 hover:bg-slate-600 text-white text-sm font-medium transition-colors backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors text-lg leading-tight mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-slate-400">{book.author}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-500 font-medium">{book.total_copies} total copies</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-medium">{book.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
