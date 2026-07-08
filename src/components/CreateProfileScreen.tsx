import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { Card } from './Card'
import { useAuth } from '../hooks/useAuth'

export function CreateProfileScreen() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({ id: user.id, username: username.toLowerCase() })

      if (error) {
        if (error.code === '23505') throw new Error('Username is already taken.')
        throw error
      }
      
      // Force reload to grab the new profile in useAuth
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh px-6 justify-center items-center">
      <Card className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center">Pick a Username</h2>
        <p className="text-sm text-muted text-center mb-6">
          This is how your friends will find you.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading || username.length < 3}
            className="mt-2 bg-accent text-background font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </motion.button>
        </form>
      </Card>
    </div>
  )
}
