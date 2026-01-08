import { useQuery } from '@tanstack/react-query'
import { fetchBooks, getBook } from '../services/books'

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
    staleTime: 1000 * 60,
    retry: 1
  })
}

export function useBook(id?: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => id ? getBook(id) : null,
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}
