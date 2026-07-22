import type { FinancialProfile, JobProfile, Obligation } from './types'
import { effectiveHourlyRate } from './satisfaction'
import { calculateEliminationCostPerYear } from './obligations'

export function calculateAnnualIncome(
  workHoursPerDay: number,
  jobProfile: JobProfile
): number {
  const hourly = effectiveHourlyRate(
    jobProfile.payMode,
    jobProfile.salary,
    jobProfile.hoursPerWeek,
    jobProfile.hourlyRate
  )
  return hourly * workHoursPerDay * 365.25
}

export function calculateDisposableIncome(
  annualIncome: number,
  eliminationCostPerYear: number,
  baselineNeeds: number
): number {
  return Math.max(0, annualIncome - eliminationCostPerYear - baselineNeeds)
}

export function calculateMoneySatisfaction(
  disposableIncome: number,
  sensitivity: number
): number {
  if (disposableIncome <= 0) return 0
  const scale = sensitivity * 1000
  const reference = 200000
  return Math.log(1 + disposableIncome / scale) / Math.log(1 + reference / scale)
}

export function calculateFreeTimeSatisfaction(
  disposableIncome: number,
  sensitivity: number,
  takesWorkHome: number
): number {
  const moneySat = calculateMoneySatisfaction(disposableIncome, sensitivity)
  return moneySat * (1 - takesWorkHome)
}

export interface IncomeBreakdown {
  annualIncome: number
  eliminationCost: number
  baselineNeeds: number
  disposableIncome: number
  moneySatisfaction: number
}

export function calculateIncomeBreakdown(
  workHoursPerDay: number,
  jobProfile: JobProfile,
  obligations: Obligation[],
  financial: FinancialProfile
): IncomeBreakdown {
  const annualIncome = calculateAnnualIncome(workHoursPerDay, jobProfile)
  const eliminationCost = calculateEliminationCostPerYear(obligations)
  const disposableIncome = calculateDisposableIncome(
    annualIncome,
    eliminationCost,
    financial.baselineNeeds
  )
  const moneySatisfaction = calculateMoneySatisfaction(
    disposableIncome,
    financial.moneySensitivity
  )
  return {
    annualIncome,
    eliminationCost,
    baselineNeeds: financial.baselineNeeds,
    disposableIncome,
    moneySatisfaction,
  }
}
