export const SPRING_SNAP = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 34,
  mass: 0.85,
}

export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 0.9,
}

export const SPRING_BOUNCE = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 26,
  mass: 0.75,
}

export const TAP_SCALE = 0.96

export const NAV_DRAG_COMMIT_RATIO = 0.28
