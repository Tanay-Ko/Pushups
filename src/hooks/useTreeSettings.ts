import { useState } from 'react'

export type TreeViewMode = 'node-graph' | 'cards'

const STORAGE_KEY = 'calisthenics_tree_view_mode_v1'

export function useTreeSettings() {
  const [viewMode, setViewModeState] = useState<TreeViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TreeViewMode
      if (saved && ['node-graph', 'cards'].includes(saved)) {
        return saved
      }
    } catch (e) {
      console.error('Failed to load tree view mode from localStorage:', e)
    }
    return 'node-graph'
  })

  const setViewMode = (mode: TreeViewMode) => {
    setViewModeState(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch (e) {
      console.error('Failed to save tree view mode:', e)
    }
  }

  return { viewMode, setViewMode }
}
