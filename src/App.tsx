import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { usePushups } from './hooks/usePushups'
import { useSkills } from './hooks/useSkills'
import { useLogRetention } from './hooks/useLogRetention'
import { useTreeSettings } from './hooks/useTreeSettings'
import { useTutorial } from './hooks/useTutorial'
import { useBackgroundRefresh } from './hooks/useBackgroundRefresh'
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
import { OfflineIndicator } from './components/OfflineIndicator'

import { useTournaments } from './hooks/useTournaments'

function MainApp() {
  useAppTheme() // Initialize theme class on document element
  const { user, profile, loading: authLoading, isOffline: authIsOffline } = useAuth()
  const [screen, setScreen] = useState<Screen>('home')
  const { entries, add, update, remove, backgroundRefresh, isOnline, pendingCount } = usePushups(user?.id)
  const {
    skills,
    mainSkills,
    profiles,
    activeProfileId,
    setActiveProfileId,
    addSkill,
    updateSkill,
    deleteSkill,
    resetToDefaultWorkspace,
  } = useSkills()
  const { tournaments, activeTournament, toggleActiveTournament, addTournamentPoints } = useTournaments()
  const { retention, setRetention, isWithinRetention } = useLogRetention()
  const { viewMode, setViewMode } = useTreeSettings()
  const { isTutorialCompleted, completeTutorial, resetTutorial } = useTutorial(user?.id)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const stats = useMemo(() => computeStats(entries, skills), [entries, skills])

  // Dual tracking handler when active tournament mode is enabled
  const handleAddWorkoutEntry = async (amount: number, skillId?: string, skillName?: string) => {
    if (!activeTournament) {
      await add({ amount, skillId, skillName })
      return
    }

    // Active Tournament Mode!
    const tSkill =
      activeTournament.skills.find((s) => s.id === skillId || s.name === skillName) ||
      activeTournament.skills[0]
    const ptsPerUnit = tSkill.pointsPerRep || 1
    let pointsEarned = amount * ptsPerUnit
    if (tSkill.trackingType === 'time') {
      const unitSecs = tSkill.timeUnitSeconds || 1
      pointsEarned = (amount / unitSecs) * ptsPerUnit
    }
    pointsEarned = Math.round(pointsEarned * 10) / 10

    // Add points to tournament leaderboard
    addTournamentPoints(activeTournament.id, pointsEarned)

    // Check exercise mapping
    const mappedMainSkillId = activeTournament.exerciseMappings[tSkill.id]
    const mappedMainSkill =
      mainSkills.find((s) => s.id === mappedMainSkillId) ||
      mainSkills.find((s) => s.name === tSkill.name)

    if (mappedMainSkill) {
      await add({ amount, skillId: mappedMainSkill.id, skillName: mappedMainSkill.name })
    } else {
      await add({ amount, skillId, skillName })
    }
  }

  // Silent background sync when app returns to foreground or device reconnects
  useBackgroundRefresh(backgroundRefresh, !!user?.id)

  // Only show loading screen on very first auth check
  if (authLoading) {
    const offline = !navigator.onLine
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-5 px-10 text-center"
        style={{
          background: '#060606',
          backgroundImage: 'radial-gradient(circle, rgba(40,40,40,0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {offline ? (
          <>
            {/* Offline icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold mb-1" style={{ color: '#f0f0f0' }}>
                You're offline
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(140,140,140,0.9)' }}>
                Connect to the internet to sign in or create an account.
              </p>
            </div>
            <p className="text-xs" style={{ color: 'rgba(90,90,90,0.8)' }}>
              Already signed in? The app will load automatically once you're connected.
            </p>
          </>
        ) : (
          /* Online but still initialising */
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        )}
      </div>
    )
  }

  // Least-privilege offline gate:
  if (!user) {
    return <AuthScreen />
  }

  if (!profile && !authIsOffline) {
    return <CreateProfileScreen />
  }

  if (!profile && authIsOffline) {
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-muted">You're offline. Connect to the internet to finish setting up your account.</p>
      </div>
    )
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
            skills={activeTournament ? activeTournament.skills : skills}
            entries={entries}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchProfile={setActiveProfileId}
            tournaments={tournaments}
            activeTournament={activeTournament}
            onToggleTournament={toggleActiveTournament}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onDeleteSkill={deleteSkill}
            onResetWorkspace={resetToDefaultWorkspace}
            onAddEntry={handleAddWorkoutEntry}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
          />
        )
      case 'logging':
        return (
          <LoggingScreen
            entries={entries}
            skills={activeTournament ? activeTournament.skills : skills}
            onAdd={handleAddWorkoutEntry}
            onUpdate={async (id, amt) => await update(id, { amount: amt })}
            onDelete={async (id) => await remove(id)}
            isWithinRetention={isWithinRetention}
            retentionSetting={retention}
            activeTournamentName={activeTournament?.name}
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

        {/* Offline / Sync Banner — sits above the tab bar, clear of Dynamic Island */}
        <OfflineIndicator isOnline={isOnline} pendingCount={pendingCount} />

        {/* Persistent Bottom Tab Bar */}
        <BottomTabBar currentScreen={screen} onNavigate={setScreen} />

        {/* Floating Tutorial Button (Persists during experimentation; hides only when explicitly completed) */}
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
