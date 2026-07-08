import { motion } from 'framer-motion'
import type { Screen } from '../hooks/useSwipeNavigation'

interface NavigationHandlesProps {
  currentScreen: Screen
}

export function NavigationHandles({ currentScreen }: NavigationHandlesProps) {
  // Common handle styles
  const bounceTransition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }

  // Handle components
  const LeftHandle = ({ icon, delay = 0 }: { icon: React.ReactNode, delay?: number }) => (
    <motion.div
      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-surface border border-border border-l-0 rounded-r-2xl flex items-center justify-center shadow-lg z-50 text-muted"
      animate={{ x: [0, 4, 0] }}
      transition={{ ...bounceTransition, delay }}
    >
      {icon}
    </motion.div>
  )

  const RightHandle = ({ icon, delay = 0 }: { icon: React.ReactNode, delay?: number }) => (
    <motion.div
      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-surface border border-border border-r-0 rounded-l-2xl flex items-center justify-center shadow-lg z-50 text-muted"
      animate={{ x: [0, -4, 0] }}
      transition={{ ...bounceTransition, delay }}
    >
      {icon}
    </motion.div>
  )

  const BottomHandle = ({ icon, delay = 0 }: { icon: React.ReactNode, delay?: number }) => (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-10 bg-surface border border-border border-b-0 rounded-t-2xl flex flex-col items-center justify-center shadow-lg z-50 pb-safe text-muted"
      animate={{ y: [0, -4, 0] }}
      transition={{ ...bounceTransition, delay }}
    >
      {icon}
    </motion.div>
  )

  const TopHandle = ({ icon, delay = 0 }: { icon: React.ReactNode, delay?: number }) => (
    <motion.div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-10 bg-surface border border-border border-t-0 rounded-b-2xl flex flex-col items-center justify-center shadow-lg z-50 pt-safe text-muted"
      animate={{ y: [0, 4, 0] }}
      transition={{ ...bounceTransition, delay }}
    >
      {icon}
    </motion.div>
  )

  // Icons
  const FriendsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  )

  const StatsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  )

  const LoggingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )

  const HomeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  )

  if (currentScreen === 'home') {
    return (
      <>
        <LeftHandle icon={FriendsIcon} />
        <RightHandle icon={StatsIcon} delay={1.5} />
        <BottomHandle icon={LoggingIcon} delay={0.75} />
      </>
    )
  }

  if (currentScreen === 'stats') {
    return <LeftHandle icon={HomeIcon} />
  }

  if (currentScreen === 'friends') {
    return <RightHandle icon={HomeIcon} />
  }

  if (currentScreen === 'logging') {
    return <TopHandle icon={HomeIcon} />
  }

  return null
}
