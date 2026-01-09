import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Loader, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'

type AuthMode = 'signin' | 'signup'

interface ValidationErrors {
  email?: string
  username?: string
  password?: string
  name?: string
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  
  // Get the redirect location from state, or default to /app
  const from = (location.state as any)?.from?.pathname || '/app'

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, from])

  // Password validation rules
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/\d/.test(pwd)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  // Username validation
  const validateUsername = (uname: string): string | null => {
    if (uname.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(uname)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }

  // Email validation
  const validateEmail = (em: string): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (mode === 'signup') {
      const emailError = validateEmail(email)
      if (emailError) errors.email = emailError

      const usernameError = validateUsername(username)
      if (usernameError) errors.username = usernameError

      if (!name.trim()) {
        errors.name = 'Name is required'
      }

      const passwordError = validatePassword(password)
      if (passwordError) errors.password = passwordError
    } else {
      if (!email) errors.email = 'Email is required'
      if (!password) errors.password = 'Password is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    setError('')
    setValidationErrors({})

    // Validate form
    if (!validateForm()) {
      console.log('Validation failed', validationErrors)
      return
    }

    setLoading(true)
    console.log('Starting sign up...', { email, username })

    try {
      const result = await signUp(email, password, username, name)
      console.log('Sign up result:', result)
      
      if (result.error) {
        console.error('Sign up error:', result.error.message)
        if (result.error.message.includes('already registered') || result.error.message.includes('User already registered')) {
          setValidationErrors({ email: 'This email is already registered' })
        } else if (result.error.message.includes('Username already taken')) {
          setValidationErrors({ username: 'This username is already taken' })
        } else {
          setError(result.error.message)
        }
        setLoading(false)
        return
      }

      // Success - wait a bit for auth state to update, then navigate
      console.log('Sign up successful, navigating...')
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 100)
    } catch (err: any) {
      console.error('Sign up exception:', err)
      setError(err.message || 'An error occurred during sign up')
      setLoading(false)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    if (!validateForm()) return

    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        if (result.error.message.includes('Invalid login credentials') || result.error.message.includes('Email not confirmed')) {
          setError('Invalid email or password')
        } else {
          setError(result.error.message)
        }
        setLoading(false)
        return
      }

      // Success - navigation will happen via useEffect when user state updates
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!password || mode !== 'signup') return null
    const hasLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    return { hasLength, hasNumber, hasSpecial }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-orange-500/5 to-teal-500/10" />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Jubilee</h1>
              <p className="text-sm text-slate-400">Knowledge Library</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Discover the joy of{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                learning
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
            Your internal hub for learning and reference materials.
            Access curated resources, manage book requests, and monitor availability across the organization.
            </p>
          </div>
        </div>

        {/* Decorative lines */}
        <div className="relative z-10 flex gap-2">
          <div className="w-12 h-1 bg-teal-500 rounded-full" />
          <div className="w-12 h-1 bg-orange-500 rounded-full" />
          <div className="w-12 h-1 bg-teal-500 rounded-full" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Jubilee</h1>
              <p className="text-xs text-slate-400">Knowledge Library</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-400">
              {mode === 'signin'
                ? 'Sign in to continue your reading journey'
                : 'Start your journey with thousands of books'}
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} 
            className="space-y-5"
            noValidate
          >
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: undefined })
                    }
                  }}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${
                    validationErrors.name
                      ? 'border-red-500'
                      : 'border-slate-700 focus:border-teal-500'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors`}
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: undefined })
                  }
                }}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${
                  validationErrors.email
                    ? 'border-red-500'
                    : 'border-slate-700 focus:border-teal-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors`}
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    if (validationErrors.username) {
                      setValidationErrors({ ...validationErrors, username: undefined })
                    }
                  }}
                  placeholder="johndoe"
                  className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${
                    validationErrors.username
                      ? 'border-red-500'
                      : 'border-slate-700 focus:border-teal-500'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors`}
                  required
                />
                {validationErrors.username && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">Only letters, numbers, and underscores allowed</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: undefined })
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 border ${
                    validationErrors.password
                      ? 'border-red-500'
                      : 'border-slate-700 focus:border-teal-500'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}

              {mode === 'signup' && strength && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-slate-400">Password requirements:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      {strength.hasLength ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className={strength.hasLength ? 'text-green-400' : 'text-slate-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {strength.hasNumber ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className={strength.hasNumber ? 'text-green-400' : 'text-slate-500'}>
                        At least one number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {strength.hasSpecial ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-500" />
                      )}
                      <span className={strength.hasSpecial ? 'text-green-400' : 'text-slate-500'}>
                        At least one special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading
                ? mode === 'signin'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create account'}
            </button>
          </form>

          {/* Toggle between sign in and sign up */}
          <div className="text-center">
            <p className="text-slate-400">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setError('')
                  setValidationErrors({})
                  setPassword('')
                }}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
