import type { Period } from '../engine/types'

interface PeriodToggleProps {
  value: Period
  onChange: (period: Period) => void
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="period-toggle">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          className={`period-toggle__btn ${value === p.value ? 'period-toggle__btn--active' : ''}`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
