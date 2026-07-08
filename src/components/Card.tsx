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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl bg-surface border border-border p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
