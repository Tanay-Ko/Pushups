import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PushupEntry } from '../models/PushupEntry'
import { formatTime } from '../utils/dates'

interface LogEntryProps {
  entry: PushupEntry
  onUpdate: (id: string, amount: number) => void
  onDelete: (id: string) => void
}

export function LogEntry({ entry, onUpdate, onDelete }: LogEntryProps) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(entry.amount))

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
          <motion.span 
            key={entry.amount}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-semibold tabular-nums"
          >
            {entry.amount} pushups
          </motion.span>
        )}
        <span className="text-sm text-muted">{formatTime(entry.timestamp)}</span>
      </div>

      <div className="flex gap-2 shrink-0">
        {editing ? (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={save}
              className="px-3 py-1.5 rounded-xl bg-accent text-background text-sm font-medium"
            >
              Save
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={cancel}
              className="px-3 py-1.5 rounded-xl border border-border text-sm text-muted"
            >
              Cancel
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-xl border border-border text-sm"
            >
              Edit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(entry.id)}
              className="px-3 py-1.5 rounded-xl border border-border text-sm text-red-400"
            >
              Delete
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}
