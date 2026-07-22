import type { TimeBreakdown, Period } from '../engine/types'
import { convertHours } from '../engine/obligations'

interface TimeBarProps {
  breakdown: TimeBreakdown
  period: Period
}

const COLORS: Record<string, string> = {
  work: '#ef4444',
  biological: '#8b5cf6',
  household: '#f59e0b',
  personal: '#10b981',
  transport: '#6366f1',
  custom: '#ec4899',
  freeTime: '#22c55e',
}

const LABELS: Record<string, string> = {
  work: 'Work',
  biological: 'Biological (sleep, hygiene)',
  household: 'Household',
  personal: 'Personal',
  transport: 'Transport',
  custom: 'Custom',
  freeTime: 'Free Time',
}

const PERIOD_LABELS: Record<Period, string> = {
  day: 'hrs/day',
  week: 'hrs/week',
  month: 'hrs/month',
  year: 'hrs/year',
}

export function TimeBar({ breakdown, period }: TimeBarProps) {
  const segments = [
    { key: 'work', hours: breakdown.work },
    { key: 'biological', hours: breakdown.biological },
    { key: 'household', hours: breakdown.household },
    { key: 'personal', hours: breakdown.personal },
    { key: 'transport', hours: breakdown.transport },
    { key: 'custom', hours: breakdown.custom },
    { key: 'freeTime', hours: breakdown.freeTime },
  ].filter((s) => s.hours > 0)

  return (
    <div className="time-bar">
      <div className="time-bar__header">
        <span className="time-bar__title">24-Hour Breakdown</span>
        <span className="time-bar__subtitle">({PERIOD_LABELS[period]})</span>
      </div>
      <div className="time-bar__bar">
        {segments.map((s) => {
          const pct = (s.hours / 24) * 100
          const display = convertHours(s.hours, period)
          return (
            <div
              key={s.key}
              className="time-bar__segment"
              style={{
                width: `${pct}%`,
                backgroundColor: COLORS[s.key] || '#999',
              }}
              title={`${LABELS[s.key]}: ${display.toFixed(1)} ${PERIOD_LABELS[period]}`}
            >
              {pct > 8 && (
                <span className="time-bar__segment-label">
                  {display.toFixed(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <div className="time-bar__legend">
        {segments.map((s) => (
          <div key={s.key} className="time-bar__legend-item">
            <span
              className="time-bar__legend-dot"
              style={{ backgroundColor: COLORS[s.key] || '#999' }}
            />
            <span className="time-bar__legend-label">
              {LABELS[s.key]} — {convertHours(s.hours, period).toFixed(1)} {PERIOD_LABELS[period]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
