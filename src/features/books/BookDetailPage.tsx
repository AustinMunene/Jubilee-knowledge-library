import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Star, ShoppingCart, Edit, Trash2, Loader, BookOpen, Calendar, Tag, Hash } from 'lucide-react'
import { useBook } from '../../hooks/useBooks'
import { useAuth } from '../../app/providers/AuthProvider'
import { useCreateRequest } from '../../hooks/useRequests'
import { useToast } from '../../components/Toast'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: book, isLoading } = useBook(id)
  const createRequest = useCreateRequest()
  const { showToast } = useToast()

  const handleRequest = async () => {
    if (!book || !user) return
    
    try {
      await createRequest.mutateAsync({ user_id: user.id, book_id: book.id })
      showToast('Book request submitted successfully!', 'success')
      setTimeout(() => navigate('/app/requests'), 1000)
    } catch (error: any) {
      showToast(error.message || 'Failed to submit request', 'error')
    }
  }

  const handleClose = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-700">
          <Loader className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-400 mt-4 text-center">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-700 max-w-md">
          <p className="text-red-400 text-center mb-4">Book not found</p>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isAvailable = book.available_copies > 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div 
        className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white">Book Details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Cover Image */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full rounded-xl shadow-2xl object-cover aspect-[2/3] border border-slate-700/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-xl shadow-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-8 border border-slate-700/50">
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
                        <BookOpen className="w-12 h-12 text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">No Cover Available</p>
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div className="mt-4">
                    <div className={`text-center py-3 rounded-xl font-semibold transition-all ${
                      isAvailable
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {isAvailable ? (
                        <div>
                          <div className="text-2xl font-bold">{book.available_copies}</div>
                          <div className="text-xs mt-1">Copies Available</div>
                        </div>
                      ) : (
                        <div className="text-sm">Unavailable</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3 leading-tight">{book.title}</h1>
                  <p className="text-xl text-indigo-400 font-medium mb-4">{book.author}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(book.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 font-medium">{(book.rating || 4.5).toFixed(1)}/5.0</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  {book.category && (
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Category</p>
                        <p className="text-white font-semibold">{book.category}</p>
                      </div>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">ISBN</p>
                        <p className="text-white font-semibold">{book.isbn}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Total Copies</p>
                      <p className="text-white font-semibold">{book.total_copies}</p>
                    </div>
                  </div>
                  {book.created_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Added</p>
                        <p className="text-white font-semibold">
                          {new Date(book.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {book.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Description</h3>
                    <p className="text-slate-300 leading-relaxed text-lg">{book.description}</p>
                  </div>
                )}

                {/* Reviews Section (Placeholder) */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                  <div className="text-center py-8 text-slate-500">
                    <p>No reviews yet. Be the first to review this book!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-slate-700/50 pt-6">
              {isAvailable && user?.role !== 'admin' && (
                <button
                  onClick={handleRequest}
                  disabled={createRequest.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50"
                >
                  {createRequest.isPending ? (
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
                  <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium">
                    <Edit className="w-5 h-5" />
                    Edit Book
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors font-medium">
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
