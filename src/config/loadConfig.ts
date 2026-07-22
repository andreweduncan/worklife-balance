import * as yaml from 'js-yaml'
import type { AppConfig, JobProfile, JobProfileConfig, Obligation, ObligationConfig } from '../engine/types'
import { generateId } from '../engine/obligations'
import defaultsRaw from './defaults.yaml?raw'

export function loadDefaults(): AppConfig {
  return yaml.load(defaultsRaw) as AppConfig
}

export function jobProfileFromConfig(config: JobProfileConfig): JobProfile {
  return { ...config }
}

export function obligationsFromConfig(
  configs: ObligationConfig[]
): Obligation[] {
  return configs.map((c) => ({
    id: generateId(),
    name: c.name,
    hoursPerDay: c.defaultHoursPerDay,
    defaultHoursPerDay: c.defaultHoursPerDay,
    category: c.category,
    isDefault: true,
    isActive: true,
    costToEliminate: c.costToEliminate,
  }))
}
