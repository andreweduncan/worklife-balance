import type { SatisfactionPoint } from './types'

export function monotonyRate(halfLife: number): number {
  return Math.LN2 / halfLife
}

function rawSatisfaction(baseline: number, rate: number, h: number): number {
  const decay = 1 - Math.exp(-rate * h)
  return baseline - Math.abs(baseline) * decay
}

export function calculateWorkSatisfaction(
  hoursPerDay: number,
  baselineSatisfaction: number,
  halfLife: number,
  shelfLife: number
): number {
  if (hoursPerDay <= 0) return 0
  const rate = monotonyRate(halfLife)
  return rawSatisfaction(baselineSatisfaction, rate, hoursPerDay) * shelfLife
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
    const sat = rawSatisfaction(baselineSatisfaction, rate, h) * shelfLife
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
