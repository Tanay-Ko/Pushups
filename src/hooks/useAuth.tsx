import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

interface Profile {
  id: string
  username: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isOffline: boolean
  isPasswordRecovery: boolean
  clearPasswordRecovery: () => void
  signOut: () => Promise<void>
}

const AUTH_CACHE_KEY = 'reptree_auth_cache_v1'

interface AuthCache {
  userId: string
  email?: string
  profile: Profile | null
}

function readAuthCache(): AuthCache | null {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY)
    return raw ? (JSON.parse(raw) as AuthCache) : null
  } catch {
    return null
  }
}

function writeAuthCache(data: AuthCache): void {
  try {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[AuthCache] Failed to write:', e)
  }
}

function clearAuthCache(): void {
  localStorage.removeItem(AUTH_CACHE_KEY)
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isOffline: false,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // Track online/offline for auth decisions
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (!navigator.onLine) setIsOffline(true)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Check for password recovery hash
    if (
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    ) {
      setIsPasswordRecovery(true)
    }

    const init = async () => {
      // If offline at startup, skip Supabase entirely — go straight to cache
      if (!navigator.onLine) {
        console.log('[Auth] Offline at startup — restoring from cache')
        restoreFromCache()
        return
      }

      // Safety timeout: if Supabase takes longer than 4s, fall back to cache
      const timeout = setTimeout(() => {
        console.warn('[Auth] getSession timeout — falling back to cache')
        restoreFromCache()
      }, 4000)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        clearTimeout(timeout)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email)
        } else if (!navigator.onLine) {
          restoreFromCache()
        } else {
          setLoading(false)
        }
      } catch (e) {
        clearTimeout(timeout)
        console.warn('[Auth] getSession failed (offline?) — restoring from cache:', e)
        restoreFromCache()
      }
    }

    void init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }

      if (event === 'SIGNED_OUT') {
        clearAuthCache()
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        void fetchProfile(session.user.id, session.user.email)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /** Restore auth state from localStorage cache when offline */
  const restoreFromCache = () => {
    const cached = readAuthCache()
    if (cached) {
      console.log('[Auth] Restored session from offline cache for user:', cached.userId)
      // Synthetic user object with just enough for the app to function
      setUser({ id: cached.userId, email: cached.email } as User)
      setProfile(cached.profile)
    }
    // If no cache — user was never logged in on this device, stay logged-out
    setLoading(false)
  }

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      let { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle()

      if (!data && userEmail) {
        // Auto-create missing profile row
        const baseUsername =
          userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user'
        const defaultUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`
        const { data: created } = await supabase
          .from('profiles')
          .upsert({ id: userId, username: defaultUsername })
          .select('id, username')
          .single()
        data = created
      }

      setProfile(data || null)

      // Cache auth state so we can restore it offline
      if (data) {
        writeAuthCache({ userId, email: userEmail, profile: data })
      }
    } catch (e) {
      console.error('[Auth] Profile fetch error (offline?):', e)
      // Try cache before giving up
      const cached = readAuthCache()
      if (cached?.userId === userId) {
        setProfile(cached.profile)
      }
    } finally {
      setLoading(false)
    }
  }

  const clearPasswordRecovery = () => setIsPasswordRecovery(false)

  const signOut = async () => {
    setIsPasswordRecovery(false)
    clearAuthCache()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isOffline,
        isPasswordRecovery,
        clearPasswordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
