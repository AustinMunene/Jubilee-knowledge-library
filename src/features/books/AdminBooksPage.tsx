import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBooks, deleteBook, bulkDeleteBooks } from '../../services/books'
import BookForm from './BookForm'
import BookEditForm from './BookEditForm'
import { useToast } from '../../components/Toast'
import { Trash2, Edit, Plus, X, Loader } from 'lucide-react'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'

export default function AdminBooksPage() {
  const { data: books, isLoading } = useQuery({
    queryKey: ['books_admin'],
    queryFn: fetchBooks,
  })
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<any | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const delMut = useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books_admin'] })
      qc.invalidateQueries({ queryKey: ['books'] })
      showToast('Book deleted successfully', 'success')
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete book', 'error')
    }
  })

  const bulkMut = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteBooks(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books_admin'] })
      qc.invalidateQueries({ queryKey: ['books'] })
      setSelected({})
      showToast('Books deleted successfully', 'success')
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete books', 'error')
    }
  })

  function toggle(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }

  function handleBulkDelete() {
    const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => k)
    if (ids.length === 0) {
      showToast('Please select books to delete', 'warning')
      return
    }
    if (!confirm(`Are you sure you want to delete ${ids.length} book(s)? This action cannot be undone.`)) return
    bulkMut.mutate(ids)
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Books</h2>
          <p className="text-slate-400 mt-1">Add, edit, and manage library books</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkMut.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Selected ({selectedCount})
            </button>
          )}
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              setEditing(null)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {showCreateForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Book
              </>
            )}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Book</h3>
          <BookForm />
        </div>
      )}

      {editing && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Edit Book</h3>
            <button
              onClick={() => setEditing(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <BookEditForm
            book={editing}
            onSaved={(b) => {
              setEditing(null)
              qc.invalidateQueries({ queryKey: ['books_admin'] })
              qc.invalidateQueries({ queryKey: ['books'] })
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !books || books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Get started by adding your first book to the library"
          action={{
            label: 'Add Book',
            onClick: () => setShowCreateForm(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((b: any) => (
            <div
              key={b.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{b.title}</h4>
                  <p className="text-sm text-slate-400 truncate">{b.author}</p>
                  {b.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-600/20 text-red-400 rounded">
                      {b.category}
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={!!selected[b.id]}
                  onChange={() => toggle(b.id)}
                  className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="text-sm">
                  <span className="text-slate-400">Available: </span>
                  <span className={`font-medium ${
                    b.available_copies > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {b.available_copies} / {b.total_copies}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(b)
                      setShowCreateForm(false)
                    }}
                    className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700/50 rounded transition-colors"
                    title="Edit book"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${b.title}"?`)) {
                        delMut.mutate(b.id)
                      }
                    }}
                    disabled={delMut.isPending}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50"
                    title="Delete book"
                  >
                    {delMut.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
