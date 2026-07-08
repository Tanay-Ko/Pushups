import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'

export type Notification = {
  id: string
  type: 'milestone' | 'friend_request_received' | 'friend_request_accepted'
  content: string
  read: boolean
  created_at: string
}

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
    if (data) setNotifications(data as Notification[])
  }, [user])

  useEffect(() => {
    if (!user) return
    void fetchNotifications()

    const channelName = `notifications-${user.id}-${Math.random()}`
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        void fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchNotifications])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  
  const markAllAsRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
