import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddPushupFormProps {
  onAdd: (amount: number) => void
}

export function AddPushupForm({ onAdd }: AddPushupFormProps) {
  const [amount, setAmount] = useState('')

  const submit = () => {
    const parsed = parseInt(amount, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onAdd(parsed)
      setAmount('')
    }
  }

  return (
    <div className="flex gap-3">
      <input
        type="number"
        inputMode="numeric"
        min={1}
        placeholder="How many?"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 text-lg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={submit}
        className="px-6 py-3 rounded-2xl bg-gradient text-white font-semibold shadow-lg shadow-accent/20 transition-all"
      >
        Add
      </motion.button>
    </div>
  )
}
