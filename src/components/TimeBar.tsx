import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
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

  const data = [
    segments.reduce(
      (acc, s) => {
        acc[s.key] = convertHours(s.hours, period)
        return acc
      },
      {} as Record<string, number>
    ),
  ]

  const totalHours = convertHours(24, period)

  return (
    <div className="time-bar">
      <div className="time-bar__header">
        <span className="time-bar__title">24-Hour Breakdown</span>
        <span className="time-bar__subtitle">({PERIOD_LABELS[period]})</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type="number" domain={[0, totalHours]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} ${PERIOD_LABELS[period]}`,
              LABELS[name] || name,
            ]}
          />
          {segments.map((s) => (
            <Bar key={s.key} dataKey={s.key} stackId="time" barSize={40}>
              <Cell fill={COLORS[s.key] || '#999'} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="time-bar__legend">
        {segments.map((s) => (
          <div key={s.key} className="time-bar__legend-item">
            <span
              className="time-bar__legend-dot"
              style={{ backgroundColor: COLORS[s.key] || '#999' }}
            />
            <span className="time-bar__legend-label">
              {LABELS[s.key] || s.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
