import { motion } from 'framer-motion'

export type Screen = 'home' | 'logging' | 'stats' | 'friends' | 'skills'

interface BottomTabBarProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export function BottomTabBar({ currentScreen, onNavigate }: BottomTabBarProps) {
  const tabs: { id: Screen; label: string; icon: (isActive: boolean) => React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "url(#activeGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'skills',
      label: 'Tree',
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "url(#activeGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'logging',
      label: 'Log',
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "url(#activeGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "url(#activeGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: (isActive) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? "url(#activeGradient)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ]

  return (
    <>
      {/* SVG gradient definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--theme-gradient-start)" />
            <stop offset="100%" stopColor="var(--theme-gradient-end)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Carbon & Chrome Tab Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-1 pb-safe z-50"
        style={{
          background: 'rgba(6,6,6,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.04) inset',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {tabs.map(tab => {
          const isActive = currentScreen === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 pt-3 pb-2 group"
            >
              {/* Active indicator line above icon */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                animate={{
                  width: isActive ? '28px' : '0px',
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  background: 'linear-gradient(to right, var(--theme-gradient-start), var(--theme-gradient-end))',
                  boxShadow: '0 0 8px var(--theme-glow-strong, rgba(255,255,255,0.3))',
                }}
              />

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.12 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ color: isActive ? undefined : 'rgba(90,90,90,0.9)' }}
              >
                {tab.icon(isActive)}
              </motion.div>

              {/* Label */}
              <motion.span
                className="text-[10px] font-semibold mt-1"
                animate={{ opacity: isActive ? 1 : 0.45 }}
                style={{
                  color: isActive ? 'var(--theme-accent)' : 'rgba(90,90,90,0.9)',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.label}
              </motion.span>
            </button>
          )
        })}
      </div>
    </>
  )
}
