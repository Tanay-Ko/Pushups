import type { SkillTrackingType } from './Skill'

export interface PushupEntry {
  id: string
  amount: number
  skillId?: string
  skillName?: string
  trackingType?: SkillTrackingType
  timestamp: string
  createdAt: string
  updatedAt: string
}

export type CreatePushupEntry = Pick<PushupEntry, 'amount'> & {
  skillId?: string
  skillName?: string
  trackingType?: SkillTrackingType
  timestamp?: string
}

export type UpdatePushupEntry = Partial<Pick<PushupEntry, 'amount' | 'skillId' | 'skillName' | 'trackingType' | 'timestamp'>>
