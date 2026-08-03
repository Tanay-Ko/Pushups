import { useState, useEffect, useCallback } from 'react'
import type { Skill, CreateSkillInput } from '../models/Skill'

const MASTER_STORAGE_KEY = 'calisthenics_user_skills_master'
const PREVIOUS_STORAGE_KEYS = [
  'calisthenics_skills_v6',
  'calisthenics_skills_v5',
  'calisthenics_skills_v4',
  'calisthenics_skills_v3',
  'calisthenics_skills_v2',
  'calisthenics_skills_v1',
]

export const DEFAULT_SKILLS: Skill[] = [
  // --- LAYER 0 ---
  {
    id: 'pushups',
    name: 'Push-ups',
    domain: 'Push',
    pointsPerRep: 1,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'situps',
    name: 'Sit ups',
    domain: 'Core',
    pointsPerRep: 1,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'squats',
    name: 'Squats',
    domain: 'Legs',
    pointsPerRep: 1,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pullups',
    name: 'Pull-ups',
    domain: 'Pull',
    pointsPerRep: 2,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dips',
    name: 'Dips',
    domain: 'Push',
    pointsPerRep: 2,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // --- LAYER 1 (Above Pull-ups) ---
  {
    id: 'muscle-up',
    name: 'Muscle Up',
    domain: 'Pull',
    pointsPerRep: 10,
    trackingType: 'reps',
    previousSkillId: 'pullups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
]

function loadInitialSkills(): Skill[] {
  try {
    // 1. Try master storage key
    const master = localStorage.getItem(MASTER_STORAGE_KEY)
    if (master) {
      const parsed = JSON.parse(master) as Skill[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }

    // 2. Check previous version keys to preserve user custom nodes
    for (const key of PREVIOUS_STORAGE_KEYS) {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved) as Skill[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load saved skills workspace:', e)
  }

  return DEFAULT_SKILLS
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>(loadInitialSkills)

  // Auto-save workspace state on any update
  useEffect(() => {
    try {
      const payload = JSON.stringify(skills)
      localStorage.setItem(MASTER_STORAGE_KEY, payload)
      PREVIOUS_STORAGE_KEYS.forEach(key => {
        localStorage.setItem(key, payload)
      })
    } catch (e) {
      console.error('Failed to save skills workspace to localStorage:', e)
    }
  }, [skills])

  const addSkill = useCallback((input: CreateSkillInput): Skill => {
    const newSkill: Skill = {
      id: input.id || `skill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: input.name.trim(),
      domain: input.domain || 'Skill',
      pointsPerRep: input.pointsPerRep && input.pointsPerRep > 0 ? Math.round(input.pointsPerRep * 10) / 10 : 1,
      trackingType: input.trackingType || 'reps',
      timeUnitSeconds: input.timeUnitSeconds && input.timeUnitSeconds > 0 ? Math.round(input.timeUnitSeconds) : 1,
      previousSkillId: input.previousSkillId || undefined,
      isDefault: false,
      createdAt: new Date().toISOString(),
    }

    setSkills(prev => [...prev, newSkill])
    return newSkill
  }, [])

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setSkills(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const deleteSkill = useCallback((id: string) => {
    setSkills(prev => {
      const target = prev.find(s => s.id === id)
      const newParentId = target?.previousSkillId
      return prev
        .filter(s => s.id !== id)
        .map(s => (s.previousSkillId === id ? { ...s, previousSkillId: newParentId } : s))
    })
  }, [])

  const resetToDefaultWorkspace = useCallback(() => {
    setSkills(DEFAULT_SKILLS)
  }, [])

  const getSkillById = useCallback((id?: string) => {
    if (!id) return undefined
    return skills.find(s => s.id === id)
  }, [skills])

  const exportWorkspaceJSON = useCallback(() => {
    return JSON.stringify(skills, null, 2)
  }, [skills])

  const importWorkspaceJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as Skill[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSkills(parsed)
        return true
      }
    } catch (e) {
      console.error('Invalid JSON workspace format:', e)
    }
    return false
  }, [])

  return {
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    resetToDefaultWorkspace,
    getSkillById,
    exportWorkspaceJSON,
    importWorkspaceJSON,
  }
}
