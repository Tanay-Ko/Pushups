import { motion, AnimatePresence } from 'framer-motion'

interface OfflineIndicatorProps {
  isOnline: boolean
  pendingCount: number
}

export function OfflineIndicator({ isOnline, pendingCount }: OfflineIndicatorProps) {
  const showBanner = !isOnline || pendingCount > 0

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold"
          style={{
            background: isOnline
              ? 'rgba(16, 185, 129, 0.15)'  // syncing — green tint
              : 'rgba(239, 68, 68, 0.12)',  // offline — red tint
            borderBottom: isOnline
              ? '1px solid rgba(16,185,129,0.3)'
              : '1px solid rgba(239,68,68,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Pulse dot */}
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isOnline ? '#10b981' : '#ef4444' }}
          />

          {!isOnline ? (
            <span style={{ color: '#fca5a5' }}>
              Offline — workouts saved locally
            </span>
          ) : pendingCount > 0 ? (
            <span style={{ color: '#6ee7b7' }}>
              Syncing {pendingCount} pending workout{pendingCount !== 1 ? 's' : ''}…
            </span>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
