import type { Skill } from './Skill'

export interface TournamentMember {
  id: string
  username: string
  points: number
  avatarUrl?: string
}

export interface Tournament {
  id: string
  name: string
  description: string
  creatorUsername: string
  endDate?: string
  skills: Skill[]
  exerciseMappings: Record<string, string> // tournamentSkillId -> mainSkillId
  members: TournamentMember[]
  createdAt: string
}
