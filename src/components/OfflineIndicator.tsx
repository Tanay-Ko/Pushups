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
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold"
          style={{
            bottom: 'calc(80px + env(safe-area-inset-bottom))',
            background: isOnline
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(239, 68, 68, 0.10)',
            borderTop: isOnline
              ? '1px solid rgba(16,185,129,0.25)'
              : '1px solid rgba(239,68,68,0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Pulse dot */}
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
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
