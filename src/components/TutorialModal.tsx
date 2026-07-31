import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  onFinishTutorial?: () => void
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Welcome to Calisthenics & Pushups! 🎯',
    subtitle: 'Track your entire bodyweight fitness progression',
    icon: '🚀',
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <p>
          Welcome! This app tracks your complete calisthenics progression — from fundamental pushups & sit-ups to advanced moves like <strong className="text-foreground">Planches, Front Levers, Muscle-Ups</strong>, and <strong className="text-foreground">Handstands</strong>.
        </p>
        <div className="bg-background/60 border border-border p-3 rounded-2xl">
          <p className="text-xs text-accent font-bold mb-1">⭐ Key Concept: Difficulty Points</p>
          <p className="text-xs text-muted">
            Every exercise awards difficulty points! Earn points for reps (e.g., 10 Muscle-Ups = 100 pts) or isometric time holds (e.g., 30s Plank = 1 pt).
          </p>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: '5-Layer Skill Tree & Glowing Pathways 🌳',
    subtitle: 'Scale from Layer 0 Basics to Layer 4 Master Skills',
    icon: '🌿',
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <p>
          Head to the <strong className="text-foreground">Tree tab</strong> to view your interactive skill progression across 5 difficulty tiers:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-muted">
          <li><strong className="text-foreground">Layer 0 to 4:</strong> Progression flows from foundational roots (Layer 0) up to elite master moves (Layer 4).</li>
          <li><strong className="text-foreground">Glowing Pathways:</strong> Faint glowing lines connect prerequisite exercises to advanced progressions.</li>
          <li><strong className="text-foreground">Color Domains:</strong> Gold for Push, Blue for Pull, Emerald for Core, Rose for Legs, Purple for Skills.</li>
          <li><strong className="text-foreground">Customization:</strong> Add custom exercises, edit pathways, or clear nodes as you see fit.</li>
        </ul>
      </div>
    ),
  },
  {
    step: 3,
    title: 'Custom Points Schemes (Reps & Time) ⏱️',
    subtitle: 'Set custom difficulty multipliers & time intervals',
    icon: '⚖️',
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <p>
          Customize how points are calculated for any skill:
        </p>
        <div className="space-y-2 text-xs">
          <div className="bg-surface border border-border p-2.5 rounded-xl">
            <span className="font-bold text-foreground block">Repetition Exercises:</span>
            <span>Set integer points awarded per rep (e.g. 1 Pullup = 2 pts).</span>
          </div>
          <div className="bg-surface border border-border p-2.5 rounded-xl">
            <span className="font-bold text-foreground block">Isometric Time Holds:</span>
            <span>Set custom interval seconds (e.g. 1 point every 30 seconds for Plank Hold).</span>
          </div>
        </div>
        <p className="text-xs text-accent">
          * All points are rounded to the nearest tenth for precision (e.g., 45s Plank = 1.5 pts).
        </p>
      </div>
    ),
  },
  {
    step: 4,
    title: '⚡ Instant Quick Logging',
    subtitle: 'Log workouts on the fly without scrolling',
    icon: '⚡',
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <p>
          Never worry about scrolling! Look for the <strong className="text-foreground">⚡ Quick Log button</strong> floating at the bottom right of your screen.
        </p>
        <div className="bg-accent/10 border border-accent/30 p-3 rounded-2xl text-xs text-foreground font-medium">
          Tap ⚡ floating button &rarr; Select skill & reps/seconds &rarr; Tap "+ Add Set" to earn instant points!
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: 'Settings, Feed Cleaning & Friends 👥',
    subtitle: 'Manage card expiration and inspect friend points schemes',
    icon: '⚙️',
    content: (
      <div className="space-y-3 text-sm text-muted leading-relaxed">
        <ul className="list-disc list-inside space-y-2 text-xs text-muted">
          <li>
            <strong className="text-foreground">Feed Expiration Window:</strong> In Settings ⚙️, set recent log cards to clean up after 1 Day, 3 Days, or 1 Week (your lifetime stats & points are always 100% safe!).
          </li>
          <li>
            <strong className="text-foreground">Friends Leaderboard:</strong> Compete on total points and tap any friend to inspect their custom points scheme!
          </li>
          <li>
            <strong className="text-foreground">Replay Guide:</strong> Re-open this tutorial anytime via Settings ⚙️ &rarr; Open App Tutorial & Guide.
          </li>
        </ul>
      </div>
    ),
  },
]

export function TutorialModal({ isOpen, onClose, onFinishTutorial }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const stepData = TUTORIAL_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === TUTORIAL_STEPS.length - 1

  const handleFinish = () => {
    if (onFinishTutorial) {
      onFinishTutorial()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-surface border border-accent/40 rounded-3xl p-6 shadow-2xl overflow-hidden relative flex flex-col min-h-[440px]"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stepData.icon}</span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
                  Step {stepData.step} of {TUTORIAL_STEPS.length}
                </span>
                <h3 className="text-base font-bold text-foreground">{stepData.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Progress Indicators Bar */}
          <div className="flex gap-1.5 mb-4 shrink-0">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'bg-accent shadow-sm shadow-accent/50'
                    : idx < currentStep
                    ? 'bg-accent/40'
                    : 'bg-border/60'
                }`}
              />
            ))}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
            <p className="text-xs font-semibold text-accent/90 mb-2">{stepData.subtitle}</p>
            {stepData.content}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60 mt-4 shrink-0">
            <button
              disabled={isFirst}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2.5 rounded-2xl border border-border text-xs font-semibold transition-all ${
                isFirst ? 'opacity-30 cursor-not-allowed text-muted' : 'text-foreground hover:bg-white/5'
              }`}
            >
              &larr; Back
            </button>

            {isLast ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-2xl bg-accent text-background font-extrabold text-xs shadow-lg shadow-accent/20 flex items-center gap-1.5"
              >
                <span>Finish Tutorial</span>
                <span>🎉</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-2xl bg-accent text-background font-bold text-xs shadow-lg shadow-accent/20"
              >
                Next &rarr;
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
