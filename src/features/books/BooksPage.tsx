import React, { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { useBooks } from '../../hooks/useBooks'
import BookGridCard from './components/BookGridCard'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'

export default function BooksPage() {
  const { data: books, isLoading } = useBooks()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = books?.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter
    return matchesSearch && matchesCategory
  }) || []

  const categories = Array.from(new Set(books?.map(b => b.category).filter(Boolean))) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Library</h1>
        <p className="text-slate-400 mt-1">Explore and request books from our collection</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search books or authors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700">
          <Filter className="w-5 h-5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent outline-none text-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading && <SkeletonGrid count={6} />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title={searchTerm ? 'No books found' : 'No books yet'}
          description={searchTerm ? 'Try adjusting your search terms' : 'Check back soon as the library expands'}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(book => (
          <BookGridCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
