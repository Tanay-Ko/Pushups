import { motion } from 'framer-motion'

export type Screen = 'home' | 'logging' | 'stats' | 'friends'

interface BottomTabBarProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomTabBar({ currentScreen, onNavigate }: BottomTabBarProps) {
  const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'logging',
      label: 'Log',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border flex justify-around items-end px-2 pb-safe z-50">
      {tabs.map(tab => {
        const isActive = currentScreen === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-col items-center justify-center w-16 pt-3 pb-2"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0,
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={isActive ? 'text-accent' : 'text-muted'}
            >
              {tab.icon}
            </motion.div>
            <span 
              className={`text-[10px] font-medium mt-1 transition-colors ${isActive ? 'text-accent' : 'text-muted'}`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
