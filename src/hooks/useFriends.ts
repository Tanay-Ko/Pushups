import { useCallback, useEffect, useState, useMemo } from 'react'
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

  const skillsMap = useMemo(
    () => new Map((skills && skills.length > 0 ? skills : DEFAULT_SKILLS).map((s) => [s.id, s])),
    [skills],
  )

  const fetchFriends = useCallback(async () => {
    if (!user) return
    if (friends.length === 0 && leaderboard.length === 0) {
      setLoading(true)
    }

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

    const formattedFriends: FriendProfile[] = (friendships || [])
      .map((f: any): FriendProfile | null => {
        if (!f.requester || !f.addressee) return null
        const isRequester = f.requester.id === user.id
        const otherUser = isRequester ? f.addressee : f.requester
        if (!otherUser || !otherUser.id || !otherUser.username) return null

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
      .filter((f): f is FriendProfile => f !== null)

    setFriends(formattedFriends)

    // Fetch leaderboard stats (accepted friends only + self)
    const acceptedFriends = formattedFriends.filter((f) => f.status === 'accepted')
    const acceptedIds = acceptedFriends.map((f) => f.id)
    acceptedIds.push(user.id)

    const totals: Record<string, number> = {}

    const { data: pushups, error: pError } = await supabase
      .from('pushup_entries')
      .select('*')
      .in('user_id', acceptedIds)

    if (pError) {
      console.error('[Friends] pushup_entries fetch error:', pError)
    }

    if (pushups && pushups.length > 0) {
      pushups.forEach((p: any) => {
        const entryObj = {
          id: p.id || 'temp',
          amount: Number(p.amount) || 0,
          skillId: p.skill_id || 'f_pushups',
          skillName: p.skill_name || 'Push-ups',
          timestamp: p.timestamp || new Date().toISOString(),
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.created_at || new Date().toISOString(),
        }
        const pts = computeEntryPoints(entryObj, skillsMap)
        const effectivePts = pts > 0 ? pts : (Number(p.amount) || 0)
        totals[p.user_id] = (totals[p.user_id] || 0) + effectivePts
      })
    }

    // Fetch profiles for usernames
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', acceptedIds)

    const boardMap = new Map<string, LeaderboardEntry>()

    if (profiles) {
      profiles.forEach((p) => {
        const isSelf = p.id === user.id
        const calculatedTotal = isSelf && typeof userLifetimePoints === 'number'
          ? userLifetimePoints
          : Math.round((totals[p.id] || 0) * 10) / 10
        boardMap.set(p.id, {
          id: p.id,
          username: isSelf ? p.username + ' (You)' : p.username,
          total: calculatedTotal,
        })
      })
    }

    // Ensure self is in boardMap
    if (!boardMap.has(user.id)) {
      boardMap.set(user.id, {
        id: user.id,
        username: 'You',
        total: typeof userLifetimePoints === 'number' ? userLifetimePoints : 0,
      })
    }

    // Ensure all accepted friends are in boardMap
    acceptedFriends.forEach((f) => {
      if (!boardMap.has(f.id)) {
        boardMap.set(f.id, {
          id: f.id,
          username: f.username,
          total: Math.round((totals[f.id] || 0) * 10) / 10,
        })
      }
    })

    const board = Array.from(boardMap.values()).sort((a, b) => b.total - a.total)
    setLeaderboard(board)
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
