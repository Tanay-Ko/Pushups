import { useEffect } from 'react'

/**
 * Calls the provided `refresh` function silently whenever:
 * 1. The page becomes visible again (user switches back to the app tab/PWA)
 * 2. The browser comes back online
 *
 * The refresh is intentionally NOT accompanied by any loading state change,
 * so the UI keeps showing cached data while the background fetch runs.
 */
export function useBackgroundRefresh(refresh: () => Promise<void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }

    const handleOnline = () => {
      void refresh()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
    }
  }, [refresh, enabled])
}
