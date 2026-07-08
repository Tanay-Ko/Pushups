import { useState, useEffect } from 'react'

export type ThemeName = 'default' | 'neon' | 'cyberpunk' | 'ocean' | 'sunset'

export function useAppTheme() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem('app-theme') as ThemeName) || 'default'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-default', 'theme-neon', 'theme-cyberpunk', 'theme-ocean', 'theme-sunset')
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`)
    }
    localStorage.setItem('app-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
