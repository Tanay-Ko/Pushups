import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PushupEntry } from '../models/PushupEntry'
import type { Skill } from '../models/Skill'
import { formatTime } from '../utils/dates'
import { computeEntryPoints } from '../utils/stats'

interface LogEntryProps {
  entry: PushupEntry
  skills?: Skill[]
  onUpdate: (id: string, amount: number) => void
  onDelete: (id: string) => void
}

export function LogEntry({ entry, skills = [], onUpdate, onDelete }: LogEntryProps) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(entry.amount))

  const isTime = entry.trackingType === 'time'

  const skillsMap = useMemo(() => new Map(skills.map(s => [s.id, s])), [skills])
  const pointsEarned = useMemo(() => computeEntryPoints(entry, skillsMap), [entry, skillsMap])

  const save = () => {
    const parsed = parseInt(amount, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onUpdate(entry.id, parsed)
      setEditing(false)
    }
  }

  const cancel = () => {
    setAmount(String(entry.amount))
    setEditing(false)
  }

  return (
    <motion.div
      className="flex items-center justify-between gap-3 rounded-2xl bg-surface border border-border p-4 shadow-sm"
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        {editing ? (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 bg-background border border-border rounded-lg px-2 py-1 text-lg font-semibold tabular-nums focus:outline-none focus:border-accent"
            autoFocus
          />
        ) : (
          <motion.div
            key={entry.amount}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold tabular-nums text-foreground">
                {entry.amount}
                <span className="text-xs font-semibold text-accent ml-1">
                  {isTime ? 'sec hold' : 'reps'}
                </span>{' '}
                <span className="text-sm font-semibold text-muted">
                  {entry.skillName || 'Push-ups'}
                </span>
              </span>
              <span className="text-[10px] sm:text-xs font-black text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full tabular-nums">
                +{pointsEarned} pts
              </span>
            </div>
          </motion.div>
        )}
        <span className="text-xs text-muted/70">{formatTime(entry.timestamp)}</span>
      </div>

      <div className="flex gap-2 shrink-0">
        {editing ? (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={save}
              className="px-3 py-1.5 rounded-xl bg-accent text-background text-xs font-bold"
            >
              Save
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={cancel}
              className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted"
            >
              Cancel
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted hover:text-foreground"
            >
              Edit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(entry.id)}
              className="px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              Delete
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}
