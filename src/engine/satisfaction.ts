import type { SatisfactionPoint } from './types'

export function monotonyRate(halfLife: number): number {
  return Math.LN2 / halfLife
}

export function calculateWorkSatisfaction(
  hoursPerDay: number,
  baselineSatisfaction: number,
  halfLife: number,
  shelfLife: number
): number {
  if (hoursPerDay <= 0) return 0
  const rate = monotonyRate(halfLife)
  const rawSat = baselineSatisfaction * Math.exp(-rate * hoursPerDay)
  return rawSat * shelfLife
}

export function calculateSatisfactionCurve(
  baselineSatisfaction: number,
  halfLife: number,
  shelfLife: number,
  maxHours: number = 16,
  steps: number = 64
): SatisfactionPoint[] {
  const rate = monotonyRate(halfLife)
  const points: SatisfactionPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const h = (i / steps) * maxHours
    const sat = baselineSatisfaction * Math.exp(-rate * h) * shelfLife
    points.push({ hours: h, satisfaction: sat })
  }
  return points
}

export function effectiveHourlyRate(
  payMode: 'salary' | 'hourly',
  salary: number,
  hoursPerWeek: number,
  hourlyRate: number
): number {
  if (payMode === 'hourly') return hourlyRate
  return hoursPerWeek > 0 ? salary / (hoursPerWeek * 52) : 0
}
