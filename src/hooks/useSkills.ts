import { useState, useEffect, useCallback } from 'react'
import type { Skill, CreateSkillInput } from '../models/Skill'

const STORAGE_KEY = 'calisthenics_skills_v4' // Incremented for timeUnitSeconds

export const DEFAULT_SKILLS: Skill[] = [
  // --- LAYER 0: BASE FUNDAMENTALS ---
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
    name: 'Bodyweight Squats',
    domain: 'Legs',
    pointsPerRep: 1,
    trackingType: 'reps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plank',
    name: 'Plank Hold',
    domain: 'Core',
    pointsPerRep: 1,
    trackingType: 'time',
    timeUnitSeconds: 30, // 1 point per 30 seconds
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // --- LAYER 1: INTERMEDIATE PROGRESSIONS ---
  {
    id: 'diamond-pushups',
    name: 'Diamond Pushups',
    domain: 'Push',
    pointsPerRep: 3,
    trackingType: 'reps',
    previousSkillId: 'pushups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'australian-rows',
    name: 'Australian Rows',
    domain: 'Pull',
    pointsPerRep: 2,
    trackingType: 'reps',
    previousSkillId: 'pullups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lsit',
    name: 'L-Sit Hold',
    domain: 'Core',
    pointsPerRep: 1,
    trackingType: 'time',
    timeUnitSeconds: 10, // 1 point per 10 seconds
    previousSkillId: 'situps',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pistol-prep',
    name: 'Pistol Squat Prep',
    domain: 'Legs',
    pointsPerRep: 3,
    trackingType: 'reps',
    previousSkillId: 'squats',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wall-handstand',
    name: 'Wall Handstand Hold',
    domain: 'Skill',
    pointsPerRep: 1,
    trackingType: 'time',
    timeUnitSeconds: 15, // 1 point per 15 seconds
    previousSkillId: 'pushups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // --- LAYER 2: ADVANCED PROGRESSIONS ---
  {
    id: 'archer-pushups',
    name: 'Archer Pushups',
    domain: 'Push',
    pointsPerRep: 5,
    trackingType: 'reps',
    previousSkillId: 'diamond-pushups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2b-pullups',
    name: 'Chest-to-Bar Pullups',
    domain: 'Pull',
    pointsPerRep: 4,
    trackingType: 'reps',
    previousSkillId: 'pullups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bar-dips',
    name: 'Straight Bar Dips',
    domain: 'Push',
    pointsPerRep: 4,
    trackingType: 'reps',
    previousSkillId: 'dips',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tuck-planche',
    name: 'Tuck Planche Hold',
    domain: 'Skill',
    pointsPerRep: 1,
    trackingType: 'time',
    timeUnitSeconds: 5, // 1 point per 5 seconds
    previousSkillId: 'wall-handstand',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tuck-front-lever',
    name: 'Tuck Front Lever',
    domain: 'Pull',
    pointsPerRep: 1,
    trackingType: 'time',
    timeUnitSeconds: 5, // 1 point per 5 seconds
    previousSkillId: 'australian-rows',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // --- LAYER 3: ELITE PROGRESSIONS ---
  {
    id: 'muscle-up',
    name: 'Muscle Up',
    domain: 'Pull',
    pointsPerRep: 10,
    trackingType: 'reps',
    previousSkillId: 'c2b-pullups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'one-arm-pushup',
    name: 'One Arm Pushup',
    domain: 'Push',
    pointsPerRep: 12,
    trackingType: 'reps',
    previousSkillId: 'archer-pushups',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adv-tuck-planche',
    name: 'Advanced Tuck Planche',
    domain: 'Skill',
    pointsPerRep: 2,
    trackingType: 'time',
    timeUnitSeconds: 5,
    previousSkillId: 'tuck-planche',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adv-tuck-front-lever',
    name: 'Adv Tuck Front Lever',
    domain: 'Pull',
    pointsPerRep: 2,
    trackingType: 'time',
    timeUnitSeconds: 5,
    previousSkillId: 'tuck-front-lever',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'free-hspu',
    name: 'Free Handstand Pushup',
    domain: 'Push',
    pointsPerRep: 12,
    trackingType: 'reps',
    previousSkillId: 'wall-handstand',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },

  // --- LAYER 4: MASTERY PROGRESSIONS ---
  {
    id: 'full-planche',
    name: 'Full Planche Hold',
    domain: 'Skill',
    pointsPerRep: 5,
    trackingType: 'time',
    timeUnitSeconds: 3, // 5 points per 3 seconds
    previousSkillId: 'adv-tuck-planche',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'full-front-lever',
    name: 'Full Front Lever Hold',
    domain: 'Pull',
    pointsPerRep: 5,
    trackingType: 'time',
    timeUnitSeconds: 3,
    previousSkillId: 'adv-tuck-front-lever',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'one-arm-pullup',
    name: 'One Arm Pullup',
    domain: 'Pull',
    pointsPerRep: 25,
    trackingType: 'reps',
    previousSkillId: 'muscle-up',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'iron-cross',
    name: 'Iron Cross Prep',
    domain: 'Skill',
    pointsPerRep: 10,
    trackingType: 'time',
    timeUnitSeconds: 3,
    previousSkillId: 'full-front-lever',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
]

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Skill[]
        if (parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Failed to load skills from localStorage:', e)
    }
    return DEFAULT_SKILLS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills))
    } catch (e) {
      console.error('Failed to save skills to localStorage:', e)
    }
  }, [skills])

  const addSkill = useCallback((input: CreateSkillInput): Skill => {
    const newSkill: Skill = {
      id: input.id || `skill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: input.name.trim(),
      domain: input.domain || 'Skill',
      pointsPerRep: input.pointsPerRep && input.pointsPerRep > 0 ? Math.round(input.pointsPerRep) : 1,
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

  return {
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    resetToDefaultWorkspace,
    getSkillById,
  }
}
