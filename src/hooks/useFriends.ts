import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'

export interface FriendProfile {
  id: string
  username: string
  status: 'pending_sent' | 'pending_received' | 'accepted' | 'none'
  friendshipId?: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  total: number
}

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<FriendProfile[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Fetch all friendships for this user
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        requester:profiles!requester_id(id, username),
        addressee:profiles!addressee_id(id, username)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const formattedFriends: FriendProfile[] = friendships.map((f: any) => {
      const isRequester = f.requester.id === user.id
      const otherUser = isRequester ? f.addressee : f.requester
      
      let status: FriendProfile['status'] = 'none'
      if (f.status === 'accepted') status = 'accepted'
      else if (f.status === 'pending') {
        status = isRequester ? 'pending_sent' : 'pending_received'
      }

      return {
        id: otherUser.id,
        username: otherUser.username,
        status,
        friendshipId: f.id,
      }
    })

    setFriends(formattedFriends)

    // Fetch leaderboard stats (accepted friends only + self)
    const acceptedIds = formattedFriends
      .filter(f => f.status === 'accepted')
      .map(f => f.id)
    
    acceptedIds.push(user.id)

    const { data: pushups } = await supabase
      .from('pushup_entries')
      .select('user_id, amount')
      .in('user_id', acceptedIds)

    if (pushups) {
      const totals: Record<string, number> = {}
      pushups.forEach(p => {
        totals[p.user_id] = (totals[p.user_id] || 0) + p.amount
      })

      // We need usernames for the leaderboard
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', acceptedIds)
      
      if (profiles) {
        const board: LeaderboardEntry[] = profiles.map(p => ({
          id: p.id,
          username: p.id === user.id ? p.username + ' (You)' : p.username,
          total: totals[p.id] || 0,
        }))
        
        board.sort((a, b) => b.total - a.total)
        setLeaderboard(board)
      }
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    void fetchFriends()
  }, [fetchFriends])

  const sendRequest = async (targetUserId: string) => {
    if (!user) return
    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: 'pending'
      })
    if (!error) await fetchFriends()
  }

  const acceptRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    if (!error) await fetchFriends()
  }

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
    if (!error) await fetchFriends()
  }

  const searchUsers = async (query: string) => {
    if (!query || !user) return []
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .limit(5)
    
    if (error) return []
    return data
  }

  return {
    friends,
    leaderboard,
    loading,
    sendRequest,
    acceptRequest,
    removeFriend,
    searchUsers,
    refresh: fetchFriends
  }
}
