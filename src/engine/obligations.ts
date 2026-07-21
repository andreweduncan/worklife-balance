import type { Obligation, Period, TimeBreakdown } from './types'

const PERIOD_MULTIPLIERS: Record<Period, number> = {
  day: 1,
  week: 7,
  month: 30.44,
  year: 365.25,
}

export function convertHours(hoursPerDay: number, toPeriod: Period): number {
  return +(hoursPerDay * PERIOD_MULTIPLIERS[toPeriod]).toFixed(2)
}

export function toHoursPerDay(hours: number, fromPeriod: Period): number {
  return +(hours / PERIOD_MULTIPLIERS[fromPeriod]).toFixed(4)
}

export function calculateTimeBreakdown(
  workHoursPerDay: number,
  obligations: Obligation[]
): TimeBreakdown {
  const active = obligations.filter((o) => o.isActive)

  const byCategory = {
    biological: 0,
    household: 0,
    personal: 0,
    transport: 0,
    custom: 0,
  }

  for (const o of active) {
    byCategory[o.category] += o.hoursPerDay
  }

  const totalObligation = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const freeTime = Math.max(0, 24 - workHoursPerDay - totalObligation)

  return {
    work: workHoursPerDay,
    obligations: totalObligation,
    freeTime,
    ...byCategory,
  }
}

export function calculateEliminationCostPerYear(
  obligations: Obligation[]
): number {
  return obligations
    .filter((o) => !o.isActive && o.costToEliminate)
    .reduce((sum, o) => {
      const cost = o.costToEliminate!
      const yearlyMultiplier =
        PERIOD_MULTIPLIERS.year / PERIOD_MULTIPLIERS[cost.period]
      return sum + cost.amount * yearlyMultiplier
    }, 0)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}
