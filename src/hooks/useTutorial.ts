import { useState, useCallback } from 'react'

export function useTutorial(userId?: string) {
  // Key incorporates userId if logged in, so each user has their own completion state
  const storageKey = userId
    ? `calisthenics_tutorial_completed_${userId}_v3`
    : `calisthenics_tutorial_completed_guest_v3`

  const [isTutorialCompleted, setIsTutorialCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  const completeTutorial = useCallback(() => {
    setIsTutorialCompleted(true)
    try {
      localStorage.setItem(storageKey, JSON.stringify(true))
    } catch (e) {
      console.error('Failed to save tutorial completion:', e)
    }
  }, [storageKey])

  const resetTutorial = useCallback(() => {
    setIsTutorialCompleted(false)
    try {
      localStorage.setItem(storageKey, JSON.stringify(false))
    } catch (e) {
      console.error('Failed to reset tutorial completion:', e)
    }
  }, [storageKey])

  return { isTutorialCompleted, completeTutorial, resetTutorial }
}
