import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill } from '../models/Skill'
import { useSkills } from '../hooks/useSkills'

interface FriendProfileModalProps {
  isOpen: boolean
  onClose: () => void
  friendUsername: string
  totalPoints: number
  totalReps: number
  friendSkills?: Skill[]
}

export function FriendProfileModal({
  isOpen,
  onClose,
  friendUsername,
  totalPoints,
  totalReps,
  friendSkills,
}: FriendProfileModalProps) {
  const { importAsNewProfile } = useSkills()
  const [exported, setExported] = useState(false)

  const displaySkills: Skill[] = friendSkills && friendSkills.length > 0
    ? friendSkills
    : [
        { id: 'f_pushups', name: 'Push-ups', domain: 'Push', pointsPerRep: 1, trackingType: 'reps', createdAt: new Date().toISOString() },
        { id: 'f_situps', name: 'Sit ups', domain: 'Core', pointsPerRep: 1, trackingType: 'reps', createdAt: new Date().toISOString() },
        { id: 'f_pullups', name: 'Pull ups', domain: 'Pull', pointsPerRep: 2, trackingType: 'reps', createdAt: new Date().toISOString() },
        { id: 'f_dips', name: 'Dips', domain: 'Push', pointsPerRep: 2, trackingType: 'reps', createdAt: new Date().toISOString() },
        { id: 'f_plank', name: 'Plank Hold', domain: 'Core', pointsPerRep: 1, trackingType: 'time', timeUnitSeconds: 30, createdAt: new Date().toISOString() },
        { id: 'f_lsit', name: 'L-Sit Hold', domain: 'Core', pointsPerRep: 1, trackingType: 'time', timeUnitSeconds: 10, createdAt: new Date().toISOString() },
        { id: 'f_muscleup', name: 'Muscle Up', domain: 'Pull', pointsPerRep: 10, trackingType: 'reps', createdAt: new Date().toISOString() },
      ]

  const handleExportScheme = () => {
    importAsNewProfile(`${friendUsername}'s Scheme Profile`, displaySkills)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-surface border border-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative max-h-[85dvh] flex flex-col my-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-bold text-base sm:text-lg flex items-center justify-center">
                  @{friendUsername.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">@{friendUsername}</h3>
                  <p className="text-[10px] sm:text-xs text-muted">Friend Profile & Points Scheme</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Total Summary */}
            <div className="grid grid-cols-2 gap-2.5 mb-4 shrink-0">
              <div className="bg-background border border-border/70 rounded-2xl p-2.5 text-center">
                <span className="text-xl sm:text-2xl font-black text-accent tabular-nums">
                  {totalPoints.toLocaleString()}
                </span>
                <span className="block text-[9px] sm:text-[10px] text-muted font-medium uppercase tracking-wider mt-0.5">
                  Total Points
                </span>
              </div>
              <div className="bg-background border border-border/70 rounded-2xl p-2.5 text-center">
                <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {totalReps.toLocaleString()}
                </span>
                <span className="block text-[9px] sm:text-[10px] text-muted font-medium uppercase tracking-wider mt-0.5">
                  Total Reps/Secs
                </span>
              </div>
            </div>

            {/* Points Scheme Table Header */}
            <div className="flex justify-between items-center mb-2 px-1 shrink-0">
              <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">
                Skill Points Scheme
              </h4>
              <span className="text-[10px] text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
                {displaySkills.length} skills tracked
              </span>
            </div>

            {/* Points Scheme List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {displaySkills.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="bg-background/80 border border-border/60 rounded-xl p-2.5 flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-muted">
                      Domain: {s.domain || 'Skill'}
                    </span>
                  </div>
                  <div className="text-right bg-accent/10 border border-accent/20 px-2 py-1 rounded-lg">
                    <span className="text-xs font-black text-accent tabular-nums">
                      {s.pointsPerRep || 1}
                    </span>
                    <span className="text-[10px] text-muted ml-1">
                      {s.trackingType === 'time' ? `pt/${s.timeUnitSeconds || 1}s` : 'pts/rep'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/60 flex justify-between items-center text-[10px] sm:text-[11px] text-muted shrink-0">
              <span>{exported ? '✅ Saved as secondary profile!' : 'Export to your workspace profiles'}</span>
              <button
                onClick={handleExportScheme}
                className="text-accent font-bold hover:underline"
              >
                Save Profile &rarr;
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

