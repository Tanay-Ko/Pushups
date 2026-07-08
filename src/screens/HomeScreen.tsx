import { useState } from 'react'
import { motion } from 'framer-motion'
import { SettingsModal } from '../components/SettingsModal'
import { APP_NAME } from '../constants'
import { formatDate } from '../utils/dates'

interface HomeScreenProps {
  lifetimeTotal: number
  todayTotal: number
}

export function HomeScreen({ lifetimeTotal, todayTotal }: HomeScreenProps) {
  const today = new Date()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="flex flex-col h-full px-6 pt-safe relative">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <header className="pt-8 pb-4 flex justify-between items-center">
        <h1 className="text-sm font-medium tracking-widest text-muted uppercase">
          {APP_NAME}
        </h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-muted hover:text-foreground transition-colors p-2"
          onPointerDown={e => e.stopPropagation()} // Prevent triggering swipe
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </header>

      <motion.div 
        className="flex-1 flex flex-col items-center justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-sm text-muted">Lifetime</p>
        <motion.p 
          key={lifetimeTotal}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-7xl font-bold tabular-nums tracking-tight"
        >
          {lifetimeTotal.toLocaleString()}
        </motion.p>
        <p className="text-lg text-muted mt-2">pushups</p>

        <motion.div 
          className="mt-10 rounded-2xl bg-surface border border-border px-8 py-5 text-center cursor-pointer shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <p className="text-sm text-muted mb-1">Today</p>
          <motion.p 
            key={todayTotal}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-3xl font-semibold tabular-nums"
          >
            {todayTotal}
          </motion.p>
        </motion.div>

        <p className="text-sm text-muted mt-6">{formatDate(today)}</p>
      </motion.div>
    </div>
  )
}
