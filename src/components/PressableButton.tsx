import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { SPRING_SNAP, TAP_SCALE } from '../utils/motion'

interface PressableButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
}

const VARIANTS = {
  primary: 'bg-accent text-background shadow-soft',
  secondary: 'bg-surface-elevated text-foreground border border-border/80 shadow-soft',
  danger: 'bg-surface-elevated text-red-400 border border-border/80 shadow-soft',
}

export function PressableButton({
  children,
  onClick,
  className = '',
  variant = 'secondary',
  type = 'button',
}: PressableButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-medium min-h-[44px] ${VARIANTS[variant]} ${className}`}
      whileTap={{ scale: TAP_SCALE }}
      whileHover={{ scale: 1.02 }}
      transition={SPRING_SNAP}
    >
      {children}
    </motion.button>
  )
}
