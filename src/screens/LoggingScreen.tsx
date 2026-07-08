import { motion, AnimatePresence } from 'framer-motion'
import { AddPushupForm } from '../components/AddPushupForm'
import { LogEntry } from '../components/LogEntry'
import type { PushupEntry } from '../models/PushupEntry'

interface LoggingScreenProps {
  entries: PushupEntry[]
  onAdd: (amount: number) => void
  onUpdate: (id: string, amount: number) => void
  onDelete: (id: string) => void
}

export function LoggingScreen({ entries, onAdd, onUpdate, onDelete }: LoggingScreenProps) {
  const chronological = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="flex flex-col h-full px-6 pt-safe pb-safe">
      <header className="pt-8 pb-6">
        <h2 className="text-2xl font-semibold">Log Pushups</h2>
        <p className="text-sm text-muted mt-1">Add, edit, or delete entries</p>
      </header>

      <AddPushupForm onAdd={onAdd} />

      <div className="flex-1 overflow-y-auto mt-6 space-y-3 pb-8">
        <AnimatePresence mode="popLayout">
          {chronological.length === 0 ? (
            <motion.p 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted py-12"
            >
              No entries yet
            </motion.p>
          ) : (
            chronological.map((entry) => (
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
