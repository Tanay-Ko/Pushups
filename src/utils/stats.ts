import type { PushupEntry } from '../models/PushupEntry'
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
  total: number
}

export interface PushupStats {
  lifetimeTotal: number
  todayTotal: number
  weeklyTotal: number
  monthlyTotal: number
  averagePerDay: number
  averagePerWorkout: number
  highestDay: number
  totalSessions: number
  dailyChart: DailyTotal[]
}

function sumAmounts(entries: PushupEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0)
}

function filterFromDate(entries: PushupEntry[], from: Date): PushupEntry[] {
  return entries.filter((e) => new Date(e.timestamp) >= from)
}

function dailyTotalsMap(entries: PushupEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of entries) {
    const key = getDayKey(new Date(entry.timestamp))
    map.set(key, (map.get(key) ?? 0) + entry.amount)
  }
  return map
}

export function computeStats(entries: PushupEntry[]): PushupStats {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = getWeekStart(now)
  const monthStart = getMonthStart(now)

  const todayEntries = entries.filter((e) => new Date(e.timestamp) >= todayStart)
  const weekEntries = filterFromDate(entries, weekStart)
  const monthEntries = filterFromDate(entries, monthStart)

  const dayMap = dailyTotalsMap(entries)
  const dayTotals = [...dayMap.values()]
  const activeDays = dayTotals.length

  const lifetimeTotal = sumAmounts(entries)
  const totalSessions = entries.length

  const dailyChart: DailyTotal[] = []
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(todayStart)
    d.setDate(d.getDate() - i)
    const key = getDayKey(d)
    dailyChart.push({
      date: key,
      label: formatShortDate(d),
      total: dayMap.get(key) ?? 0,
    })
  }

  return {
    lifetimeTotal,
    todayTotal: sumAmounts(todayEntries),
    weeklyTotal: sumAmounts(weekEntries),
    monthlyTotal: sumAmounts(monthEntries),
    averagePerDay: activeDays > 0 ? Math.round(lifetimeTotal / activeDays) : 0,
    averagePerWorkout: totalSessions > 0 ? Math.round(lifetimeTotal / totalSessions) : 0,
    highestDay: dayTotals.length > 0 ? Math.max(...dayTotals) : 0,
    totalSessions,
    dailyChart,
  }
}
