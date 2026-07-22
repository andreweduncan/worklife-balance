export type Period = 'day' | 'week' | 'month' | 'year'

export interface Obligation {
  id: string
  name: string
  hoursPerDay: number
  category: 'biological' | 'household' | 'personal' | 'transport' | 'custom'
  isDefault: boolean
  isActive: boolean
  costToEliminate?: {
    amount: number
    period: Period
  }
  defaultHoursPerDay?: number // stored so we can show "vs default"
}

export interface ObligationConfig {
  name: string
  defaultHoursPerDay: number
  category: Obligation['category']
  costToEliminate?: {
    amount: number
    period: Period
  }
}

export type PayMode = 'salary' | 'hourly'

export interface JobProfile {
  baselineSatisfaction: number
  enjoymentHalfLife: number
  shelfLife: number
  takesWorkHome: number
  payMode: PayMode
  salary: number
  hoursPerWeek: number
  hourlyRate: number
}

export interface JobProfileConfig {
  baselineSatisfaction: number
  enjoymentHalfLife: number
  shelfLife: number
  takesWorkHome: number
  payMode: PayMode
  salary: number
  hoursPerWeek: number
  hourlyRate: number
}

export interface SatisfactionPoint {
  hours: number
  satisfaction: number
}

export interface AppConfig {
  obligations: ObligationConfig[]
  workHoursPerDay: number
  jobProfile: JobProfileConfig
}

export interface TimeBreakdown {
  work: number
  obligations: number
  freeTime: number
  biological: number
  household: number
  personal: number
  transport: number
  custom: number
}
