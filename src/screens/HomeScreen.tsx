import { useState } from 'react'
import { motion } from 'framer-motion'
import { SettingsModal } from '../components/SettingsModal'
import { NotificationsModal } from '../components/NotificationsModal'
import { TutorialModal } from '../components/TutorialModal'
import { APP_NAME } from '../constants'
import { formatDate } from '../utils/dates'
import { useNotifications } from '../hooks/useNotifications'
import type { LogRetentionOption } from '../hooks/useLogRetention'

interface HomeScreenProps {
  lifetimePoints: number
  todayPoints: number
  lifetimeTotal?: number
  todayTotal?: number
  retention?: LogRetentionOption
  onSetRetention?: (retention: LogRetentionOption) => void
}

export function HomeScreen({
  lifetimePoints,
  todayPoints,
  retention,
  onSetRetention,
}: HomeScreenProps) {
  const today = new Date()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <div className="flex flex-col h-full px-6 pt-safe relative">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        retention={retention}
        onSetRetention={onSetRetention}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      
      <header className="pt-8 pb-4 flex justify-between items-center">
        <h1 className="text-sm font-medium tracking-widest text-muted uppercase">
          {APP_NAME}
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="text-muted hover:text-foreground transition-colors p-2 relative"
            onPointerDown={e => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-background flex items-center justify-center text-[10px] font-bold shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-muted hover:text-foreground transition-colors p-2"
            onPointerDown={e => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <motion.div 
        className="flex-1 flex flex-col items-center justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs text-muted font-bold uppercase tracking-widest bg-surface border border-border/80 px-3 py-1 rounded-full shadow-sm">
          Lifetime Points
        </p>
        <motion.p 
          key={lifetimePoints}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-7xl font-extrabold tabular-nums tracking-tight text-gradient drop-shadow-sm pb-1"
        >
          {lifetimePoints.toLocaleString()}
        </motion.p>
        <p className="text-sm text-muted">
          skill points earned
        </p>

        <motion.div 
          className="mt-8 rounded-2xl bg-surface border border-border px-8 py-4 text-center cursor-pointer shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <p className="text-xs text-muted mb-1 font-medium">Today Points</p>
          <motion.p 
            key={todayPoints}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-bold tabular-nums text-accent"
          >
            {todayPoints.toLocaleString()} <span className="text-sm font-normal text-muted">pts</span>
          </motion.p>
        </motion.div>

        <p className="text-xs text-muted mt-6">{formatDate(today)}</p>
      </motion.div>
    </div>
  )
}
