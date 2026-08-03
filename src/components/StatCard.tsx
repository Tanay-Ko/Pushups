import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="rounded-2xl p-4 flex flex-col gap-1 cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(13,13,13,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.13)',
        boxShadow: '0 0 18px var(--theme-glow, rgba(255,255,255,0.06)), 0 4px 16px rgba(0,0,0,0.7)',
      }}
    >
      {/* Inner glow spot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--theme-glow, rgba(255,255,255,0.04)) 0%, transparent 60%)',
        }}
      />
      <span
        className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10"
        style={{ color: 'rgba(130,130,130,0.8)' }}
      >
        {label}
      </span>
      <motion.span
        key={value}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-gradient text-2xl font-black tabular-nums relative z-10"
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </motion.span>
    </motion.div>
  )
}
