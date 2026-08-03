import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AddPushupForm } from '../components/AddPushupForm'
import { LogEntry } from '../components/LogEntry'
import type { PushupEntry } from '../models/PushupEntry'
import type { Skill } from '../models/Skill'
import type { LogRetentionOption } from '../hooks/useLogRetention'

interface LoggingScreenProps {
  entries: PushupEntry[]
  skills: Skill[]
  onAdd: (amount: number, skillId?: string, skillName?: string) => void
  onUpdate: (id: string, amount: number) => void
  onDelete: (id: string) => void
  isWithinRetention?: (timestamp: string) => boolean
  retentionSetting?: LogRetentionOption
}

export function LoggingScreen({
  entries,
  skills,
  onAdd,
  onUpdate,
  onDelete,
  isWithinRetention,
  retentionSetting = '7-days',
}: LoggingScreenProps) {
  // Filter recent entries based on retention setting (cards expire/hide after retention period)
  const visibleEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    if (!isWithinRetention) return sorted
    return sorted.filter((e) => isWithinRetention(e.timestamp))
  }, [entries, isWithinRetention])

  const retentionLabel = retentionSetting === '1-day'
    ? '24 hours'
    : retentionSetting === '3-days'
    ? '3 days'
    : retentionSetting === '7-days'
    ? '1 week'
    : 'All Time'

  return (
    <div className="flex flex-col h-full px-6 pt-safe pb-safe">
      <header className="pt-8 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold">Log Workout</h2>
          <p className="text-sm text-muted mt-0.5">Record reps for any skill in your tree</p>
        </div>
        <span className="text-[10px] font-semibold text-muted bg-surface border border-border px-2.5 py-1 rounded-full">
          Showing: {retentionLabel}
        </span>
      </header>

      <AddPushupForm skills={skills} onAdd={onAdd} />

      <div className="flex-1 overflow-y-auto mt-5 space-y-3 pb-8">
        <AnimatePresence mode="popLayout">
          {visibleEntries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-surface/30 border border-border/50 rounded-2xl p-6"
            >
              <p className="text-sm text-muted">No recent workout cards</p>
              <p className="text-xs text-muted/70 mt-1">
                Workout cards expire after {retentionLabel} (configurable in Settings). All-time points remain saved in your stats!
              </p>
            </motion.div>
          ) : (
            visibleEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <LogEntry
                  entry={entry}
                  skills={skills}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
