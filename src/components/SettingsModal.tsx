import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useAppTheme, type ThemeName } from '../hooks/useTheme'

import type { LogRetentionOption } from '../hooks/useLogRetention'
import { APP_VERSION, APP_BUILD_DATE } from '../version'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  retention?: LogRetentionOption
  onSetRetention?: (retention: LogRetentionOption) => void
  onOpenTutorial?: () => void
  onOpenReference?: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  retention,
  onSetRetention,
  onOpenTutorial,
  onOpenReference,
}: SettingsModalProps) {
  const { signOut, profile, user, isPasswordRecovery, clearPasswordRecovery } = useAuth()
  const { theme, setTheme } = useAppTheme()
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isPasswordRecovery) {
      setMessage('🔑 You logged in via Password Reset link! Enter your new password below to update your account.')
    }
  }, [isPasswordRecovery])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const sanitizedPassword = newPassword.trim()
    if (sanitizedPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: sanitizedPassword })
    
    if (error) {
      setError(error.message || 'Failed to update password.')
    } else {
      setMessage('🔒 Password updated successfully! Your account is now secured.')
      setNewPassword('')
      if (isPasswordRecovery) {
        clearPasswordRecovery()
      }
    }
    setLoading(false)
  }

  const themes: { id: ThemeName; label: string; color: string }[] = [
    { id: 'default', label: 'Silver', color: '#fafafa' },
    { id: 'neon', label: 'Neon', color: '#39ff14' },
    { id: 'cyberpunk', label: 'Cyber', color: '#ff00ff' },
    { id: 'ocean', label: 'Ocean', color: '#00e5ff' },
    { id: 'sunset', label: 'Sunset', color: '#ff3366' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Prevent touches from bubbling down to the drag container */}
          <motion.div 
            className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin"
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

            {/* App Guides */}
            <div className="mb-6 space-y-2">
              <p className="text-sm text-muted">App Guides & Tutorials</p>
              <div className="grid grid-cols-2 gap-2">
                {onOpenReference && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onClose()
                      onOpenReference()
                    }}
                    className="py-2.5 px-2 rounded-xl bg-surface border border-border text-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/5"
                  >
                    <span>📖</span>
                    <span>Quick Guide</span>
                  </motion.button>
                )}
                {onOpenTutorial && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onClose()
                      onOpenTutorial()
                    }}
                    className="py-2.5 px-2 rounded-xl bg-accent text-background font-extrabold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-1.5"
                  >
                    <span>🚀</span>
                    <span>Full Tour</span>
                  </motion.button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Theme</p>
              <div className="flex gap-2 justify-between bg-background border border-border rounded-xl p-2">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${theme === t.id ? 'bg-surface shadow-sm' : 'hover:bg-surface/50'}`}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-[10px] font-medium text-muted">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Log Card Expiration Setting */}
            <div className="mb-6">
              <p className="text-sm text-muted mb-1">Log Card Expiration</p>
              <p className="text-[11px] text-muted/80 mb-2">Duration logged workout cards remain visible on the Log tab</p>
              <div className="grid grid-cols-4 gap-1.5 bg-background border border-border rounded-xl p-1.5">
                {[
                  { id: '1-day', label: '1 Day' },
                  { id: '3-days', label: '3 Days' },
                  { id: '7-days', label: '1 Week' },
                  { id: 'never', label: 'Never' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSetRetention && onSetRetention(opt.id as any)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-colors ${
                      retention === opt.id
                        ? 'bg-accent text-background shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Notifications</p>
              <div className="bg-background border border-border rounded-xl px-4 py-2 flex flex-col divide-y divide-border mb-6">
                <NotificationToggle 
                  label="Friend Milestones (50+ pushups)" 
                  column="notify_milestones" 
                  userId={profile?.id} 
                />
                <NotificationToggle 
                  label="Friend Requests" 
                  column="notify_friend_requests" 
                  userId={profile?.id} 
                />
              </div>
              <p className="text-sm text-muted mb-2">Profile & Security</p>
              <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm flex justify-between items-center mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">@{profile?.username || 'user'}</span>
                  <span className="text-[10px] text-muted">{user?.email}</span>
                </div>
                <button onClick={() => { signOut(); onClose(); }} className="text-xs font-semibold text-red-400 hover:underline">Log Out</button>
              </div>
            </div>

            {/* Change Password Form with 👁️ Password Visibility Toggle */}
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>🔒</span> Update Password
              </p>
              {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
              {message && <p className="text-xs font-semibold text-emerald-400 leading-relaxed">{message}</p>}
              
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="New Password (min 8 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
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

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="mt-1 bg-accent text-background font-bold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>

            {/* Version Footer */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted/50">RepTree</span>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted/60">v{APP_VERSION}</span>
                <span className="block text-[9px] text-muted/40">{APP_BUILD_DATE}</span>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function NotificationToggle({ label, column, userId }: { label: string, column: string, userId?: string }) {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select(column).eq('id', userId).single()
      .then(({ data }) => {
        if (data) {
          setEnabled((data as any)[column])
        }
        setLoading(false)
      })
  }, [userId, column])

  const toggle = async () => {
    if (loading || !userId) return
    const next = !enabled
    setEnabled(next)
    await supabase.from('profiles').update({ [column]: next }).eq('id', userId)
  }

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-sm">{label}</span>
      <button 
        onClick={toggle}
        disabled={loading}
        className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-accent' : 'bg-border'}`}
      >
        <motion.div 
          className="absolute top-1 bottom-1 w-4 bg-background rounded-full"
          animate={{ left: enabled ? '24px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
