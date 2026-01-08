import React from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { useCreateRequest } from '../hooks/useRequests'
import { Button } from './Button'

export default function RequestButton({ bookId, disabled }: { bookId: string; disabled?: boolean }) {
  const { user } = useAuth()
  const mutation = useCreateRequest()

  async function handleRequest() {
    if (!user) return alert('Please sign in to request a book')
    await mutation.mutateAsync({ user_id: user.id, book_id: bookId })
    alert('Request submitted')
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleRequest}
      disabled={disabled || mutation.isLoading}
      aria-label="Request this book"
    >
      {mutation.isLoading ? 'Submitting...' : 'Request'}
    </Button>
  )
}
