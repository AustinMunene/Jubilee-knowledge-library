import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import type { Book } from '../../../types'
import { useCreateRequest } from '../../../hooks/useRequests'
import { useAuth } from '../../../app/providers/AuthProvider'

interface BookGridCardProps {
  book: Book
}

export default function BookGridCard({ book }: BookGridCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createRequest = useCreateRequest()

  const available = book.available_copies > 0

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await createRequest.mutateAsync({ user_id: user.id, book_id: book.id })
      // Success feedback handled by mutation
    } catch (error: any) {
      // Error handled by mutation
      console.error('Request failed:', error.message)
    }
  }

  return (
    <div 
      onClick={() => navigate(`/app/books/${book.id}`)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-indigo-600 transition-all hover:shadow-card-hover"
    >
      {/* Cover Image */}
      <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {available ? (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-medium">
              {book.available_copies} available
            </span>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-red-500/90 text-white text-xs font-medium">
              Not available
            </span>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div className="w-full space-y-2">
            {available && user?.role !== 'admin' && (
              <button 
                onClick={handleRequest}
                disabled={createRequest.isPending}
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {createRequest.isPending ? 'Requesting...' : 'Request'}
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/app/books/${book.id}`)
              }}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1">{book.author}</p>
        </div>

        {book.category && (
          <p className="text-xs text-slate-500 uppercase tracking-wide">{book.category}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-400">{book.total_copies} copies</span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs">{book.rating || 4.5}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
