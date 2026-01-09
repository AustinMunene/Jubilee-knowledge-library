import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'

export function useUserBorrows(userId?: string) {
  return useQuery({
    queryKey: ['borrows', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrow_records')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
