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

const READ_NOTIF_IDS_KEY = 'calisthenics_read_notifications_master_v1'
const WELCOME_NOTIFICATION_KEY = 'calisthenics_welcome_notif_v1'

const WELCOME_NOTIFICATION_CONTENT =
  'Welcome to RepTree! 🎯 Tap Settings ⚙️ -> Open App Tutorial & Guide to learn how to navigate the Skill Tree, customize Points Schemes, and use Quick Logging!'

function getSavedReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_NOTIF_IDS_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch (e) {
    console.error('Failed to read notification state:', e)
  }
  return new Set()
}

function saveReadIds(idsSet: Set<string>) {
  try {
    localStorage.setItem(READ_NOTIF_IDS_KEY, JSON.stringify(Array.from(idsSet)))
  } catch (e) {
    console.error('Failed to save read notifications:', e)
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    const readIds = getSavedReadIds()

    if (!user) {
      // Local / guest mode
      try {
        const saved = localStorage.getItem(WELCOME_NOTIFICATION_KEY)
        let list: Notification[] = []
        if (saved) {
          list = JSON.parse(saved)
        } else {
          list = [
            {
              id: 'welcome_local_1',
              type: 'system_welcome',
              content: WELCOME_NOTIFICATION_CONTENT,
              read: false,
              created_at: new Date().toISOString(),
            },
          ]
        }
        list = list.map(n => (readIds.has(n.id) ? { ...n, read: true } : n))
        setNotifications(list)
      } catch (e) {
        console.error('Local notification error:', e)
      }
      return
    }

    // Supabase authenticated mode
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .neq('type', 'milestone')
      .order('created_at', { ascending: false })
      .limit(50)

    let list: Notification[] = ((data as Notification[]) || []).filter((n) => n.type !== 'milestone')

    // Ensure welcome notification exists
    const hasWelcome = list.some((n) => n.type === 'system_welcome')
    if (!hasWelcome) {
      const welcomeId = `welcome_${user.id}`
      const welcomeObj: Notification = {
        id: welcomeId,
        type: 'system_welcome',
        content: WELCOME_NOTIFICATION_CONTENT,
        read: readIds.has(welcomeId),
        created_at: new Date().toISOString(),
      }
      list = [welcomeObj, ...list]
    }

    // Apply persistent read state
    list = list.map((n) => (readIds.has(n.id) ? { ...n, read: true } : n))
    setNotifications(list)
  }, [user])

  useEffect(() => {
    void fetchNotifications()

    if (!user) return

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
    const readIds = getSavedReadIds()
    readIds.add(id)
    saveReadIds(readIds)

    if (user && !id.startsWith('welcome_')) {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const markAllAsRead = async () => {
    const readIds = getSavedReadIds()
    notifications.forEach((n) => readIds.add(n.id))
    saveReadIds(readIds)

    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
