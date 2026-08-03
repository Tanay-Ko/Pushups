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
  isPasswordRecovery: boolean
  clearPasswordRecovery: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    // Check if current URL contains recovery hash fragment or type=recovery
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      setIsPasswordRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      let { data } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .maybeSingle()
      
      if (!data && userEmail) {
        // Auto-create missing profile row for user
        const baseUsername = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user'
        const defaultUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`
        const { data: created } = await supabase
          .from('profiles')
          .upsert({ id: userId, username: defaultUsername })
          .select('id, username')
          .single()
        data = created
      }

      setProfile(data || null)
    } catch (e) {
      console.error('Profile fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false)
  }

  const signOut = async () => {
    setIsPasswordRecovery(false)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
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
