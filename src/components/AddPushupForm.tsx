import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill } from '../models/Skill'

interface AddPushupFormProps {
  skills: Skill[]
  onAdd: (amount: number, skillId?: string, skillName?: string) => void
}

export function AddPushupForm({ skills, onAdd }: AddPushupFormProps) {
  const [amount, setAmount] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || 'pushups')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedSkill = useMemo(() => {
    return (
      skills.find((s) => s.id === selectedSkillId) ||
      skills[0] || { id: 'pushups', name: 'Push-ups', domain: 'Push', trackingType: 'reps' }
    )
  }, [skills, selectedSkillId])

  const isTimeSkill = selectedSkill.trackingType === 'time'

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills
    const q = searchQuery.toLowerCase().trim()
    return skills.filter(
      (s) => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q),
    )
  }, [skills, searchQuery])

  const submit = () => {
    const parsed = parseInt(amount, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onAdd(parsed, selectedSkill.id, selectedSkill.name)
      setAmount('')
    }
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex gap-2 relative">
        {/* Skill Selector Button */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-full bg-surface border border-border hover:border-accent/50 rounded-2xl px-3.5 py-3 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="max-w-[110px] truncate">{selectedSkill.name}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.button>
        </div>

        {/* Input for Reps or Time (Seconds) */}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder={isTimeSkill ? 'Duration in seconds?' : 'How many reps?'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 text-base placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          className="px-5 py-3 rounded-2xl bg-accent text-background font-bold text-sm shadow-lg shadow-accent/20 transition-all shrink-0"
        >
          Add
        </motion.button>
      </div>

      {/* Searchable Skill Dropdown Overlay */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 w-72 z-50 bg-surface border border-border/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl"
          >
            {/* Search Input */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs placeholder:text-muted focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            {/* Skills List */}
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {filteredSkills.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No skills found</p>
              ) : (
                filteredSkills.map((skill) => {
                  const isSelected = skill.id === selectedSkill.id
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        setSelectedSkillId(skill.id)
                        setIsDropdownOpen(false)
                        setSearchQuery('')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-accent/20 text-accent font-bold'
                          : 'hover:bg-background/80 text-foreground'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">{skill.name}</span>
                        <span className="text-[10px] text-muted">
                          {skill.trackingType === 'time' ? 'Time (secs)' : 'Reps'} • {skill.pointsPerRep || 1} pts
                        </span>
                      </div>
                      <span className="text-[10px] text-muted bg-background/50 px-1.5 py-0.5 rounded">
                        {skill.domain}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
