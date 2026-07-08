import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../hooks/useNotifications'
import { formatRelativeTime } from '../utils/dates'

export function NotificationsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="absolute inset-0 z-50 flex flex-col p-6 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={onClose}
        >
          <motion.div 
            className="w-full max-w-md mx-auto mt-12 bg-surface border border-border rounded-2xl p-6 shadow-xl flex flex-col max-h-[70vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onPointerDown={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Notifications</h2>
              <button onClick={onClose} className="p-2 text-muted hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-semibold text-accent self-end mb-4"
              >
                Mark all as read
              </button>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">You have no notifications right now.</p>
              ) : (
                notifications.map(notif => (
                  <motion.div 
                    key={notif.id}
                    className={`p-4 rounded-xl border ${notif.read ? 'bg-background border-border opacity-70' : 'bg-surface border-accent/30 shadow-sm'}`}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <p className={`text-sm ${notif.read ? 'text-muted' : 'text-foreground font-medium'}`}>
                        {notif.content}
                      </p>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[10px] text-muted mt-2">
                      {formatRelativeTime(new Date(notif.created_at))}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
