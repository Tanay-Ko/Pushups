import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { Card } from './Card'

type AuthMode = 'login' | 'signup' | 'magic_link'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const cleanEmail = email.trim()

    try {
      if (mode === 'magic_link') {
        // Passwordless magic link / Forgot password sign-in
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        setSuccessMessage('✨ Magic sign-in link sent to your email! Open the email on this device to log in automatically.')
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (error) throw error
      } else {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.')
        }
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full px-6 justify-center items-center">
      <Card className="w-full max-w-sm shadow-2xl border-accent/20">
        <h2 className="text-2xl font-extrabold mb-2 text-center text-foreground">
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'magic_link' && 'Passwordless Sign In'}
        </h2>
        <p className="text-xs text-muted text-center mb-6">
          {mode === 'login' && 'Log in to sync your pushups and skill tree.'}
          {mode === 'signup' && 'Sign up to compete with friends on leaderboard.'}
          {mode === 'magic_link' && 'Enter your email to receive a passwordless sign-in link.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl mb-4 text-xs font-semibold text-center leading-relaxed">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-bold text-muted uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {mode !== 'magic_link' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-muted uppercase">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="mt-2 bg-accent text-background font-bold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Log In' : (mode === 'signup' ? 'Sign Up' : 'Send Magic Link 📧')
            )}
          </motion.button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-xs text-muted">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('signup')}
                className="hover:text-foreground transition-colors"
              >
                Don't have an account? <span className="text-accent font-semibold">Sign up</span>
              </button>
              <button
                onClick={() => setMode('magic_link')}
                className="hover:text-foreground transition-colors text-[11px]"
              >
                Or sign in passwordlessly via email link
              </button>
            </>
          )}

          {mode === 'signup' && (
            <button
              onClick={() => setMode('login')}
              className="hover:text-foreground transition-colors"
            >
              Already have an account? <span className="text-accent font-semibold">Log in</span>
            </button>
          )}

          {mode === 'magic_link' && (
            <button
              onClick={() => setMode('login')}
              className="hover:text-foreground transition-colors text-accent font-semibold"
            >
              ← Back to standard Password Log In
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
