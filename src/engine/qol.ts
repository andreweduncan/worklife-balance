import type {
  FinancialProfile,
  JobProfile,
  Obligation,
  QoLPoint,
  QoLResult,
} from './types'
import { calculateTimeBreakdown, calculateEliminationCostPerYear } from './obligations'
import { calculateWorkSatisfaction } from './satisfaction'
import {
  calculateAnnualIncome,
  calculateDisposableIncome,
  calculateFreeTimeSatisfaction,
} from './financial'

export function calculateQoL(
  workHoursPerDay: number,
  obligations: Obligation[],
  jobProfile: JobProfile,
  financial: FinancialProfile
): QoLResult {
  const breakdown = calculateTimeBreakdown(workHoursPerDay, obligations)
  const freeTime = breakdown.freeTime

  const income = calculateAnnualIncome(workHoursPerDay, jobProfile)
  const elimCost = calculateEliminationCostPerYear(obligations)
  const disposableIncome = calculateDisposableIncome(
    income,
    elimCost,
    financial.baselineNeeds
  )

  const workSat = calculateWorkSatisfaction(
    workHoursPerDay,
    jobProfile.baselineSatisfaction,
    jobProfile.enjoymentHalfLife,
    jobProfile.shelfLife
  )

  const freeTimeSat = calculateFreeTimeSatisfaction(
    disposableIncome,
    financial.moneySensitivity,
    jobProfile.takesWorkHome
  )

  const compositeQoL =
    (workHoursPerDay / 24) * workSat + (freeTime / 24) * freeTimeSat * 100

  return {
    compositeQoL,
    workSat,
    freeTimeSat,
    freeTime,
    income,
    disposableIncome,
    optimalHours: 0,
  }
}

export function calculateQoLCurve(
  obligations: Obligation[],
  jobProfile: JobProfile,
  financial: FinancialProfile,
  maxHours: number = 16,
  steps: number = 64
): QoLPoint[] {
  const points: QoLPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const h = (i / steps) * maxHours
    const result = calculateQoL(h, obligations, jobProfile, financial)
    points.push({ hours: h, qol: result.compositeQoL })
  }
  return points
}

export function findOptimalHours(
  obligations: Obligation[],
  jobProfile: JobProfile,
  financial: FinancialProfile,
  maxHours: number = 16
): number {
  const curve = calculateQoLCurve(obligations, jobProfile, financial, maxHours, 256)
  let best = curve[0]
  for (const point of curve) {
    if (point.qol > best.qol) best = point
  }
  return Math.round(best.hours * 4) / 4
}

export function calculateFullQoL(
  workHoursPerDay: number,
  obligations: Obligation[],
  jobProfile: JobProfile,
  financial: FinancialProfile
): QoLResult {
  const result = calculateQoL(workHoursPerDay, obligations, jobProfile, financial)
  result.optimalHours = findOptimalHours(obligations, jobProfile, financial)
  return result
}
