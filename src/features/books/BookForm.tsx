import React, { useState } from 'react'
import { createBook } from '../../services/books'
import { useNavigate } from 'react-router-dom'
import { uploadBookCover } from '../../services/storage'
import { Loader } from 'lucide-react'

export default function BookForm() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [total, setTotal] = useState(1)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let cover_url: string | undefined
      if (file) {
        cover_url = await uploadBookCover(file)
      }
      await createBook({
        title,
        author,
        category: category || undefined,
        description: description || undefined,
        total_copies: total,
        available_copies: total,
        cover_url,
      })
      navigate('/app/admin/books')
    } catch (err: any) {
      setError(err.message || 'Failed to create book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Title <span className="text-red-400">*</span></label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Author <span className="text-red-400">*</span></label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g., Fiction, Science, Business"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-y"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A brief description of what the book entails..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Total Copies <span className="text-red-400">*</span></label>
        <input
          type="number"
          min="1"
          className="w-32 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={total}
          onChange={e => setTotal(Math.max(1, Number(e.target.value)))}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate('/app/admin/books')}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Book'}
        </button>
      </div>
    </form>
  )
}
