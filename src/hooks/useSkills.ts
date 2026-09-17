import { useState, useEffect, useCallback } from 'react'
import type { Skill, CreateSkillInput } from '../models/Skill'

const MASTER_STORAGE_KEY = 'calisthenics_user_skills_master'
const PROFILES_STORAGE_KEY = 'calisthenics_scheme_profiles_v1'
const PREVIOUS_STORAGE_KEYS = [
  'calisthenics_skills_v6',
  'calisthenics_skills_v5',
  'calisthenics_skills_v4',
  'calisthenics_skills_v3',
  'calisthenics_skills_v2',
  'calisthenics_skills_v1',
]

export interface SchemeProfile {
  id: string
  name: string
  skills: Skill[]
  isMain?: boolean
  createdAt: string
}

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

function loadInitialMainSkills(): Skill[] {
  try {
    const master = localStorage.getItem(MASTER_STORAGE_KEY)
    if (master) {
      const parsed = JSON.parse(master) as Skill[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }

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

function loadSavedProfiles(): SchemeProfile[] {
  try {
    const saved = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as SchemeProfile[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed to load scheme profiles:', e)
  }
  return []
}

export function useSkills() {
  const [mainSkills, setMainSkills] = useState<Skill[]>(loadInitialMainSkills)
  const [profiles, setProfiles] = useState<SchemeProfile[]>(loadSavedProfiles)
  const [activeProfileId, setActiveProfileId] = useState<string>('main')

  // Auto-save main workspace
  useEffect(() => {
    try {
      const payload = JSON.stringify(mainSkills)
      localStorage.setItem(MASTER_STORAGE_KEY, payload)
      PREVIOUS_STORAGE_KEYS.forEach(key => {
        localStorage.setItem(key, payload)
      })
    } catch (e) {
      console.error('Failed to save main skills workspace:', e)
    }
  }, [mainSkills])

  // Auto-save profiles registry
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
    } catch (e) {
      console.error('Failed to save scheme profiles registry:', e)
    }
  }, [profiles])

  // Get active skills
  const activeProfile = profiles.find(p => p.id === activeProfileId)
  const skills = activeProfileId === 'main' ? mainSkills : (activeProfile?.skills || mainSkills)

  const setSkillsForActiveProfile = (updater: (prev: Skill[]) => Skill[]) => {
    if (activeProfileId === 'main') {
      setMainSkills(updater)
    } else {
      setProfiles(prev =>
        prev.map(p => (p.id === activeProfileId ? { ...p, skills: updater(p.skills) } : p))
      )
    }
  }

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

    setSkillsForActiveProfile(prev => [...prev, newSkill])
    return newSkill
  }, [activeProfileId])

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setSkillsForActiveProfile(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }, [activeProfileId])

  const deleteSkill = useCallback((id: string) => {
    setSkillsForActiveProfile(prev => {
      const target = prev.find(s => s.id === id)
      const newParentId = target?.previousSkillId
      return prev
        .filter(s => s.id !== id)
        .map(s => (s.previousSkillId === id ? { ...s, previousSkillId: newParentId } : s))
    })
  }, [activeProfileId])

  const resetToDefaultWorkspace = useCallback(() => {
    setSkillsForActiveProfile(() => DEFAULT_SKILLS)
  }, [activeProfileId])

  const getSkillById = useCallback((id?: string) => {
    if (!id) return undefined
    return skills.find(s => s.id === id)
  }, [skills])

  const exportWorkspaceJSON = useCallback(() => {
    return JSON.stringify(skills, null, 2)
  }, [skills])

  // Legacy import - imports into active profile or prompts export profile creation
  const importWorkspaceJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as Skill[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSkillsForActiveProfile(() => parsed)
        return true
      }
    } catch (e) {
      console.error('Invalid JSON workspace format:', e)
    }
    return false
  }, [activeProfileId])

  // Safe import into a new secondary profile without overwriting Main
  const importAsNewProfile = useCallback((profileName: string, importedSkills: Skill[]) => {
    const newProfile: SchemeProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: profileName.trim() || 'Imported Scheme',
      skills: importedSkills,
      isMain: false,
      createdAt: new Date().toISOString(),
    }

    setProfiles(prev => [...prev, newProfile])
    setActiveProfileId(newProfile.id)
    return newProfile
  }, [])

  const deleteProfile = useCallback((id: string) => {
    if (id === 'main') return // Cannot delete main profile
    setProfiles(prev => prev.filter(p => p.id !== id))
    if (activeProfileId === id) {
      setActiveProfileId('main')
    }
  }, [activeProfileId])

  const allProfiles: SchemeProfile[] = [
    {
      id: 'main',
      name: 'Main Profile (Default)',
      skills: mainSkills,
      isMain: true,
      createdAt: new Date().toISOString(),
    },
    ...profiles,
  ]

  return {
    skills,
    mainSkills,
    profiles: allProfiles,
    activeProfileId,
    setActiveProfileId,
    addSkill,
    updateSkill,
    deleteSkill,
    resetToDefaultWorkspace,
    getSkillById,
    exportWorkspaceJSON,
    importWorkspaceJSON,
    importAsNewProfile,
    deleteProfile,
  }
}

