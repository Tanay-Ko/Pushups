import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { signOut, profile } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setNewPassword('')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Prevent touches from bubbling down to the drag container */}
          <motion.div 
            className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onPointerDown={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={onClose} className="p-2 text-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Profile</p>
              <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm flex justify-between items-center">
                <span>@{profile?.username}</span>
                <button onClick={() => { signOut(); onClose(); }} className="text-xs font-semibold text-red-400">Log Out</button>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
              <p className="text-sm text-muted mb-1">Change Password</p>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {message && <p className="text-xs text-green-400">{message}</p>}
              <input
                type="password"
                required
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="mt-2 bg-accent text-background font-semibold py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
