import React, { useState } from 'react'
import { createBook } from '../../services/books'
import { useNavigate } from 'react-router-dom'
import { uploadBookCover } from '../../services/storage'
import { Loader } from 'lucide-react'
import { useToast } from '../../components/Toast'

export default function BookForm() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [total, setTotal] = useState(1)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [useFileUpload, setUseFileUpload] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showToast } = useToast()
  const navigate = useNavigate()

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!author.trim()) {
      newErrors.author = 'Author is required'
    }
    
    if (total < 1) {
      newErrors.total = 'Total copies must be at least 1'
    }
    
    if (useFileUpload && file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        newErrors.file = 'File must be an image'
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        newErrors.file = 'File size must be less than 5MB'
      }
    } else if (!useFileUpload && coverUrl) {
      // Validate URL format
      try {
        new URL(coverUrl)
      } catch {
        newErrors.coverUrl = 'Please enter a valid URL'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      let cover_url: string | undefined
      
      if (useFileUpload && file) {
        cover_url = await uploadBookCover(file)
      } else if (!useFileUpload && coverUrl.trim()) {
        cover_url = coverUrl.trim()
      }
      
      await createBook({
        title: title.trim(),
        author: author.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        total_copies: total,
        available_copies: total,
        cover_url,
      })
      
      showToast('Book created successfully!', 'success')
      navigate('/app/admin/books')
    } catch (err: any) {
      showToast(err.message || 'Failed to create book', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
            errors.title ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500`}
          value={title}
          onChange={e => {
            setTitle(e.target.value)
            if (errors.title) setErrors({ ...errors, title: '' })
          }}
          required
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Author <span className="text-red-400">*</span>
        </label>
        <input
          className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
            errors.author ? 'border-red-500' : 'border-slate-700'
          } text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500`}
          value={author}
          onChange={e => {
            setAuthor(e.target.value)
            if (errors.author) setErrors({ ...errors, author: '' })
          }}
          required
        />
        {errors.author && <p className="text-red-400 text-xs mt-1">{errors.author}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g., Fiction, Science, Business, Finance"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[100px] resize-y"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A brief description of what the book entails..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
        <div className="mb-3">
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useFileUpload}
                onChange={() => {
                  setUseFileUpload(true)
                  setCoverUrl('')
                  setFile(null)
                }}
                className="text-red-600"
              />
              <span className="text-slate-300">Upload Image</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useFileUpload}
                onChange={() => {
                  setUseFileUpload(false)
                  setFile(null)
                }}
                className="text-red-600"
              />
              <span className="text-slate-300">Enter Image URL</span>
            </label>
          </div>
          
          {useFileUpload ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const selectedFile = e.target.files?.[0] ?? null
                  setFile(selectedFile)
                  if (errors.file) setErrors({ ...errors, file: '' })
                }}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
              />
              {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
              {file && (
                <p className="text-slate-400 text-xs mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url"
                className={`w-full px-4 py-2 rounded-lg bg-slate-800 border ${
                  errors.coverUrl ? 'border-red-500' : 'border-slate-700'
                } text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                value={coverUrl}
                onChange={e => {
                  setCoverUrl(e.target.value)
                  if (errors.coverUrl) setErrors({ ...errors, coverUrl: '' })
                }}
                placeholder="https://example.com/book-cover.jpg"
              />
              {errors.coverUrl && <p className="text-red-400 text-xs mt-1">{errors.coverUrl}</p>}
              {coverUrl && (
                <div className="mt-2">
                  <img
                    src={coverUrl}
                    alt="Preview"
                    className="w-24 h-32 object-cover rounded-lg border border-slate-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Total Copies <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="1"
          className={`w-32 px-4 py-2 rounded-lg bg-slate-800 border ${
            errors.total ? 'border-red-500' : 'border-slate-700'
          } text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500`}
          value={total}
          onChange={e => {
            const value = Math.max(1, Number(e.target.value))
            setTotal(value)
            if (errors.total) setErrors({ ...errors, total: '' })
          }}
          required
        />
        {errors.total && <p className="text-red-400 text-xs mt-1">{errors.total}</p>}
        <p className="text-slate-500 text-xs mt-1">Available copies will be set to match total copies</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate('/app/admin/books')}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Book'}
        </button>
      </div>
    </form>
  )
}
