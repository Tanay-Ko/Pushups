import { useState } from 'react'
import { motion } from 'framer-motion'
import { SettingsModal } from '../components/SettingsModal'
import { NotificationsModal } from '../components/NotificationsModal'
import { TutorialModal } from '../components/TutorialModal'
import { APP_NAME } from '../constants'
import { APP_VERSION } from '../version'
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
  onNavigate?: (screen: 'home' | 'logging' | 'stats' | 'friends' | 'skills') => void
}

export function HomeScreen({
  lifetimePoints,
  todayPoints,
  retention,
  onSetRetention,
  onNavigate,
}: HomeScreenProps) {
  const today = new Date()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <div
      className="flex flex-col h-full px-6 pt-safe relative overflow-hidden"
      style={{
        background: '#060606',
        backgroundImage: 'radial-gradient(circle, rgba(40,40,40,0.6) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top ambient light — carbon chrome spotlight effect */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--theme-glow-strong, rgba(255,255,255,0.14)) 0%, transparent 70%)',
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        retention={retention}
        onSetRetention={onSetRetention}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <header className="pt-8 pb-4 flex justify-between items-center relative z-10">
        {/* Chrome accent bar left of title */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-0.5 h-4 rounded-full"
            style={{ background: 'linear-gradient(to bottom, var(--theme-gradient-start), var(--theme-gradient-end))' }}
          />
          <h1
            className="text-sm font-black tracking-[0.22em] uppercase"
            style={{ color: 'rgba(200,200,200,0.7)' }}
          >
            {APP_NAME}
          </h1>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--theme-text, rgba(255,255,255,0.7))',
            }}
          >
            v{APP_VERSION}
          </span>
        </div>
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
        className="flex-1 flex flex-col items-center justify-center gap-2 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* LIFETIME POINTS label */}
        <p
          className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
          style={{
            color: 'rgba(160,160,160,0.7)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          Lifetime Points
        </p>

        {/* BIG POINTS NUMBER — chrome gradient */}
        <motion.p
          key={lifetimePoints}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-gradient pb-1"
          style={{
            fontSize: 'clamp(4rem, 18vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 24px var(--theme-glow-strong, rgba(255,255,255,0.2)))',
          }}
        >
          {lifetimePoints.toLocaleString()}
        </motion.p>

        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'rgba(120,120,120,0.7)' }}
        >
          skill points earned
        </p>

        {/* HORIZONTAL DIVIDER — chrome rule */}
        <div
          className="w-24 h-px mt-6 mb-6"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }}
        />

        {/* TODAY CARD — strong glow border, clickable → stats */}
        <motion.div
          className="w-full rounded-2xl px-8 py-5 text-center cursor-pointer relative overflow-hidden"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate?.('stats')}
          title="View Stats"
          style={{
            background: 'rgba(15,15,15,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 0 32px var(--theme-glow, rgba(255,255,255,0.08)), 0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {/* Glow spot inside card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, var(--theme-glow, rgba(255,255,255,0.06)) 0%, transparent 60%)',
            }}
          />
          <p
            className="text-[10px] font-black uppercase tracking-[0.25em] mb-2"
            style={{ color: 'rgba(140,140,140,0.8)' }}
          >
            Today
          </p>
          <motion.p
            key={todayPoints}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-gradient"
            style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}
          >
            {todayPoints.toLocaleString()}
            <span
              className="ml-1.5"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(120,120,120,0.8)' }}
            >
              pts
            </span>
          </motion.p>
        </motion.div>

        <p
          className="text-[11px] mt-5"
          style={{ color: 'rgba(100,100,100,0.7)', letterSpacing: '0.05em' }}
        >
          {formatDate(today)}
        </p>
      </motion.div>
    </div>
  )
}
