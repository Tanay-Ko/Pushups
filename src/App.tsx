import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
import { NavigationHandles } from './components/NavigationHandles'

function MainApp() {
  const { user, profile, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('home')
  const { entries, add, update, remove, loading: dataLoading } = usePushups(user?.id)
  const stats = useMemo(() => computeStats(entries), [entries])

  const SCREEN_POSITIONS: Record<Screen, { x: string; y: string }> = {
    home: { x: '0%', y: '0%' },
    logging: { x: '0%', y: '-100%' },
    stats: { x: '-100%', y: '0%' },
    friends: { x: '100%', y: '0%' },
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
    return (
      <div className="h-dvh w-full bg-black sm:bg-zinc-950 flex justify-center items-center">
        <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-3xl overflow-hidden">
          <AuthScreen />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-dvh w-full bg-black sm:bg-zinc-950 flex justify-center items-center">
        <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-3xl overflow-hidden">
          <CreateProfileScreen />
        </div>
      </div>
    )
  }

  const currentPos = SCREEN_POSITIONS[screen]

  return (
    <div className="h-dvh w-full bg-black sm:bg-zinc-950 flex justify-center items-center overflow-hidden">
      <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-[2.5rem] overflow-hidden select-none touch-none">
        
        <NavigationHandles currentScreen={screen} />

        <motion.div
          className="relative h-full w-full"
          drag
          dragConstraints={{ 
            top: 0, 
            bottom: 0, 
            left: 0, 
            right: 0 
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
