import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePushups } from './hooks/usePushups'
import { FriendsScreen } from './screens/FriendsScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LoggingScreen } from './screens/LoggingScreen'
import { StatsScreen } from './screens/StatsScreen'
import { computeStats } from './utils/stats'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AuthScreen } from './components/AuthScreen'
import { CreateProfileScreen } from './components/CreateProfileScreen'
import { BottomTabBar, type Screen } from './components/BottomTabBar'
import { useAppTheme } from './hooks/useTheme'

function MainApp() {
  useAppTheme() // Initialize theme class on document element
  const { user, profile, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('home')
  const { entries, add, update, remove, loading: dataLoading } = usePushups(user?.id)
  const stats = useMemo(() => computeStats(entries), [entries])

  if (authLoading || (user && profile && dataLoading)) {
    return <div className="h-full flex items-center justify-center bg-background text-foreground">Loading...</div>
  }

  if (!user) {
    return (
      <div className="h-full w-full bg-black sm:bg-zinc-950 flex justify-center items-center">
        <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-3xl overflow-hidden">
          <AuthScreen />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-full w-full bg-black sm:bg-zinc-950 flex justify-center items-center">
        <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-3xl overflow-hidden">
          <CreateProfileScreen />
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen lifetimeTotal={stats.lifetimeTotal} todayTotal={stats.todayTotal} />
      case 'logging':
        return (
          <LoggingScreen
            entries={entries}
            onAdd={async (amt) => await add({ amount: amt })}
            onUpdate={async (id, amt) => await update(id, { amount: amt })}
            onDelete={async (id) => await remove(id)}
          />
        )
      case 'stats':
        return <StatsScreen stats={stats} />
      case 'friends':
        return <FriendsScreen />
      default:
        return null
    }
  }

  return (
    <div className="h-full w-full bg-black sm:bg-zinc-950 flex justify-center items-center overflow-hidden">
      <div className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-[2.5rem] overflow-hidden select-none">
        
        {/* Main Content Area (padding bottom so it doesn't overlap tab bar) */}
        <div className="relative h-full w-full pb-[calc(80px+env(safe-area-inset-bottom))]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Persistent Bottom Tab Bar */}
        <BottomTabBar currentScreen={screen} onNavigate={setScreen} />

      </div>
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
