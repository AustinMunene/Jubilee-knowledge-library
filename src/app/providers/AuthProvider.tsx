import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../services/supabaseClient'
import type { User } from '../../types'
import type { Session } from '@supabase/supabase-js'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: Error }>
  signUp: (email: string, password: string, username: string, name?: string) => Promise<{ error?: Error }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 = no rows returned (profile doesn't exist yet)
      if (error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.code, error.message)
      }
      return null
    }

    return data as User
  } catch (err: any) {
    console.error('Exception fetching profile:', err)
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  const loadUserProfile = async (authUserId: string) => {
    try {
      const profile = await fetchUserProfile(authUserId)
      if (profile) {
        setUser(profile)
        return
      }
      
      // Fallback to basic user if profile doesn't exist yet
      // This can happen if a user was created but profile wasn't created
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Error getting auth user:', authError.message)
        setUser(null)
        return
      }
      
      if (authUser?.user) {
        setUser({
          id: authUser.user.id,
          email: authUser.user.email || undefined,
          role: 'user',
        })
      } else {
        setUser(null)
      }
    } catch (err: any) {
      console.error('Failed to load user profile:', err?.message || err)
      setUser(null)
    }
  }

  useEffect(() => {
    let mounted = true
    let loadingResolved = false

    const resolveLoading = () => {
      if (mounted && !loadingResolved) {
        loadingResolved = true
        setLoading(false)
      }
    }

    // Check initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return
        
        if (error) {
          console.error('Error getting session:', error.message)
          resolveLoading()
          return
        }
        
        setSession(session)
        if (session?.user) {
          // Load profile but don't wait for it to resolve loading
          // This prevents hanging if profile fetch fails
          loadUserProfile(session.user.id)
            .catch((err) => {
              console.error('Error loading profile:', err)
            })
            .finally(() => {
              resolveLoading()
            })
        } else {
          resolveLoading()
        }
      })
      .catch((err) => {
        console.error('Failed to get session:', err)
        resolveLoading()
      })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      
      if (session?.user) {
        try {
          await loadUserProfile(session.user.id)
        } catch (err) {
          console.error('Error loading profile in auth change:', err)
        }
      } else {
        setUser(null)
        // Clear all query cache on sign out
        queryClient.clear()
      }
      
      // Resolve loading on auth state change if not already resolved
      resolveLoading()
    })

    // Fallback timeout to ensure loading never hangs forever
    const timeout = setTimeout(() => {
      if (mounted && !loadingResolved) {
        console.warn('Auth loading timeout - forcing loading to false')
        resolveLoading()
      }
    }, 3000) // 3 second timeout

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [queryClient])

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { error: new Error(error.message) }
      }

      if (data?.session) {
        setSession(data.session)
        if (data.user) {
          await loadUserProfile(data.user.id)
        }
      }

      return {}
    } catch (err: any) {
      return { error: new Error(err.message || 'Sign in failed') }
    }
  }

  async function signUp(email: string, password: string, username: string, name?: string) {
    console.log('signUp called with:', { email, username, hasPassword: !!password })
    
    try {
      // Skip username check for now if it's causing issues - we'll rely on DB constraint
      // The database unique constraint will catch duplicates anyway
      console.log('Skipping username check, proceeding to create auth user...')

      // Create auth user first
      console.log('Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Auth signup response:', { hasUser: !!authData?.user, hasSession: !!authData?.session, error: authError?.message })

      if (authError) {
        console.error('Auth signup error:', authError)
        // Check if it's a username/email conflict
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          return { error: new Error('This email is already registered') }
        }
        return { error: new Error(authError.message) }
      }

      if (!authData.user) {
        console.error('No user returned from signup')
        return { error: new Error('Failed to create account') }
      }

      // Create profile - DB constraint will catch duplicate username
      console.log('Creating profile...')
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        username,
        name: name || undefined,
        role: 'user',
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Check if it's a duplicate username
        if (profileError.code === '23505' || profileError.message.includes('unique') || profileError.message.includes('duplicate')) {
          return { error: new Error('Username already taken') }
        }
        return { error: new Error(`Failed to create profile: ${profileError.message}`) }
      }

      console.log('Profile created successfully')

      // Auto sign in after signup - wait for session
      if (authData.session) {
        console.log('Session available, setting session...')
        setSession(authData.session)
        await loadUserProfile(authData.user.id)
      } else {
        // If no session immediately, sign in with password
        console.log('No session, attempting sign in...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          console.error('Auto sign-in error:', signInError)
          // Profile was created, but sign-in failed - user can sign in manually
          return { error: new Error('Account created but auto sign-in failed. Please sign in manually.') }
        }
        
        if (signInData?.session) {
          console.log('Sign in successful, setting session...')
          setSession(signInData.session)
          await loadUserProfile(signInData.user.id)
        }
      }

      console.log('Sign up completed successfully')
      return {}
    } catch (err: any) {
      console.error('Sign up exception:', err)
      return { error: new Error(err.message || 'Sign up failed') }
    }
  }

  async function refreshProfile() {
    const { data: authUser } = await supabase.auth.getUser()
    if (authUser?.user) {
      await loadUserProfile(authUser.user.id)
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      // Clear all query cache
      queryClient.clear()
    } catch (err) {
      console.error('Sign out error')
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshProfile, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
