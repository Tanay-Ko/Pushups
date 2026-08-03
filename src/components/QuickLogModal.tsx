import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill } from '../models/Skill'

interface QuickLogModalProps {
  isOpen: boolean
  onClose: () => void
  skills: Skill[]
  defaultSkillId?: string
  onAdd: (amount: number, skillId?: string, skillName?: string) => void
}

export function QuickLogModal({
  isOpen,
  onClose,
  skills,
  defaultSkillId,
  onAdd,
}: QuickLogModalProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    defaultSkillId || skills[0]?.id || 'pushups',
  )
  const [amount, setAmount] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  useEffect(() => {
    if (defaultSkillId) {
      setSelectedSkillId(defaultSkillId)
    } else if (skills.length > 0 && !selectedSkillId) {
      setSelectedSkillId(skills[0].id)
    }
  }, [defaultSkillId, skills, isOpen])

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0] || {
    id: 'pushups',
    name: 'Push-ups',
    domain: 'Push',
    trackingType: 'reps',
    pointsPerRep: 1,
  }

  const isTime = selectedSkill.trackingType === 'time'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(amount, 10)
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(Math.max(parsed, 1), 999999)
      onAdd(clamped, selectedSkill.id, selectedSkill.name)
      setAmount('')
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
        onClose()
      }, 700)
    }
  }

  const pointsPreview = useMemo(() => {
    const parsed = parseInt(amount, 10)
    if (isNaN(parsed) || parsed <= 0) return 0
    const clamped = Math.min(Math.max(parsed, 1), 999999)
    const pts = selectedSkill.pointsPerRep || 1
    if (isTime) {
      const unitSecs = selectedSkill.timeUnitSeconds || 1
      return Math.round((clamped / unitSecs) * pts * 10) / 10
    }
    return Math.round(clamped * pts * 10) / 10
  }, [amount, selectedSkill, isTime])

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
            className="w-full max-w-sm bg-surface border border-accent/50 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative my-auto max-h-[85dvh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Quick Log Set</h3>
                  <p className="text-[10px] sm:text-xs text-muted">Record set instantly</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-white/5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
              {showSuccessToast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-2 rounded-xl text-xs font-bold text-center shrink-0"
                >
                  🎉 Set logged! +{pointsPreview} points earned!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto pr-1 scrollbar-thin flex-1">
              {/* Skill Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Skill
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground font-semibold focus:outline-none focus:border-accent cursor-pointer"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.domain} • {s.pointsPerRep}pt/{s.trackingType === 'time' ? `${s.timeUnitSeconds || 1}s` : 'rep'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {isTime ? 'Duration in Seconds *' : 'Reps Count *'}
                  </label>
                  {pointsPreview > 0 && (
                    <span className="text-xs font-bold text-accent">
                      +{pointsPreview} Points
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={999999}
                  maxLength={6}
                  required
                  autoFocus
                  placeholder={isTime ? 'e.g. 30 (seconds)' : 'e.g. 15 (reps)'}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setAmount(val.slice(0, 6))
                  }}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-base font-bold tabular-nums text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-muted hover:text-foreground font-medium text-xs sm:text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-accent text-background font-bold text-xs sm:text-sm shadow-lg shadow-accent/20 transition-all"
                >
                  + Add Set
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
