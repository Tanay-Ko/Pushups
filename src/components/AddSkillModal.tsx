import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill, CreateSkillInput, SkillTrackingType } from '../models/Skill'

interface AddSkillModalProps {
  isOpen: boolean
  onClose: () => void
  skills: Skill[]
  onAddSkill: (input: CreateSkillInput) => void
  editingSkill?: Skill | null
  onUpdateSkill?: (id: string, updates: Partial<Skill>) => void
}

const DOMAIN_OPTIONS = ['Push', 'Pull', 'Core', 'Legs', 'Skill', 'Custom']

export function AddSkillModal({
  isOpen,
  onClose,
  skills,
  onAddSkill,
  editingSkill,
  onUpdateSkill,
}: AddSkillModalProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('Push')
  const [customDomain, setCustomDomain] = useState('')
  const [previousSkillId, setPreviousSkillId] = useState('')
  const [pointsPerRep, setPointsPerRep] = useState('1')
  const [trackingType, setTrackingType] = useState<SkillTrackingType>('reps')
  const [timeUnitSeconds, setTimeUnitSeconds] = useState('30')

  useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name)
      if (DOMAIN_OPTIONS.includes(editingSkill.domain)) {
        setDomain(editingSkill.domain)
        setCustomDomain('')
      } else {
        setDomain('Custom')
        setCustomDomain(editingSkill.domain)
      }
      setPreviousSkillId(editingSkill.previousSkillId || '')
      setPointsPerRep(String(Math.round(editingSkill.pointsPerRep || 1)))
      setTrackingType(editingSkill.trackingType || 'reps')
      setTimeUnitSeconds(String(editingSkill.timeUnitSeconds || 30))
    } else {
      setName('')
      setDomain('Push')
      setCustomDomain('')
      setPreviousSkillId('')
      setPointsPerRep('1')
      setTrackingType('reps')
      setTimeUnitSeconds('30')
    }
  }, [editingSkill, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const finalDomain = domain === 'Custom' ? (customDomain.trim() || 'Custom') : domain
    const parsedPoints = parseInt(pointsPerRep, 10)
    const validPoints = !isNaN(parsedPoints) && parsedPoints > 0 ? parsedPoints : 1

    const parsedSeconds = parseInt(timeUnitSeconds, 10)
    const validSeconds = !isNaN(parsedSeconds) && parsedSeconds > 0 ? parsedSeconds : 1

    if (editingSkill && onUpdateSkill) {
      onUpdateSkill(editingSkill.id, {
        name: name.trim(),
        domain: finalDomain,
        previousSkillId: previousSkillId || undefined,
        pointsPerRep: validPoints,
        trackingType: trackingType,
        timeUnitSeconds: trackingType === 'time' ? validSeconds : undefined,
      })
    } else {
      onAddSkill({
        name: name.trim(),
        domain: finalDomain,
        previousSkillId: previousSkillId || undefined,
        pointsPerRep: validPoints,
        trackingType: trackingType,
        timeUnitSeconds: trackingType === 'time' ? validSeconds : undefined,
      })
    }

    onClose()
  }

  const availablePreviousSkills = skills.filter((s) => !editingSkill || s.id !== editingSkill.id)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-surface border border-border/80 rounded-3xl p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {editingSkill ? 'Edit Skill Node' : 'Add Skill Node'}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {editingSkill ? 'Update skill properties & points' : 'Expand your calisthenics skill tree'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 scrollbar-thin flex-1">
              {/* Skill Name */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plank Hold, Archer Pushup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Tracking Type */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Tracking Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-background border border-border rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackingType('reps')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      trackingType === 'reps'
                        ? 'bg-accent text-background shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Reps (Count)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingType('time')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      trackingType === 'time'
                        ? 'bg-accent text-background shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    Time (Hold Duration)
                  </button>
                </div>
              </div>

              {/* Points Configuration */}
              {trackingType === 'reps' ? (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Points Per Rep (Whole Integer) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      required
                      placeholder="1"
                      value={pointsPerRep}
                      onChange={(e) => setPointsPerRep(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-28 bg-background border border-border rounded-2xl px-4 py-3 text-sm font-extrabold text-accent focus:outline-none focus:border-accent"
                    />
                    <p className="text-[11px] text-muted leading-tight">
                      Points earned for every single rep performed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-background/50 border border-border p-3.5 rounded-2xl">
                  <div>
                    <label className="block text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                      Time Points Weighting Scheme *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground font-semibold">Earn</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={pointsPerRep}
                        onChange={(e) => setPointsPerRep(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-16 bg-background border border-border rounded-xl px-2.5 py-2 text-xs font-extrabold text-accent text-center"
                      />
                      <span className="text-xs text-foreground font-semibold">point(s) every</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={timeUnitSeconds}
                        onChange={(e) => setTimeUnitSeconds(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-20 bg-background border border-border rounded-xl px-2.5 py-2 text-xs font-extrabold text-accent text-center"
                      />
                      <span className="text-xs text-foreground font-semibold">seconds</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted leading-snug">
                    Example: Earn 1 point every 30 seconds (a 45s Plank = 1.5 points, rounded to nearest tenth!).
                  </p>
                </div>
              )}

              {/* Domain / Category */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Domain / Category
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {DOMAIN_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDomain(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        domain === d
                          ? 'bg-accent text-background font-semibold shadow-sm'
                          : 'bg-background border border-border text-muted hover:text-foreground'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {domain === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom domain..."
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs placeholder:text-muted focus:outline-none focus:border-accent mt-1"
                  />
                )}
              </div>

              {/* Previous Skill */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Previous Progression Skill (Parent Link)
                </label>
                <select
                  value={previousSkillId}
                  onChange={(e) => setPreviousSkillId(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="">None (Root Node)</option>
                  {availablePreviousSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.domain})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-border text-muted hover:text-foreground font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-accent text-background font-bold text-sm shadow-lg shadow-accent/20 transition-all"
                >
                  {editingSkill ? 'Save Changes' : 'Add Node'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
