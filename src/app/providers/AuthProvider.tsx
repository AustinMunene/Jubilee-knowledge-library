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
        // Still set a basic user to allow login to proceed
        setUser({
          id: authUserId,
          role: 'user',
        })
        return
      }
      
      if (authUser?.user) {
        setUser({
          id: authUser.user.id,
          email: authUser.user.email || undefined,
          role: 'user',
        })
      } else {
        // Set basic user to allow login to proceed even without profile
        setUser({
          id: authUserId,
          role: 'user',
        })
      }
    } catch (err: any) {
      console.error('Failed to load user profile:', err?.message || err)
      // Set a basic user to allow login to proceed even if profile fetch fails
      // This prevents login from hanging when profiles endpoint has issues
      setUser({
        id: authUserId,
        role: 'user',
      })
    }
  }

  useEffect(() => {
    let mounted = true
    let loadingResolved = false

    const resolveLoading = () => {
      if (mounted && !loadingResolved) {
        loadingResolved = true
        setLoading(false)
        // Loading resolved
      }
    }

    // Set a safety timeout to ensure we never hang forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !loadingResolved) {
        console.warn('Auth loading timeout - forcing resolution')
        resolveLoading()
      }
    }, 1500) // 1.5 second safety timeout

    // Listen for auth state changes - this is the primary mechanism
    // It fires immediately with the current session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      
      if (session?.user) {
        try {
          await loadUserProfile(session.user.id)
        } catch (err) {
          console.error('❌ Error loading profile in auth change:', err)
          // Set a basic user object even if profile fetch fails
          // This ensures login can proceed even if profiles endpoint has issues
          setUser({
            id: session.user.id,
            email: session.user.email || undefined,
            role: 'user',
          })
        }
      } else {
        setUser(null)
        // Clear all query cache on sign out
        queryClient.clear()
      }
      
      // Always resolve loading - even if profile load failed, we have a basic user
      resolveLoading()
    })

    // Also check initial session as a backup (non-blocking)
    // But don't wait for it - onAuthStateChange should fire first
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted || loadingResolved) return
        
        if (error) {
          console.warn('⚠️ Error getting session (non-critical):', error.message)
          return
        }
        
        // Only update if we haven't already resolved and session exists
        if (session?.user) {
          setSession(session)
          // Load profile in background
          loadUserProfile(session.user.id).catch((err) => {
            console.error('❌ Error loading profile from getSession:', err)
          })
        }
      })
      .catch((err) => {
        if (!mounted || loadingResolved) return
        console.warn('⚠️ getSession promise error (non-critical):', err)
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [queryClient])

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: new Error('Invalid email or password') }
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: new Error('Please check your email to confirm your account') }
        }
        return { error: new Error(error.message) }
      }

      if (!data?.session) {
        return { error: new Error('Sign in failed: No session returned') }
      }

      // Set session immediately - this will trigger onAuthStateChange
      // which will handle profile loading asynchronously
      setSession(data.session)
      
      // Set a basic user immediately to allow login to proceed
      // onAuthStateChange will update with full profile when it loads
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || undefined,
          role: 'user',
        })
        // Load profile in background - don't await to prevent blocking
        loadUserProfile(data.user.id).catch((err) => {
          console.warn('Profile load failed in signIn, onAuthStateChange will handle it:', err)
        })
      }

      return {}
    } catch (err: any) {
      console.error('Sign in exception:', err)
      return { error: new Error(err.message || 'Sign in failed') }
    }
  }

  async function signUp(email: string, password: string, username: string, name?: string) {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          return { error: new Error('This email is already registered') }
        }
        return { error: new Error(authError.message) }
      }

      if (!authData.user) {
        return { error: new Error('Failed to create account') }
      }

      // Step 2: Create profile (using the user ID from signup)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        username,
        name: name || undefined,
        role: 'user',
      })

      if (profileError) {
        // Handle duplicate username
        if (profileError.code === '23505' || profileError.message.includes('unique') || profileError.message.includes('duplicate')) {
          return { error: new Error('Username already taken') }
        }
        return { error: new Error(`Failed to create profile: ${profileError.message}`) }
      }

      // Step 3: Handle session - Supabase signUp may not return session if email confirmation is required
      // Always try to sign in after successful signup to ensure we have a session
      if (authData.session) {
        // Session was returned immediately - use it
        // The onAuthStateChange listener will also fire, but we set it explicitly here to ensure immediate state update
        setSession(authData.session)
        // Load profile - it should exist since we just created it
        // If it fails, the listener will handle fallback
        try {
          await loadUserProfile(authData.user.id)
        } catch (err) {
          console.warn('Profile load failed on initial signup, will retry via auth listener:', err)
          // Continue anyway - onAuthStateChange will handle retry
        }
        return {}
      } else {
        // No session returned - explicitly sign in to get one
        // This handles cases where email confirmation is disabled but session still not returned
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          // Check if it's an email confirmation error
          if (signInError.message.includes('Email not confirmed') || signInError.message.includes('confirm') || signInError.message.includes('not verified')) {
            return { error: new Error('Please check your email to confirm your account. You can sign in after confirmation.') }
          }
          // Account created but sign-in failed - return helpful message
          return { error: new Error('Account created successfully. Please sign in manually with your email and password.') }
        }
        
        if (signInData?.session) {
          // Set session explicitly - onAuthStateChange will also fire
          setSession(signInData.session)
          try {
            await loadUserProfile(signInData.user.id)
          } catch (err) {
            console.warn('Profile load failed after sign-in, will retry via auth listener:', err)
            // Continue anyway - onAuthStateChange will handle retry
          }
          return {}
        }
        
        // If we get here, something went wrong
        return { error: new Error('Account created but session could not be established. Please sign in manually.') }
      }
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
