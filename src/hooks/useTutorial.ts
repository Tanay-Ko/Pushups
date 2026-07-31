import { useState, useCallback } from 'react'

const STORAGE_KEY = 'calisthenics_tutorial_completed_v1'

export function useTutorial() {
  const [isTutorialCompleted, setIsTutorialCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  const completeTutorial = useCallback(() => {
    setIsTutorialCompleted(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(true))
    } catch (e) {
      console.error('Failed to save tutorial completion:', e)
    }
  }, [])

  const resetTutorial = useCallback(() => {
    setIsTutorialCompleted(false)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(false))
    } catch (e) {
      console.error('Failed to reset tutorial completion:', e)
    }
  }, [])

  return { isTutorialCompleted, completeTutorial, resetTutorial }
}
