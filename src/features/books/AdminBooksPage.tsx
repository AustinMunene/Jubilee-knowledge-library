import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBooks, deleteBook, bulkDeleteBooks } from '../../services/books'
import BookForm from './BookForm'
import BookEditForm from './BookEditForm'

export default function AdminBooksPage() {
  const { data: books, isLoading } = useQuery(['books_admin'], fetchBooks)
  const qc = useQueryClient()
  const delMut = useMutation((id: string) => deleteBook(id), { onSuccess: () => qc.invalidateQueries(['books_admin', 'books']) })
  const bulkMut = useMutation((ids: string[]) => bulkDeleteBooks(ids), { onSuccess: () => qc.invalidateQueries(['books_admin', 'books']) })
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<any | null>(null)

  function toggle(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }

  function handleBulkDelete() {
    const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => k)
    if (ids.length === 0) return alert('Select books to delete')
    if (!confirm(`Delete ${ids.length} books?`)) return
    bulkMut.mutate(ids)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Books</h2>
      <div className="mb-4">
        <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete selected</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {isLoading && <div>Loading...</div>}
        {books?.map((b: any) => (
          <div key={b.id} className="bg-white p-3 rounded shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{b.title}</div>
                <div className="text-sm text-gray-500">{b.author}</div>
                <div className="text-sm text-gray-500">Available: {b.available_copies}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <input type="checkbox" checked={!!selected[b.id]} onChange={() => toggle(b.id)} />
                <div className="flex flex-col gap-1">
                  <button onClick={() => setEditing(b)} className="px-2 py-1 bg-yellow-500 text-white rounded text-sm">Edit</button>
                  <button onClick={() => delMut.mutate(b.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Create new book</h3>
        <BookForm />
      </div>

      {editing && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Edit book</h4>
          <BookEditForm book={editing} onSaved={(b) => { setEditing(null); qc.invalidateQueries(['books_admin']) }} />
        </div>
      )}
    </div>
  )
}
