import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import type { User } from '../../types'

type AuthContextValue = {
  user: User | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as User
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const loadUserProfile = async (authUserId: string) => {
    const profile = await fetchUserProfile(authUserId)
    if (profile) {
      setUser(profile)
    } else {
      // Fallback to basic user if profile doesn't exist yet
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser?.user) {
        setUser({
          id: authUser.user.id,
          email: authUser.user.email || undefined,
          role: 'user',
        })
      }
    }
  }

  useEffect(() => {
    // Load initial user
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        loadUserProfile(data.user.id)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function refreshProfile() {
    const { data: authUser } = await supabase.auth.getUser()
    if (authUser?.user) {
      await loadUserProfile(authUser.user.id)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
