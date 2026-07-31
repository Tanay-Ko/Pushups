import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  skillName: string
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({ isOpen, skillName, onClose, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm bg-surface border border-red-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1">Delete Skill Node?</h3>
            <p className="text-xs text-muted leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-foreground">{skillName}</strong>? Any connected progression skills will remain intact and link to its parent node.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-border text-muted hover:text-foreground font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-500/20 transition-all"
              >
                Delete Skill
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
