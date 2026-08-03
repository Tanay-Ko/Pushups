import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { usePushups } from './hooks/usePushups'
import { useSkills } from './hooks/useSkills'
import { useLogRetention } from './hooks/useLogRetention'
import { useTreeSettings } from './hooks/useTreeSettings'
import { useTutorial } from './hooks/useTutorial'
import { computeStats } from './utils/stats'
import { HomeScreen } from './screens/HomeScreen'
import { LoggingScreen } from './screens/LoggingScreen'
import { StatsScreen } from './screens/StatsScreen'
import { FriendsScreen } from './screens/FriendsScreen'
import { SkillTreeScreen } from './screens/SkillTreeScreen'
import { AuthScreen } from './components/AuthScreen'
import { CreateProfileScreen } from './components/CreateProfileScreen'
import { BottomTabBar, type Screen } from './components/BottomTabBar'
import { useAppTheme } from './hooks/useTheme'
import { SettingsModal } from './components/SettingsModal'
import { NotificationsModal } from './components/NotificationsModal'
import { TutorialModal } from './components/TutorialModal'

function MainApp() {
  useAppTheme() // Initialize theme class on document element
  const { user, profile, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('home')
  const { entries, add, update, remove, loading: dataLoading } = usePushups(user?.id)
  const { skills, addSkill, updateSkill, deleteSkill, resetToDefaultWorkspace } = useSkills()
  const { retention, setRetention, isWithinRetention } = useLogRetention()
  const { viewMode, setViewMode } = useTreeSettings()
  const { isTutorialCompleted, completeTutorial, resetTutorial } = useTutorial()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const stats = useMemo(() => computeStats(entries, skills), [entries, skills])

  if (authLoading || (user && profile && dataLoading)) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  if (!profile) {
    return <CreateProfileScreen />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            lifetimePoints={stats.lifetimePoints}
            todayPoints={stats.todayPoints}
            lifetimeTotal={stats.lifetimeTotal}
            todayTotal={stats.todayTotal}
            retention={retention}
            onSetRetention={setRetention}
            onNavigate={setScreen}
          />
        )
      case 'skills':
        return (
          <SkillTreeScreen
            skills={skills}
            entries={entries}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onDeleteSkill={deleteSkill}
            onResetWorkspace={resetToDefaultWorkspace}
            onAddEntry={(amount, skillId, skillName) => add({ amount, skillId, skillName })}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
          />
        )
      case 'logging':
        return (
          <LoggingScreen
            entries={entries}
            skills={skills}
            onAdd={async (amt, sId, sName) => await add({ amount: amt, skillId: sId, skillName: sName })}
            onUpdate={async (id, amt) => await update(id, { amount: amt })}
            onDelete={async (id) => await remove(id)}
            isWithinRetention={isWithinRetention}
            retentionSetting={retention}
          />
        )
      case 'stats':
        return <StatsScreen entries={entries} skills={skills} />
      case 'friends':
        return <FriendsScreen />
      default:
        return null
    }
  }

  return (
    <div className="h-full w-full bg-[#030303] sm:bg-black flex justify-center items-center overflow-hidden">
      <div
        className="h-full w-full max-w-md bg-background text-foreground relative shadow-2xl sm:h-[90vh] sm:rounded-[2.5rem] overflow-hidden select-none"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.9)' }}
      >
        
        {/* Main Content Area */}
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

        {/* Floating Tutorial Button (Disappears when finished!) */}
        {!isTutorialCompleted && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsTutorialOpen(true)}
            className="fixed bottom-[calc(80px+env(safe-area-inset-bottom)+12px)] left-4 sm:left-6 z-40 w-32 sm:w-36 py-3 px-3 bg-surface border border-accent/60 text-foreground font-extrabold rounded-full shadow-2xl flex items-center justify-center gap-1.5 backdrop-blur-md"
          >
            <span className="text-xs sm:text-sm shrink-0">📖</span>
            <span className="text-[11px] sm:text-xs tracking-wide font-bold truncate">App Guide</span>
          </motion.button>
        )}

        {/* Global Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          retention={retention}
          onSetRetention={setRetention}
          onOpenTutorial={() => {
            resetTutorial()
            setIsTutorialOpen(true)
          }}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          onFinishTutorial={completeTutorial}
        />

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
