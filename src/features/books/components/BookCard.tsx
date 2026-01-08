import React from 'react'
import type { Book } from '../../../types'
import RequestButton from '../../../components/RequestButton'

export default function BookCard({ book }: { book?: Book }) {
  if (!book) {
    return (
      <div className="bg-white rounded shadow p-4">
        <div className="h-40 bg-gray-100 rounded mb-3" />
        <h3 className="font-medium">Loading...</h3>
      </div>
    )
  }

  const status = book.available_copies > 0 ? 'Available' : 'Fully Borrowed'
  const badgeClass = book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'

  return (
    <div className="bg-white rounded shadow p-4">
      {book.cover_url ? (
        <img src={book.cover_url} alt={book.title} className="h-40 w-full object-cover rounded mb-3" />
      ) : (
        <div className="h-40 bg-gray-100 rounded mb-3" />
      )}
      <h3 className="font-medium">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${badgeClass}`}>{status}</span>
        <RequestButton bookId={book.id} disabled={book.available_copies <= 0} />
      </div>
    </div>
  )
}
