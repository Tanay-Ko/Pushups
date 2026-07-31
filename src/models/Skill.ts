export type SkillDomain = 'Push' | 'Pull' | 'Core' | 'Legs' | 'Skill' | string
export type SkillTrackingType = 'reps' | 'time'

export interface Skill {
  id: string
  name: string
  domain: SkillDomain
  pointsPerRep: number // Points awarded per rep or time interval
  trackingType?: SkillTrackingType // 'reps' (repetition count) or 'time' (duration in seconds)
  timeUnitSeconds?: number // For time skills: interval in seconds per points grant (e.g. 30 seconds = 1 point)
  previousSkillId?: string // Optional parent skill node ID for progression chain
  isDefault?: boolean
  createdAt: string
}

export type CreateSkillInput = Omit<Skill, 'id' | 'createdAt'> & {
  id?: string
  pointsPerRep?: number
  trackingType?: SkillTrackingType
  timeUnitSeconds?: number
}
