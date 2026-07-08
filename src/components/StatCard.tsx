import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="rounded-2xl bg-surface border border-border p-4 flex flex-col gap-1 shadow-sm cursor-pointer"
    >
      <span className="text-sm text-muted">{label}</span>
      <motion.span 
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-2xl font-semibold tabular-nums"
      >
        {value}
      </motion.span>
    </motion.div>
  )
}
