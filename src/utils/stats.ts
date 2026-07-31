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
  points: number
}

export interface PushupStats {
  lifetimePoints: number // Points rounded to nearest tenth
  todayPoints: number
  weeklyPoints: number
  monthlyPoints: number
  lifetimeTotal: number // Lifetime reps / seconds
  todayTotal: number
  weeklyTotal: number
  monthlyTotal: number
  averagePerDay: number
  averagePerWorkout: number
  highestDay: number
  totalSessions: number
  dailyChart: DailyTotal[]
}

export function roundTenth(val: number): number {
  return Math.round(val * 10) / 10
}

export function computeEntryPoints(entry: PushupEntry, skillsMap: Map<string, Skill>): number {
  const skill = entry.skillId ? skillsMap.get(entry.skillId) : undefined
  const pointsPerRep = skill?.pointsPerRep && skill.pointsPerRep > 0 ? skill.pointsPerRep : 1

  if (skill?.trackingType === 'time' || entry.trackingType === 'time') {
    const unitSeconds = skill?.timeUnitSeconds && skill.timeUnitSeconds > 0 ? skill.timeUnitSeconds : 1
    // e.g. 45 seconds of Plank (1 pt per 30s) = (45 / 30) * 1 = 1.5 points!
    return roundTenth((entry.amount / unitSeconds) * pointsPerRep)
  }

  return roundTenth(entry.amount * pointsPerRep)
}

export function computeStats(entries: PushupEntry[], skills?: Skill[], filterSkillId?: string): PushupStats {
  const skillsMap = new Map((skills || []).map(s => [s.id, s]))

  const filteredEntries = filterSkillId && filterSkillId !== 'all'
    ? entries.filter(e => (e.skillId || 'pushups') === filterSkillId)
    : entries

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = getWeekStart(now)
  const monthStart = getMonthStart(now)

  const todayEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= todayStart)
  const weekEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= weekStart)
  const monthEntries = filteredEntries.filter((e) => new Date(e.timestamp) >= monthStart)

  const dayPointsMap = new Map<string, number>()
  const dayRepsMap = new Map<string, number>()

  for (const entry of filteredEntries) {
    const key = getDayKey(new Date(entry.timestamp))
    const pts = computeEntryPoints(entry, skillsMap)
    dayPointsMap.set(key, (dayPointsMap.get(key) ?? 0) + pts)
    dayRepsMap.set(key, (dayRepsMap.get(key) ?? 0) + entry.amount)
  }

  const dayPointsValues = [...dayPointsMap.values()].map(roundTenth)
  const activeDays = dayPointsValues.length

  const lifetimePoints = roundTenth(filteredEntries.reduce((sum, e) => sum + computeEntryPoints(e, skillsMap), 0))
  const todayPoints = roundTenth(todayEntries.reduce((sum, e) => sum + computeEntryPoints(e, skillsMap), 0))
  const weeklyPoints = roundTenth(weekEntries.reduce((sum, e) => sum + computeEntryPoints(e, skillsMap), 0))
  const monthlyPoints = roundTenth(monthEntries.reduce((sum, e) => sum + computeEntryPoints(e, skillsMap), 0))

  const lifetimeTotal = filteredEntries.reduce((sum, e) => sum + e.amount, 0)
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0)
  const weeklyTotal = weekEntries.reduce((sum, e) => sum + e.amount, 0)
  const monthlyTotal = monthEntries.reduce((sum, e) => sum + e.amount, 0)

  const totalSessions = filteredEntries.length

  const dailyChart: DailyTotal[] = []
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(todayStart)
    d.setDate(d.getDate() - i)
    const key = getDayKey(d)
    const pts = roundTenth(dayPointsMap.get(key) ?? 0)
    const reps = dayRepsMap.get(key) ?? 0
    dailyChart.push({
      date: key,
      label: formatShortDate(d),
      total: pts,
      points: pts,
      reps: reps,
    })
  }

  return {
    lifetimePoints,
    todayPoints,
    weeklyPoints,
    monthlyPoints,
    lifetimeTotal,
    todayTotal,
    weeklyTotal,
    monthlyTotal,
    averagePerDay: activeDays > 0 ? roundTenth(lifetimePoints / activeDays) : 0,
    averagePerWorkout: totalSessions > 0 ? roundTenth(lifetimePoints / totalSessions) : 0,
    highestDay: dayPointsValues.length > 0 ? roundTenth(Math.max(...dayPointsValues)) : 0,
    totalSessions,
    dailyChart,
  }
}
