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

// Retry logic for profile fetching with exponential backoff
async function fetchUserProfile(userId: string, retryCount = 0, maxRetries = 3): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 = no rows returned (profile doesn't exist yet)
      if (error.code === 'PGRST116') {
        return null
      }
      
      // Retry on network/timeout errors
      if (retryCount < maxRetries && (error.code === '0' || error.message?.includes('timeout') || error.message?.includes('network'))) {
        const delay = Math.pow(2, retryCount) * 100 // exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchUserProfile(userId, retryCount + 1, maxRetries)
      }
      
      console.error('Error fetching profile:', error.code, error.message)
      return null
    }

    return data as User
  } catch (err: any) {
    // Retry on network/timeout errors
    if (retryCount < maxRetries && (err.message?.includes('timeout') || err.message?.includes('network') || err.message?.includes('fetch'))) {
      const delay = Math.pow(2, retryCount) * 100 // exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchUserProfile(userId, retryCount + 1, maxRetries)
    }
    console.error('Exception fetching profile:', err)
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()
  const [authStateLoaded, setAuthStateLoaded] = useState(false) // Track if auth state has been initialized

  const loadUserProfile = async (authUserId: string) => {
    try {
      const profile = await fetchUserProfile(authUserId)
      if (profile) {
        setUser(profile)
        return true
      }
      
      // Fallback to basic user if profile doesn't exist yet
      // This can happen if a user was created but profile wasn't created
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.warn('⚠️ Error getting auth user:', authError.message)
        // Still set a basic user to allow login to proceed
        setUser({
          id: authUserId,
          role: 'user',
        })
        return true
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
      return true
    } catch (err: any) {
      console.error('❌ Failed to load user profile:', err?.message || err)
      // Set a basic user to allow login to proceed even if profile fetch fails
      // This prevents login from hanging when profiles endpoint has issues
      setUser({
        id: authUserId,
        role: 'user',
      })
      return true
    }
  }

  useEffect(() => {
    let mounted = true
    let loadingResolved = false
    let initialCheckDone = false

    const resolveLoading = () => {
      if (mounted && !loadingResolved) {
        loadingResolved = true
        setAuthStateLoaded(true)
        setLoading(false)
      }
    }

    // Set a safety timeout to ensure we never hang forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !loadingResolved) {
        console.warn('⚠️ Auth loading timeout - forcing resolution')
        resolveLoading()
      }
    }, 3000) // 3 second safety timeout

    // Listen for auth state changes - this is the primary mechanism
    // It fires immediately with the current session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      initialCheckDone = true
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

    // Check initial session only if onAuthStateChange doesn't fire quickly enough
    // Use a short delay to give onAuthStateChange a chance to fire first
    const initialCheckTimeout = setTimeout(() => {
      if (!mounted || initialCheckDone || loadingResolved) return
      
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (!mounted || loadingResolved || initialCheckDone) return
          
          if (error) {
            console.warn('⚠️ Error getting session:', error.message)
            resolveLoading()
            return
          }
          
          // Only update if onAuthStateChange hasn't fired yet
          if (session?.user) {
            setSession(session)
            // Load profile in background
            loadUserProfile(session.user.id).catch((err) => {
              console.error('❌ Error loading profile from getSession:', err)
            })
          }
          resolveLoading()
        })
        .catch((err) => {
          if (!mounted || loadingResolved) return
          console.warn('⚠️ getSession promise error:', err)
          resolveLoading()
        })
    }, 500) // Give onAuthStateChange 500ms to fire

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
      clearTimeout(initialCheckTimeout)
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

      if (!data.user) {
        return { error: new Error('Sign in failed: No user data returned') }
      }

      // Set session immediately
      setSession(data.session)
      
      // Set a basic user immediately to allow login to proceed
      // Load profile in background - don't await to prevent blocking
      setUser({
        id: data.user.id,
        email: data.user.email || undefined,
        role: 'user',
      })
      
      // Load full profile in background to get more details
      loadUserProfile(data.user.id).catch((err) => {
        console.warn('⚠️ Profile load failed in signIn (non-critical):', err)
      })

      return {}
    } catch (err: any) {
      console.error('❌ Sign in exception:', err)
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
      // Retry logic for profile creation in case of transient failures
      let profileError = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          username,
          name: name || undefined,
          role: 'user',
        })
        
        if (!result.error) {
          profileError = null
          break
        }
        
        profileError = result.error
        if (attempt < 3 && (result.error.code === '0' || result.error.message?.includes('timeout'))) {
          // Retry on network/timeout errors
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 100))
        } else {
          break
        }
      }

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
        setSession(authData.session)
        
        // Set basic user immediately
        setUser({
          id: authData.user.id,
          email: authData.user.email || undefined,
          role: 'user',
        })
        
        // Load full profile in background
        loadUserProfile(authData.user.id).catch((err) => {
          console.warn('⚠️ Profile load failed on initial signup:', err)
        })
        
        return {}
      } else {
        // No session returned - explicitly sign in to get one
        // This handles cases where email confirmation is disabled but session still not returned
        let signInError = null
        let signInData = null
        
        // Retry sign-in on failure (with max 2 attempts)
        for (let attempt = 1; attempt <= 2; attempt++) {
          const result = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          signInError = result.error
          signInData = result.data
          
          if (!signInError) {
            break
          }
          
          // Retry only on transient errors, not on auth errors
          if (attempt < 2 && (signInError.message?.includes('timeout') || signInError.message?.includes('network'))) {
            await new Promise(resolve => setTimeout(resolve, 500))
          } else {
            break
          }
        }
        
        if (signInError) {
          // Check if it's an email confirmation error
          if (signInError.message.includes('Email not confirmed') || signInError.message.includes('confirm') || signInError.message.includes('not verified')) {
            return { error: new Error('Please check your email to confirm your account. You can sign in after confirmation.') }
          }
          // Account created but sign-in failed - return helpful message
          return { error: new Error('Account created successfully. Please sign in manually with your email and password.') }
        }
        
        if (signInData?.session) {
          // Set session and basic user
          setSession(signInData.session)
          setUser({
            id: signInData.user.id,
            email: signInData.user.email || undefined,
            role: 'user',
          })
          
          // Load full profile in background
          loadUserProfile(signInData.user.id).catch((err) => {
            console.warn('⚠️ Profile load failed after sign-in:', err)
          })
          
          return {}
        }
        
        // If we get here, something went wrong
        return { error: new Error('Account created but session could not be established. Please sign in manually.') }
      }
    } catch (err: any) {
      console.error('❌ Sign up exception:', err)
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
    } catch (err: any) {
      console.error('❌ Sign out error:', err.message)
      // Still clear local state even if signOut fails
      setUser(null)
      setSession(null)
      queryClient.clear()
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
