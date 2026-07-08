import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { Card } from './Card'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh px-6 justify-center items-center">
      <Card className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-muted text-center mb-6">
          {isLogin ? 'Log in to sync your pushups.' : 'Sign up to compete with friends.'}
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="mt-2 bg-accent text-background font-semibold py-3 rounded-xl"
          >
            {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </motion.button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 w-full text-sm text-muted hover:text-foreground transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </Card>
    </div>
  )
}
