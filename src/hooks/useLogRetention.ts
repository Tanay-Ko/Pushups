import { useState } from 'react'

export type LogRetentionOption = '1-day' | '3-days' | '7-days' | 'never'

const STORAGE_KEY = 'calisthenics_log_retention_v1'

export function useLogRetention() {
  const [retention, setRetentionState] = useState<LogRetentionOption>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LogRetentionOption
      if (saved && ['1-day', '3-days', '7-days', 'never'].includes(saved)) {
        return saved
      }
    } catch (e) {
      console.error('Failed to load log retention from localStorage:', e)
    }
    return '7-days'
  })

  const setRetention = (option: LogRetentionOption) => {
    setRetentionState(option)
    try {
      localStorage.setItem(STORAGE_KEY, option)
    } catch (e) {
      console.error('Failed to save log retention option:', e)
    }
  }

  // Helper method to check if a given timestamp is within the active retention window
  const isWithinRetention = (timestamp: string): boolean => {
    if (retention === 'never') return true
    const entryDate = new Date(timestamp).getTime()
    const now = new Date().getTime()
    const diffMs = now - entryDate

    switch (retention) {
      case '1-day':
        return diffMs <= 24 * 60 * 60 * 1000
      case '3-days':
        return diffMs <= 3 * 24 * 60 * 60 * 1000
      case '7-days':
        return diffMs <= 7 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  }

  return { retention, setRetention, isWithinRetention }
}
