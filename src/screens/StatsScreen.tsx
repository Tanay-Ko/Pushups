import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { DailyChart } from '../components/DailyChart'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { computeStats } from '../utils/stats'
import type { PushupEntry } from '../models/PushupEntry'
import type { Skill } from '../models/Skill'

interface StatsScreenProps {
  entries: PushupEntry[]
  skills: Skill[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export function StatsScreen({ entries, skills }: StatsScreenProps) {
  const [filterSkillId, setFilterSkillId] = useState<string>('all')

  const activeStats = useMemo(() => {
    return computeStats(entries, skills, filterSkillId)
  }, [entries, skills, filterSkillId])

  const selectedSkill = skills.find((s) => s.id === filterSkillId)

  return (
    <div
      className="flex flex-col h-full px-6 pt-safe pb-safe"
      style={{
        background: '#060606',
        backgroundImage: 'radial-gradient(circle, rgba(40,40,40,0.6) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <header className="pt-8 pb-4 flex justify-between items-end shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--theme-gradient-start), var(--theme-gradient-end))' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#f0f0f0' }}>Stats</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(120,120,120,0.8)' }}>Points &amp; Calisthenics Progress</p>
          </div>
        </div>

        {/* Top-Right Exercise Filter Dropdown */}
        <div>
          <select
            value={filterSkillId}
            onChange={(e) => setFilterSkillId(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
            style={{
              background: 'rgba(15,15,15,0.95)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#c0c0c0',
            }}
          >
            <option value="all">All Skills (Points)</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.pointsPerRep || 1}x pts)
              </option>
            ))}
          </select>
        </div>
      </header>

      <motion.div
        className="flex-1 overflow-y-auto space-y-4 pb-8 scrollbar-none"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Daily Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted font-medium">
                {filterSkillId === 'all'
                  ? 'Daily Points Earned'
                  : `Daily ${selectedSkill?.name || 'Exercise'} Points`}
              </p>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                7 Days
              </span>
            </div>
            <DailyChart data={activeStats.dailyChart} />
          </Card>
        </motion.div>

        {/* Stat Cards Grid */}
        <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <StatCard label="This week" value={activeStats.weeklyPoints} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="This month" value={activeStats.monthlyPoints} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Lifetime Points" value={activeStats.lifetimePoints} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Lifetime Reps" value={activeStats.lifetimeTotal} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Avg Pts / day" value={activeStats.averagePerDay} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Avg Pts / workout" value={activeStats.averagePerWorkout} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Best day" value={activeStats.highestDay} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard label="Sessions" value={activeStats.totalSessions} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
