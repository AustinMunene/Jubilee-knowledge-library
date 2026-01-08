import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Star, ShoppingCart, Edit, Trash2, Loader } from 'lucide-react'
import { useBook } from '../../hooks/useBooks'
import { useAuth } from '../../app/providers/AuthProvider'
import { createRequest } from '../../services/requests'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: book, isLoading } = useBook(id)
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequest = async () => {
    if (!book || !user) return
    
    setIsRequesting(true)
    try {
      await createRequest(book.id, user.id)
      alert('Request submitted successfully!')
      navigate('/app/requests')
    } catch (error) {
      alert('Failed to submit request')
    } finally {
      setIsRequesting(false)
    }
  }

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading...</div>
  if (!book) return <div className="text-center py-12 text-slate-400">Book not found</div>

  const isAvailable = book.available_copies > 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">Book Details</h2>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Cover Image */}
            <div className="col-span-1">
              <img
                src={book.cover_url || 'https://via.placeholder.com/200x300'}
                alt={book.title}
                className="w-full rounded-lg shadow-lg object-cover aspect-[2/3]"
              />
              <div className="mt-4 space-y-2">
                <div className={`text-center py-2 rounded-lg font-semibold ${
                  isAvailable
                    ? 'bg-emerald-900 text-emerald-200'
                    : 'bg-red-900 text-red-200'
                }`}>
                  {isAvailable ? `${book.available_copies} Copies Available` : 'Unavailable'}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="col-span-2">
              <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-lg text-indigo-400 mb-4">{book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-400">({book.rating || 0}/5)</span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800 rounded-lg mb-6">
                <div>
                  <p className="text-slate-500 text-sm uppercase tracking-wide">Category</p>
                  <p className="text-white font-medium">{book.category}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm uppercase tracking-wide">ISBN</p>
                  <p className="text-white font-medium">{book.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm uppercase tracking-wide">Total Copies</p>
                  <p className="text-white font-medium">{book.total_copies}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm uppercase tracking-wide">Added</p>
                  <p className="text-white font-medium">
                    {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-slate-300 leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-700 pt-6">
            {isAvailable && user?.role !== 'admin' && (
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isRequesting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Request Book
                  </>
                )}
              </button>
            )}

            {user?.role === 'admin' && (
              <>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
