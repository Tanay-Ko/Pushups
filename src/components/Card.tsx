import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      className={`rounded-2xl p-4 relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(13,13,13,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 0 24px var(--theme-glow, rgba(255,255,255,0.05)), 0 8px 32px rgba(0,0,0,0.7)',
      }}
      {...props}
    >
      {/* Inner top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--theme-glow, rgba(255,255,255,0.04)) 0%, transparent 55%)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
