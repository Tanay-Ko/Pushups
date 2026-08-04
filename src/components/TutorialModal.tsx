import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  onFinishTutorial?: () => void
  isInteractiveFlow?: boolean // If true, running first-time full 2-min interactive guided tour
}

// ----------------------------------------------------
// 1. FULL INTERACTIVE 2-MINUTE ONBOARDING GUIDED TOUR
// ----------------------------------------------------
const INTERACTIVE_STEPS = [
  {
    step: 1,
    title: 'Why Log Home Workouts? 🚀',
    subtitle: 'The secret to progressive overload & visible results at home',
    icon: '🔥',
    badge: '2-Min Onboarding',
    pointerTarget: 'bottom-tabs',
    pointerText: 'Explore your navigation bar below',
    content: (
      <div className="space-y-3.5 text-xs text-muted leading-relaxed">
        <p>
          Starting bodyweight fitness at home? The biggest hurdle isn't motivation — it's <strong className="text-foreground">knowing if you are actually getting stronger</strong>.
        </p>
        <div className="grid grid-cols-2 gap-2 my-1">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-emerald-400 font-bold block mb-0.5">📈 Progressive Overload</span>
            <span className="text-[11px]">Without equipment, adding 1 rep or 5s hold is how you grow.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-accent font-bold block mb-0.5">🎯 Avoid Plateaus</span>
            <span className="text-[11px]">Log your numbers so you never guess what set to hit next.</span>
          </div>
        </div>
        <p className="text-[11px] text-muted/90 bg-accent/10 border border-accent/20 p-2.5 rounded-xl">
          💡 <strong>RepTree</strong> turns your sweat into quantifiable points and unlocks an interactive Calisthenics Skill Tree!
        </p>
      </div>
    ),
  },
  {
    step: 2,
    title: 'Points & Dual Volume Engine ⚡',
    subtitle: 'How reps and isometric holds become RPG progression points',
    icon: '⚖️',
    badge: 'Core Concept',
    pointerTarget: 'quick-log-btn',
    pointerText: 'Log sets instantly from anywhere using ⚡ Quick Log',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <p>
          Not all exercises are measured in reps! Calisthenics features two distinct volume channels:
        </p>
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
            <span className="text-lg">💪</span>
            <div>
              <span className="font-extrabold text-emerald-400 block">Dynamic Reps (Pushups, Dips, Pullups)</span>
              <span className="text-[11px] text-muted">Earn points per rep. Harder moves award higher multipliers (e.g. 1 Muscle Up = 10 pts).</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-2.5">
            <span className="text-lg">⏱️</span>
            <div>
              <span className="font-extrabold text-sky-400 block">Isometric Static Holds (Planks, Lever, L-Sit)</span>
              <span className="text-[11px] text-muted">Earn points per hold duration (e.g. 1 point for every 30 seconds held).</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-accent">
          * Points automatically update your daily chart & lifetime rank in real-time!
        </p>
      </div>
    ),
  },
  {
    step: 3,
    title: 'Dynamic Skill Tree & Domains 🌿',
    subtitle: '5 movement domains & infinite progression pathways',
    icon: '🌳',
    badge: 'Skill Tree',
    pointerTarget: 'tree-tab',
    pointerText: 'Tap Tree tab to map your progression',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <p>
          Navigate to the <strong className="text-foreground">Tree tab</strong> to view your interactive skill canvas across 5 color-coded movement domains:
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
            🟠 Push (Pushups, Dips)
          </div>
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">
            🔵 Pull (Pullups, Muscle Up)
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            🟢 Core (Situps, Planks)
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
            🔴 Legs (Squats, Lunges)
          </div>
        </div>
        <p className="text-[11px] text-muted">
          Glowing connector lines show prerequisites. Unlock advanced skills as you build foundation strength!
        </p>
      </div>
    ),
  },
  {
    step: 4,
    title: 'Instant ⚡ Quick Log Anywhere',
    subtitle: 'Zero friction logging during workouts',
    icon: '⚡',
    badge: 'Fast Logging',
    pointerTarget: 'quick-log-btn',
    pointerText: 'Look for the floating ⚡ button at bottom right',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <p>
          Don't lose your focus during rest intervals. Tap the floating <strong className="text-foreground">⚡ Quick Log button</strong> anytime:
        </p>
        <div className="bg-surface border border-accent/40 p-3 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">1</span>
            <span>Tap ⚡ Floating Button</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">2</span>
            <span>Select Exercise & Reps / Hold Seconds</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">3</span>
            <span>Tap "+ Add Set" — Points & Streaks update instantly!</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: 'Offline Sync & Settings ⚙️',
    subtitle: 'Log anywhere with or without internet connection',
    icon: '🛡️',
    badge: 'Offline-First',
    pointerTarget: 'settings-gear',
    pointerText: 'Access Settings & Reference Guide anytime',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <span className="font-extrabold text-emerald-400 text-xs block">✅ Full Offline Support</span>
          <span className="text-[11px] text-muted block">
            Work out in the park or basement with no signal. Workouts save locally and auto-sync to cloud when online.
          </span>
        </div>
        <p className="text-[11px] text-muted">
          Need a quick refresher later? Open <strong className="text-foreground">Settings ⚙️ &rarr; Quick Reference Guide</strong> anytime without resetting your data!
        </p>
      </div>
    ),
  },
]

// ----------------------------------------------------
// 2. CONCISE QUICK REFERENCE GUIDE (FOR SETTINGS MODAL)
// ----------------------------------------------------
const REFERENCE_STEPS = [
  {
    step: 1,
    title: 'RepTree Quick Reference 📖',
    subtitle: 'Core concepts & tracking rules at a glance',
    icon: '⚡',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
          <span className="font-bold text-foreground block">🎯 Why Track Bodyweight?</span>
          <span>Progressive overload is key. Adding 1 rep or 5 seconds hold is how bodyweight strength is built.</span>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
          <span className="font-bold text-foreground block">⚖️ Reps vs Isometric Holds</span>
          <span>Dynamic moves (Pushups) use reps. Static moves (Planks) use seconds. Both award difficulty points.</span>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    title: 'Skill Tree & Navigation 🌿',
    subtitle: 'Domains, custom skills & floating tools',
    icon: '🌳',
    content: (
      <div className="space-y-3 text-xs text-muted leading-relaxed">
        <ul className="list-disc list-inside space-y-2 text-xs text-muted">
          <li><strong className="text-amber-400">Push</strong>, <strong className="text-sky-400">Pull</strong>, <strong className="text-emerald-400">Core</strong>, <strong className="text-rose-400">Legs</strong>, <strong className="text-purple-400">Skill</strong> domains.</li>
          <li><strong className="text-foreground">⚡ Floating Quick Log:</strong> Tap floating button at bottom right to log sets without switching tabs.</li>
          <li><strong className="text-foreground">Offline Logging:</strong> Workouts logged offline queue automatically and sync when reconnected.</li>
        </ul>
      </div>
    ),
  },
]

export function TutorialModal({
  isOpen,
  onClose,
  onFinishTutorial,
  isInteractiveFlow = true,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const steps = isInteractiveFlow ? INTERACTIVE_STEPS : REFERENCE_STEPS
  const stepData = steps[currentStep] || steps[0]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const handleFinish = () => {
    // Only mark initial onboarding tutorial as completed if doing the interactive first-time flow
    if (onFinishTutorial && isInteractiveFlow) {
      onFinishTutorial()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-surface border border-accent/40 rounded-3xl p-6 shadow-2xl overflow-hidden relative flex flex-col min-h-[460px] max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-xl shrink-0">
                {stepData.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    Step {stepData.step} of {steps.length}
                  </span>
                  {'badge' in stepData && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-muted">
                      {(stepData as any).badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground leading-tight">{stepData.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Progress Indicators Bar */}
          <div className="flex gap-1.5 mb-4 shrink-0">
            {steps.map((_, idx) => (
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
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3">
            <p className="text-xs font-semibold text-accent/90">{stepData.subtitle}</p>
            {stepData.content}
          </div>

          {/* Interactive Arrow Cue Callout */}
          {'pointerText' in stepData && (
            <div className="mt-3 p-2.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-accent font-bold">
                <span className="animate-bounce">👇</span>
                <span>{(stepData as any).pointerText}</span>
              </div>
              <span className="text-[10px] text-muted uppercase font-black tracking-wider">Guided Cue</span>
            </div>
          )}

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
                <span>Complete Tour</span>
                <span>🎉</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
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
