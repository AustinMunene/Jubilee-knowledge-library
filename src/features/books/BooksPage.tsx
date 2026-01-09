import React, { useState, useMemo } from 'react'
import { Search, Filter, BookOpen, X } from 'lucide-react'
import { useBooks } from '../../hooks/useBooks'
import BookGridCard from './components/BookGridCard'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'

export default function BooksPage() {
  const { data: books, isLoading, error } = useBooks()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  // Extract unique categories
  const categories = useMemo(() => {
    if (!books) return []
    return Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort()
  }, [books])

  // Filter books
  const filteredBooks = useMemo(() => {
    if (!books) return []

    return books.filter(book => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()))

      // Category filter
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter

      // Availability filter
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.available_copies > 0) ||
        (availabilityFilter === 'unavailable' && book.available_copies === 0)

      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [books, searchTerm, categoryFilter, availabilityFilter])

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setAvailabilityFilter('all')
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">Error loading books. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Library</h1>
        <p className="text-slate-400 text-lg">Explore and request books from our collection</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent outline-none text-white text-sm font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="bg-transparent outline-none text-white text-sm font-medium cursor-pointer"
            >
              <option value="all">All Books</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}

          {/* Results count */}
          <div className="ml-auto text-sm text-slate-400">
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
                {hasActiveFilters && books && ` of ${books.length} total`}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No books match your filters' : 'No books yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search terms or filters'
              : 'Check back soon as the library expands'
          }
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
          action={
            hasActiveFilters
              ? {
                  label: 'Clear Filters',
                  onClick: clearFilters,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookGridCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
