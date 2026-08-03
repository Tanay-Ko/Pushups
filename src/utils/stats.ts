import type { PushupEntry } from '../models/PushupEntry'
import type { Skill } from '../models/Skill'
import { CHART_DAYS } from '../constants'
import {
  formatShortDate,
  getDayKey,
  getMonthStart,
  getWeekStart,
  startOfDay,
} from './dates'

export interface DailyTotal {
  date: string
  label: string
  total: number // Points rounded to nearest tenth
  reps: number
  holdTimeSeconds: number
  points: number
}

export interface SkillDistribution {
  skillId: string
  skillName: string
  domain: string
  trackingType: 'reps' | 'time'
  points: number
  percentage: number
  totalAmount: number // total reps or total seconds
}

export interface StreakStats {
  currentStreak: number
  maxStreak: number
  activeDaysCount: number
}

export interface PushupStats {
  filterSkillId: string
  isSingleSkill: boolean
  selectedSkill?: Skill
  trackingType?: 'reps' | 'time'

  // Points
  lifetimePoints: number
  todayPoints: number
  weeklyPoints: number
  monthlyPoints: number

  // Volume channels
  lifetimeReps: number
  todayReps: number
  weeklyReps: number
  monthlyReps: number

  lifetimeHoldSeconds: number
  todayHoldSeconds: number
  weeklyHoldSeconds: number
  monthlyHoldSeconds: number

  // Points split
  repsPoints: number
  holdPoints: number
  repsPointsPercent: number
  holdPointsPercent: number

  // Single-skill peak PRs
  maxSingleAmount: number

  // Averages & totals
  averagePerDay: number
  averagePerWorkout: number
  highestDay: number
  totalSessions: number

  // Compatibility totals
  lifetimeTotal: number
  todayTotal: number

  // Breakdown
  streak: StreakStats
  topSkills: SkillDistribution[]
  dailyChart: DailyTotal[]
}

export function roundTenth(val: number): number {
  return Math.round(val * 10) / 10
}

export function formatHoldTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0s'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  }
  return `${seconds}s`
}

export function isTimeEntry(entry: PushupEntry, skillsMap: Map<string, Skill>): boolean {
  if (entry.trackingType === 'time') return true
  if (entry.trackingType === 'reps') return false

  let skill = entry.skillId ? skillsMap.get(entry.skillId) : undefined
  if (!skill && entry.skillName) {
    const nameLower = entry.skillName.toLowerCase().trim()
    skill = Array.from(skillsMap.values()).find((s) => s.name.toLowerCase().trim() === nameLower)
  }
  return skill?.trackingType === 'time'
}

export function computeEntryPoints(entry: PushupEntry, skillsMap: Map<string, Skill>): number {
  let skill = entry.skillId ? skillsMap.get(entry.skillId) : undefined

  if (!skill && entry.skillName) {
    const nameLower = entry.skillName.toLowerCase().trim()
    skill = Array.from(skillsMap.values()).find((s) => s.name.toLowerCase().trim() === nameLower)
  }

  const pointsPerRep = skill?.pointsPerRep && skill.pointsPerRep > 0 ? skill.pointsPerRep : 1

  if (skill?.trackingType === 'time' || entry.trackingType === 'time') {
    const unitSeconds = skill?.timeUnitSeconds && skill.timeUnitSeconds > 0 ? skill.timeUnitSeconds : 1
    return roundTenth((entry.amount / unitSeconds) * pointsPerRep)
  }

  return roundTenth(entry.amount * pointsPerRep)
}

function calculateStreaks(dayKeys: string[]): StreakStats {
  if (dayKeys.length === 0) {
    return { currentStreak: 0, maxStreak: 0, activeDaysCount: 0 }
  }

  const uniqueDays = Array.from(new Set(dayKeys)).sort()
  const activeDaysCount = uniqueDays.length

  const todayStr = getDayKey(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = getDayKey(yesterdayDate)

  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0

  // Calculate max streak
  for (let i = 0; i < uniqueDays.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(uniqueDays[i - 1])
      const curr = new Date(uniqueDays[i])
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24))

      if (diffDays === 1) {
        tempStreak += 1
      } else {
        tempStreak = 1
      }
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak
  }

  // Calculate current streak
  const lastActive = uniqueDays[uniqueDays.length - 1]
  if (lastActive === todayStr || lastActive === yesterdayStr) {
    let checkDate = new Date(lastActive)
    while (true) {
      const key = getDayKey(checkDate)
      if (uniqueDays.includes(key)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  return { currentStreak, maxStreak, activeDaysCount }
}

export function computeStats(entries: PushupEntry[], skills?: Skill[], filterSkillId = 'all'): PushupStats {
  const skillsMap = new Map((skills || []).map((s) => [s.id, s]))

  const isSingleSkill = filterSkillId !== 'all'
  const selectedSkill = skillsMap.get(filterSkillId)
  const trackingType = selectedSkill?.trackingType

  const filteredEntries = isSingleSkill
    ? entries.filter((e) => (e.skillId || 'pushups') === filterSkillId)
    : entries

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = getWeekStart(now)
  const monthStart = getMonthStart(now)

  const todayEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= todayStart)
  const weekEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= weekStart)
  const monthEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= monthStart)

  // Modality helper
  const aggregateModality = (list: PushupEntry[]) => {
    let reps = 0
    let holdSeconds = 0
    let repsPts = 0
    let holdPts = 0
    let maxAmount = 0

    for (const e of list) {
      const pts = computeEntryPoints(e, skillsMap)
      if (e.amount > maxAmount) maxAmount = e.amount

      if (isTimeEntry(e, skillsMap)) {
        holdSeconds += e.amount
        holdPts += pts
      } else {
        reps += e.amount
        repsPts += pts
      }
    }

    return { reps, holdSeconds, repsPts: roundTenth(repsPts), holdPts: roundTenth(holdPts), maxAmount }
  }

  const lifetimeAgg = aggregateModality(filteredEntries)
  const todayAgg = aggregateModality(todayEntries)
  const weekAgg = aggregateModality(weekEntries)
  const monthAgg = aggregateModality(monthEntries)

  const lifetimePoints = roundTenth(lifetimeAgg.repsPts + lifetimeAgg.holdPts)
  const todayPoints = roundTenth(todayAgg.repsPts + todayAgg.holdPts)
  const weeklyPoints = roundTenth(weekAgg.repsPts + weekAgg.holdPts)
  const monthlyPoints = roundTenth(monthAgg.repsPts + monthAgg.holdPts)

  const repsPointsPercent = lifetimePoints > 0 ? roundTenth((lifetimeAgg.repsPts / lifetimePoints) * 100) : 0
  const holdPointsPercent = lifetimePoints > 0 ? roundTenth((lifetimeAgg.holdPts / lifetimePoints) * 100) : 0

  // Per-day points & reps mapping
  const dayPointsMap = new Map<string, number>()
  const dayRepsMap = new Map<string, number>()
  const dayHoldMap = new Map<string, number>()
  const dayKeys: string[] = []

  for (const entry of filteredEntries) {
    const key = getDayKey(new Date(entry.timestamp))
    dayKeys.push(key)
    const pts = computeEntryPoints(entry, skillsMap)
    dayPointsMap.set(key, (dayPointsMap.get(key) ?? 0) + pts)

    if (isTimeEntry(entry, skillsMap)) {
      dayHoldMap.set(key, (dayHoldMap.get(key) ?? 0) + entry.amount)
    } else {
      dayRepsMap.set(key, (dayRepsMap.get(key) ?? 0) + entry.amount)
    }
  }

  const dayPointsValues = [...dayPointsMap.values()].map(roundTenth)
  const streak = calculateStreaks(dayKeys)

  // Top skills breakdown by points
  const skillPointsMap = new Map<string, { pts: number; amount: number; name: string; domain: string; type: 'reps' | 'time' }>()
  for (const entry of entries) {
    const sId = entry.skillId || 'pushups'
    const pts = computeEntryPoints(entry, skillsMap)
    const skill = skillsMap.get(sId)
    const sName = entry.skillName || skill?.name || 'Push-ups'
    const domain = skill?.domain || 'Push'
    const type: 'reps' | 'time' = isTimeEntry(entry, skillsMap) ? 'time' : 'reps'

    const existing = skillPointsMap.get(sId) || { pts: 0, amount: 0, name: sName, domain, type }
    existing.pts += pts
    existing.amount += entry.amount
    skillPointsMap.set(sId, existing)
  }

  const topSkills: SkillDistribution[] = Array.from(skillPointsMap.entries())
    .map(([sId, data]) => ({
      skillId: sId,
      skillName: data.name,
      domain: data.domain,
      trackingType: data.type,
      points: roundTenth(data.pts),
      percentage: lifetimePoints > 0 ? roundTenth((data.pts / lifetimePoints) * 100) : 0,
      totalAmount: data.amount,
    }))
    .sort((a, b) => b.points - a.points)

  const totalSessions = filteredEntries.length

  const dailyChart: DailyTotal[] = []
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(todayStart)
    d.setDate(d.getDate() - i)
    const key = getDayKey(d)
    const pts = roundTenth(dayPointsMap.get(key) ?? 0)
    dailyChart.push({
      date: key,
      label: formatShortDate(d),
      total: pts,
      points: pts,
      reps: dayRepsMap.get(key) ?? 0,
      holdTimeSeconds: dayHoldMap.get(key) ?? 0,
    })
  }

  return {
    filterSkillId,
    isSingleSkill,
    selectedSkill,
    trackingType,

    lifetimePoints,
    todayPoints,
    weeklyPoints,
    monthlyPoints,

    lifetimeReps: lifetimeAgg.reps,
    todayReps: todayAgg.reps,
    weeklyReps: weekAgg.reps,
    monthlyReps: monthAgg.reps,

    lifetimeHoldSeconds: lifetimeAgg.holdSeconds,
    todayHoldSeconds: todayAgg.holdSeconds,
    weeklyHoldSeconds: weekAgg.holdSeconds,
    monthlyHoldSeconds: monthAgg.holdSeconds,

    repsPoints: lifetimeAgg.repsPts,
    holdPoints: lifetimeAgg.holdPts,
    repsPointsPercent,
    holdPointsPercent,

    maxSingleAmount: lifetimeAgg.maxAmount,

    averagePerDay: streak.activeDaysCount > 0 ? roundTenth(lifetimePoints / streak.activeDaysCount) : 0,
    averagePerWorkout: totalSessions > 0 ? roundTenth(lifetimePoints / totalSessions) : 0,
    highestDay: dayPointsValues.length > 0 ? roundTenth(Math.max(...dayPointsValues)) : 0,
    totalSessions,

    lifetimeTotal: lifetimeAgg.reps + lifetimeAgg.holdSeconds,
    todayTotal: todayAgg.reps + todayAgg.holdSeconds,

    streak,
    topSkills,
    dailyChart,
  }
}
