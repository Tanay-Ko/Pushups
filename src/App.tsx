import { useCallback, useMemo, useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { usePushups } from './hooks/usePushups'
import { SCREEN_TRANSITIONS, type Screen } from './hooks/useSwipeNavigation'
import { FriendsScreen } from './screens/FriendsScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LoggingScreen } from './screens/LoggingScreen'
import { StatsScreen } from './screens/StatsScreen'
import { computeStats } from './utils/stats'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AuthScreen } from './components/AuthScreen'
import { CreateProfileScreen } from './components/CreateProfileScreen'

function useViewport() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function MainApp() {
  const { user, profile, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('home')
  const { entries, add, update, remove, loading: dataLoading } = usePushups(user?.id)
  const stats = useMemo(() => computeStats(entries), [entries])
  const { width, height } = useViewport()

  const SCREEN_POSITIONS: Record<Screen, { x: number; y: number }> = {
    home: { x: 0, y: 0 },
    logging: { x: 0, y: -height },
    stats: { x: -width, y: 0 },
    friends: { x: width, y: 0 },
  }

  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const next = SCREEN_TRANSITIONS[screen][direction]
    if (next) setScreen(next)
  }, [screen])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    const { offset, velocity } = info
    
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x < -threshold || velocity.x < -500) navigate('left')
      else if (offset.x > threshold || velocity.x > 500) navigate('right')
    } else {
      if (offset.y < -threshold || velocity.y < -500) navigate('up')
      else if (offset.y > threshold || velocity.y > 500) navigate('down')
    }
  }

  const handleAdd = useCallback(
    async (amount: number) => { await add({ amount }) },
    [add],
  )

  const handleUpdate = useCallback(
    async (id: string, amount: number) => { await update(id, { amount }) },
    [update],
  )

  const handleDelete = useCallback(
    async (id: string) => { await remove(id) },
    [remove],
  )

  if (authLoading || (user && profile && dataLoading)) {
    return <div className="h-dvh flex items-center justify-center bg-background text-foreground">Loading...</div>
  }

  if (!user) {
    return <AuthScreen />
  }

  if (!profile) {
    return <CreateProfileScreen />
  }

  const currentPos = SCREEN_POSITIONS[screen]

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-foreground select-none touch-none relative">
      
      <AnimatePresence>
        {screen !== 'home' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-8 left-6 z-50 p-3 bg-surface border border-border rounded-full shadow-lg text-muted hover:text-foreground"
            onClick={() => setScreen('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </motion.button>
        )}
      </AnimatePresence>
      <motion.div
        className="relative h-full w-full"
        drag
        dragConstraints={{ 
          top: currentPos.y, 
          bottom: currentPos.y, 
          left: currentPos.x, 
          right: currentPos.x 
        }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={currentPos}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        <ScreenPanel position="home">
          <HomeScreen lifetimeTotal={stats.lifetimeTotal} todayTotal={stats.todayTotal} />
        </ScreenPanel>
        <ScreenPanel position="logging">
          <LoggingScreen
            entries={entries}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </ScreenPanel>
        <ScreenPanel position="stats">
          <StatsScreen stats={stats} />
        </ScreenPanel>
        <ScreenPanel position="friends">
          <FriendsScreen />
        </ScreenPanel>
      </motion.div>
    </div>
  )
}

function ScreenPanel({
  position,
  children,
}: {
  position: Screen
  children: ReactNode
}) {
  const positions: Record<Screen, string> = {
    home: 'inset-0',
    logging: 'left-0 right-0 top-full h-full',
    stats: 'top-0 bottom-0 left-full w-full',
    friends: 'top-0 bottom-0 right-full w-full',
  }

  return (
    <div className={`absolute ${positions[position]}`}>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
