import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'
import { DEFAULT_SKILLS } from './useSkills'
import { computeEntryPoints } from '../utils/stats'
import type { Skill } from '../models/Skill'

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

export function useFriends(userLifetimePoints?: number, skills?: Skill[]) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<FriendProfile[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const skillsMap = new Map((skills && skills.length > 0 ? skills : DEFAULT_SKILLS).map((s) => [s.id, s]))

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
      .filter((f) => f.status === 'accepted')
      .map((f) => f.id)

    acceptedIds.push(user.id)

    const { data: pushups } = await supabase
      .from('pushup_entries')
      .select('user_id, amount, skill_id, skill_name')
      .in('user_id', acceptedIds)

    if (pushups) {
      const totals: Record<string, number> = {}
      pushups.forEach((p) => {
        const entryObj = {
          id: 'temp',
          amount: p.amount,
          skillId: p.skill_id,
          skillName: p.skill_name,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const pts = computeEntryPoints(entryObj, skillsMap)
        totals[p.user_id] = (totals[p.user_id] || 0) + pts
      })

      // Fetch profiles for usernames
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', acceptedIds)

      if (profiles) {
        const board: LeaderboardEntry[] = profiles.map((p) => {
          const isSelf = p.id === user.id
          const calculatedTotal = isSelf && typeof userLifetimePoints === 'number'
            ? userLifetimePoints
            : Math.round((totals[p.id] || 0) * 10) / 10
          return {
            id: p.id,
            username: isSelf ? p.username + ' (You)' : p.username,
            total: calculatedTotal,
          }
        })

        board.sort((a, b) => b.total - a.total)
        setLeaderboard(board)
      }
    }

    setLoading(false)
  }, [user, userLifetimePoints, skillsMap])

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
