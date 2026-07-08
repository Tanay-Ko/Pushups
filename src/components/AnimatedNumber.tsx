import { useMotionValueEvent, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 90, damping: 18, mass: 0.6 })
  const [display, setDisplay] = useState(value.toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(Math.round(latest).toLocaleString())
  })

  return <span className={`tabular-nums ${className}`}>{display}</span>
}
