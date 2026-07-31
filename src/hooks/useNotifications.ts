import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'

export type Notification = {
  id: string
  type: 'milestone' | 'friend_request_received' | 'friend_request_accepted' | 'system_welcome'
  content: string
  read: boolean
  created_at: string
}

const WELCOME_NOTIFICATION_KEY = 'calisthenics_welcome_notif_v1'

const WELCOME_NOTIFICATION_CONTENT =
  'Welcome to Pushups & Calisthenics! 🎯 Tap Settings ⚙️ -> Open App Tutorial & Guide to learn how to navigate the 5-Layer Skill Tree, customize Points Schemes, and use Quick Logging!'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      let list = data as Notification[]
      // Check if user has a welcome notification; if not, create one!
      const hasWelcome = list.some((n) => n.type === 'system_welcome')
      if (!hasWelcome) {
        const welcomeObj: Notification = {
          id: `welcome_${user.id}_${Date.now()}`,
          type: 'system_welcome',
          content: WELCOME_NOTIFICATION_CONTENT,
          read: false,
          created_at: new Date().toISOString(),
        }
        list = [welcomeObj, ...list]
        // Try inserting into Supabase silently if supported
        void supabase.from('notifications').insert({
          user_id: user.id,
          type: 'system_welcome',
          content: WELCOME_NOTIFICATION_CONTENT,
          read: false,
        })
      }
      setNotifications(list)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      // Local/Offline mode fallback welcome notification
      try {
        const saved = localStorage.getItem(WELCOME_NOTIFICATION_KEY)
        if (saved) {
          setNotifications(JSON.parse(saved))
        } else {
          const initialWelcome: Notification[] = [
            {
              id: 'welcome_local_1',
              type: 'system_welcome',
              content: WELCOME_NOTIFICATION_CONTENT,
              read: false,
              created_at: new Date().toISOString(),
            },
          ]
          localStorage.setItem(WELCOME_NOTIFICATION_KEY, JSON.stringify(initialWelcome))
          setNotifications(initialWelcome)
        }
      } catch (e) {
        console.error('Local notification error:', e)
      }
      return
    }

    void fetchNotifications()

    const channelName = `notifications-${user.id}-${Math.random()}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          void fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchNotifications])

  const markAsRead = async (id: string) => {
    if (user) {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    }
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      if (!user) {
        try {
          localStorage.setItem(WELCOME_NOTIFICATION_KEY, JSON.stringify(next))
        } catch (e) {}
      }
      return next
    })
  }

  const markAllAsRead = async () => {
    if (user) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    }
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }))
      if (!user) {
        try {
          localStorage.setItem(WELCOME_NOTIFICATION_KEY, JSON.stringify(next))
        } catch (e) {}
      }
      return next
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
