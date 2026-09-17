import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { Card } from './Card'

type AuthMode = 'login' | 'signup'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check if returning from OAuth redirect with error params in URL hash or query
    const hash = window.location.hash || window.location.search
    if (hash.includes('error_description=') || hash.includes('error=')) {
      try {
        const params = new URLSearchParams(hash.replace(/^#/, '?'))
        const errDesc = params.get('error_description') || params.get('error')
        if (errDesc) {
          const decoded = decodeURIComponent(errDesc.replace(/\+/g, ' '))
          if (decoded.includes('path is invalid') || decoded.includes('invalid')) {
            setError(
              `Google Sign-In configuration note: "${decoded}". Please ensure Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs includes "${window.location.origin}/**".`,
            )
          } else {
            setError(`Sign-In Error: ${decoded}`)
          }
        }
      } catch (e) {
        console.error('Failed to parse OAuth redirect error:', e)
      }
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const cleanOrigin = window.location.origin + window.location.pathname
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: cleanOrigin,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Sign In.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const cleanEmail = email.trim().toLowerCase()

    // Email format validation
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. user@gmail.com).')
      setLoading(false)
      return
    }

    try {
      if (mode === 'login') {
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (loginErr) {
          const msg = loginErr.message?.toLowerCase() || ''
          if (
            msg.includes('invalid login credentials') ||
            msg.includes('invalid_credentials') ||
            msg.includes('wrong')
          ) {
            throw new Error('Incorrect email or password. Please check your credentials or switch to Sign Up.')
          }
          throw loginErr
        }
      } else {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.')
        }

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })

        if (signUpErr) {
          if (signUpErr.message?.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email already exists. Please switch to Log In.')
          }
          throw signUpErr
        }

        if (signUpData.user) {
          const baseName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user'
          const username = `${baseName}_${Math.floor(100 + Math.random() * 900)}`
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            username,
          })
        }

        setSuccessMessage('🎉 Account created successfully!')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full px-6 justify-center items-center">
      <Card className="w-full max-w-sm shadow-2xl border-accent/20">
        <h2 className="text-2xl font-extrabold mb-2 text-center text-foreground">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-xs text-muted text-center mb-5">
          {mode === 'login'
            ? 'Log in to sync your RepTree workout data.'
            : 'Sign up to compete on leaderboards & track progression.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-xs font-semibold text-center leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-4 text-xs font-semibold text-center leading-relaxed">
            {successMessage}
          </div>
        )}

        {/* Google OAuth Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-surface border border-border hover:border-accent/50 text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition-all mb-4 disabled:opacity-50"
        >
          {/* Google Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </motion.button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border/80" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-border/80" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {/* Password Field with 👁️ Visibility Toggle */}
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-background border border-border rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-muted hover:text-foreground transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading || googleLoading}
            className="mt-2 bg-accent text-background font-bold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-xs text-muted">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('signup')
                setError(null)
                setSuccessMessage(null)
              }}
              className="hover:text-foreground transition-colors"
            >
              Don't have an account? <span className="text-accent font-semibold">Sign up</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccessMessage(null)
              }}
              className="hover:text-foreground transition-colors"
            >
              Already have an account? <span className="text-accent font-semibold">Log in</span>
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
