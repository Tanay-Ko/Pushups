import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { DailyChart } from '../components/DailyChart'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import type { PushupStats } from '../utils/stats'

interface StatsScreenProps {
  stats: PushupStats
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function StatsScreen({ stats }: StatsScreenProps) {
  return (
    <div className="flex flex-col h-full px-6 pt-safe pb-safe">
      <header className="pt-8 pb-6">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <p className="text-sm text-muted mt-1">Your pushup progress</p>
      </header>

      <motion.div 
        className="flex-1 overflow-y-auto space-y-4 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <p className="text-sm text-muted mb-3">Daily pushups</p>
            <DailyChart data={stats.dailyChart} />
          </Card>
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
          <motion.div variants={itemVariants}><StatCard label="This week" value={stats.weeklyTotal} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="This month" value={stats.monthlyTotal} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Lifetime" value={stats.lifetimeTotal} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Sessions" value={stats.totalSessions} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Avg / day" value={stats.averagePerDay} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Avg / workout" value={stats.averagePerWorkout} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Best day" value={stats.highestDay} /></motion.div>
          <motion.div variants={itemVariants}><StatCard label="Today" value={stats.todayTotal} /></motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
