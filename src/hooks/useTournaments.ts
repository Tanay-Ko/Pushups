import { useState, useEffect, useCallback } from 'react'
import type { Tournament, TournamentMember } from '../models/Tournament'
import type { Skill } from '../models/Skill'
import { DEFAULT_SKILLS } from './useSkills'
import { useAuth } from './useAuth'

const TOURNAMENTS_STORAGE_KEY = 'calisthenics_tournaments_v1'
const ACTIVE_TOURNAMENT_KEY = 'calisthenics_active_tournament_id_v1'

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourney_community_pushups_2026',
    name: 'Community Pushup Showdown 🔥',
    description: 'Shared tournament scheme! All pushups logged count towards the shared leaderboard.',
    creatorUsername: 'CalisthenicsAdmin',
    endDate: '2026-12-31',
    skills: DEFAULT_SKILLS.map((s) => ({
      ...s,
      pointsPerRep: s.id === 'pushups' ? 2 : s.pointsPerRep, // Slightly tweaked points for tourney
    })),
    exerciseMappings: {
      pushups: 'pushups',
      pullups: 'pullups',
      squats: 'squats',
      situps: 'situps',
      dips: 'dips',
      'muscle-up': 'muscle-up',
    },
    members: [
      { id: 'user_1', username: 'Alex_G', points: 340 },
      { id: 'user_2', username: 'SarahFit', points: 280 },
      { id: 'user_3', username: 'IronMike', points: 195 },
    ],
    createdAt: new Date().toISOString(),
  },
]

function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(TOURNAMENTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to load tournaments:', e)
  }
  return DEFAULT_TOURNAMENTS
}

function loadActiveTournamentId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TOURNAMENT_KEY) || null
  } catch {
    return null
  }
}

export function useTournaments() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>(loadTournaments)
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(loadActiveTournamentId)

  const currentUsername = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Me'

  // Persist tournaments
  useEffect(() => {
    try {
      localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(tournaments))
    } catch (e) {
      console.error('Failed to persist tournaments:', e)
    }
  }, [tournaments])

  // Persist active tournament id
  useEffect(() => {
    try {
      if (activeTournamentId) {
        localStorage.setItem(ACTIVE_TOURNAMENT_KEY, activeTournamentId)
      } else {
        localStorage.removeItem(ACTIVE_TOURNAMENT_KEY)
      }
    } catch (e) {
      console.error('Failed to persist active tournament ID:', e)
    }
  }, [activeTournamentId])

  const activeTournament = tournaments.find((t) => t.id === activeTournamentId) || null

  const createTournament = useCallback(
    (name: string, description: string, endDate?: string, initialSkills?: Skill[]) => {
      const newTourney: Tournament = {
        id: `tourney_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        description: description.trim(),
        creatorUsername: currentUsername,
        endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        skills: initialSkills && initialSkills.length > 0 ? initialSkills : DEFAULT_SKILLS,
        exerciseMappings: {},
        members: [{ id: user?.id || 'me', username: currentUsername, points: 0 }],
        createdAt: new Date().toISOString(),
      }

      setTournaments((prev) => [newTourney, ...prev])
      setActiveTournamentId(newTourney.id)
      return newTourney
    },
    [currentUsername, user?.id],
  )

  const joinTournament = useCallback(
    (tournamentId: string) => {
      setTournaments((prev) =>
        prev.map((t) => {
          if (t.id !== tournamentId) return t
          const memberId = user?.id || 'me'
          const exists = t.members.some((m) => m.id === memberId || m.username === currentUsername)
          if (exists) return t
          const newMember: TournamentMember = {
            id: memberId,
            username: currentUsername,
            points: 0,
          }
          return { ...t, members: [...t.members, newMember] }
        }),
      )
    },
    [currentUsername, user?.id],
  )

  const toggleActiveTournament = useCallback((tournamentId: string | null) => {
    setActiveTournamentId((prev) => (prev === tournamentId ? null : tournamentId))
  }, [])

  // Collaborative editing of tournament shared scheme
  const updateTournamentSkills = useCallback((tournamentId: string, updatedSkills: Skill[]) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, skills: updatedSkills } : t)),
    )
  }, [])

  // Update exercise mapping (tournamentSkillId -> mainSkillId)
  const setExerciseMapping = useCallback(
    (tournamentId: string, tournamentSkillId: string, mainSkillId: string) => {
      setTournaments((prev) =>
        prev.map((t) => {
          if (t.id !== tournamentId) return t
          const updatedMappings = { ...t.exerciseMappings, [tournamentSkillId]: mainSkillId }
          return { ...t, exerciseMappings: updatedMappings }
        }),
      )
    },
    [],
  )

  // Record points to tournament member score
  const addTournamentPoints = useCallback(
    (tournamentId: string, pointsEarned: number) => {
      setTournaments((prev) =>
        prev.map((t) => {
          if (t.id !== tournamentId) return t
          const memberId = user?.id || 'me'
          let foundMember = false
          const updatedMembers = t.members.map((m) => {
            if (m.id === memberId || m.username === currentUsername) {
              foundMember = true
              return { ...m, points: m.points + pointsEarned }
            }
            return m
          })
          if (!foundMember) {
            updatedMembers.push({ id: memberId, username: currentUsername, points: pointsEarned })
          }
          return { ...t, members: updatedMembers.sort((a, b) => b.points - a.points) }
        }),
      )
    },
    [currentUsername, user?.id],
  )

  return {
    tournaments,
    activeTournamentId,
    activeTournament,
    createTournament,
    joinTournament,
    toggleActiveTournament,
    updateTournamentSkills,
    setExerciseMapping,
    addTournamentPoints,
  }
}
