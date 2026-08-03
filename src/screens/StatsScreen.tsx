import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { DailyChart } from '../components/DailyChart'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { computeStats, formatHoldTime } from '../utils/stats'
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
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export function StatsScreen({ entries, skills }: StatsScreenProps) {
  const [filterSkillId, setFilterSkillId] = useState<string>('all')

  const stats = useMemo(() => {
    return computeStats(entries, skills, filterSkillId)
  }, [entries, skills, filterSkillId])

  const selectedSkill = skills.find((s) => s.id === filterSkillId)
  const isTimeSkill = selectedSkill?.trackingType === 'time'

  return (
    <div
      className="flex flex-col h-full px-5 sm:px-6 pt-safe pb-safe overflow-y-auto"
      style={{
        background: '#060606',
        backgroundImage: 'radial-gradient(circle, rgba(40,40,40,0.6) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Header */}
      <header className="pt-8 pb-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-0.5 h-5 rounded-full"
            style={{ background: 'linear-gradient(to bottom, var(--theme-gradient-start), var(--theme-gradient-end))' }}
          />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f0f0' }}>
              Stats &amp; Progress
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {filterSkillId === 'all'
                ? 'Aggregate performance & modality split'
                : `${selectedSkill?.name || 'Skill'} Detailed Analytics`}
            </p>
          </div>
        </div>

        {/* Skill Filter Dropdown */}
        <select
          value={filterSkillId}
          onChange={(e) => setFilterSkillId(e.target.value)}
          className="border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent"
          style={{
            background: 'rgba(15,15,15,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#c0c0c0',
          }}
        >
          <option value="all">All Skills (Points)</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.trackingType === 'time' ? 'Static Hold' : 'Dynamic Reps'})
            </option>
          ))}
        </select>
      </header>

      <motion.div
        className="flex-1 space-y-4 pb-24 scrollbar-none"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Daily Points / Reps Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-muted">
                  {filterSkillId === 'all'
                    ? 'Daily Points Trend'
                    : `Daily ${selectedSkill?.name || ''} ${isTimeSkill ? 'Hold Time' : 'Reps'}`}
                </p>
              </div>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                Last 7 Days
              </span>
            </div>
            <DailyChart data={stats.dailyChart} />
          </Card>
        </motion.div>

        {/* Dynamic Modality Split vs Single Skill Highlights */}
        {filterSkillId === 'all' ? (
          <>
            {/* Volume Channels Split: Reps vs Hold Time */}
            <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Dynamic Reps"
                  value={`${stats.lifetimeReps.toLocaleString()} reps`}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Static Holds"
                  value={formatHoldTime(stats.lifetimeHoldSeconds)}
                />
              </motion.div>
            </motion.div>

            {/* Reps vs Static Holds Points Split Progress Bar */}
            {stats.lifetimePoints > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                      Modality Points Breakdown
                    </span>
                    <span className="text-[10px] font-bold text-muted">
                      {stats.lifetimePoints.toLocaleString()} Total Pts
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-l-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${stats.repsPointsPercent}%` }}
                    />
                    <div
                      className="h-full rounded-r-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                      style={{ width: `${stats.holdPointsPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold mt-2">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Dynamic Reps: {stats.repsPointsPercent}% ({stats.repsPoints} pts)
                    </span>
                    <span className="text-sky-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                      Static Holds: {stats.holdPointsPercent}% ({stats.holdPoints} pts)
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Streak & Consistency Row */}
            <motion.div className="grid grid-cols-3 gap-2.5" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <StatCard label="Current Streak" value={`${stats.streak.currentStreak} 🔥`} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard label="Best Streak" value={`${stats.streak.maxStreak} 🏆`} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard label="Active Days" value={`${stats.streak.activeDaysCount} 📅`} />
              </motion.div>
            </motion.div>

            {/* Top Skills Breakdown */}
            {stats.topSkills.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-muted mb-3">
                    Top Exercises by Points
                  </p>
                  <div className="space-y-2.5">
                    {stats.topSkills.slice(0, 5).map((skill, idx) => (
                      <div
                        key={skill.skillId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 text-center text-xs font-bold text-muted">{idx + 1}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              skill.trackingType === 'time'
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            }`}
                          >
                            {skill.trackingType === 'time' ? 'Hold' : 'Reps'}
                          </span>
                          <span className="text-xs font-bold text-foreground">{skill.skillName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-accent">{skill.points} pts</span>
                          <span className="block text-[10px] text-muted font-medium">
                            {skill.trackingType === 'time'
                              ? formatHoldTime(skill.totalAmount)
                              : `${skill.totalAmount.toLocaleString()} reps`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        ) : (
          /* Single Skill Specific Cards */
          <>
            <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <StatCard
                  label={isTimeSkill ? 'Lifetime Hold Time' : 'Lifetime Reps'}
                  value={
                    isTimeSkill
                      ? formatHoldTime(stats.lifetimeHoldSeconds)
                      : `${stats.lifetimeReps.toLocaleString()} reps`
                  }
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Skill Points"
                  value={`${stats.lifetimePoints.toLocaleString()} pts`}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label={isTimeSkill ? 'Longest Single Hold' : 'Max Single Set (PR)'}
                  value={
                    isTimeSkill
                      ? formatHoldTime(stats.maxSingleAmount)
                      : `${stats.maxSingleAmount.toLocaleString()} reps`
                  }
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label={isTimeSkill ? 'This Week Hold' : 'This Week Reps'}
                  value={
                    isTimeSkill
                      ? formatHoldTime(stats.weeklyHoldSeconds)
                      : `${stats.weeklyReps.toLocaleString()} reps`
                  }
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label={isTimeSkill ? 'This Month Hold' : 'This Month Reps'}
                  value={
                    isTimeSkill
                      ? formatHoldTime(stats.monthlyHoldSeconds)
                      : `${stats.monthlyReps.toLocaleString()} reps`
                  }
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard label="Logged Sets" value={`${stats.totalSessions} sets`} />
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Global Performance Summary Grid */}
        <motion.div variants={itemVariants}>
          <Card className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted">
              General Activity &amp; Highlights
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">THIS WEEK</span>
                <span className="text-foreground font-black text-sm">{stats.weeklyPoints} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">THIS MONTH</span>
                <span className="text-foreground font-black text-sm">{stats.monthlyPoints} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">AVG PTS / DAY</span>
                <span className="text-foreground font-black text-sm">{stats.averagePerDay} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">AVG PTS / WORKOUT</span>
                <span className="text-foreground font-black text-sm">{stats.averagePerWorkout} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">BEST SINGLE DAY</span>
                <span className="text-accent font-black text-sm">{stats.highestDay} pts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-muted text-[10px] block font-semibold">TOTAL SESSIONS</span>
                <span className="text-foreground font-black text-sm">{stats.totalSessions} sets</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
