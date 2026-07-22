import { useMemo } from 'react'
import type { FinancialProfile, JobProfile, Obligation } from '../engine/types'
import { effectiveHourlyRate } from '../engine/satisfaction'
import { calculateIncomeBreakdown } from '../engine/financial'
import { LabeledSlider } from './LabeledSlider'

interface FinancialEditorProps {
  financial: FinancialProfile
  onChange: (financial: FinancialProfile) => void
  workHoursPerDay: number
  jobProfile: JobProfile
  obligations: Obligation[]
}

const BASELINE_STOPS = [
  { label: 'Bare minimum', value: 15000 },
  { label: 'Modest', value: 30000 },
  { label: 'Comfortable', value: 50000 },
  { label: 'Expensive area', value: 80000 },
  { label: 'High cost', value: 120000 },
]

const SENSITIVITY_STOPS = [
  { label: 'Frugal', value: 10 },
  { label: 'Moderate', value: 30 },
  { label: 'Comfortable', value: 50 },
  { label: 'Luxury', value: 80 },
]

function formatDollars(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return '$' + Math.round(amount).toLocaleString()
  }
  return '$' + amount.toFixed(0)
}

export function FinancialEditor({
  financial,
  onChange,
  workHoursPerDay,
  jobProfile,
  obligations,
}: FinancialEditorProps) {
  const update = (patch: Partial<FinancialProfile>) =>
    onChange({ ...financial, ...patch })

  const hourly = effectiveHourlyRate(
    jobProfile.payMode,
    jobProfile.salary,
    jobProfile.hoursPerWeek,
    jobProfile.hourlyRate
  )

  const breakdown = useMemo(
    () => calculateIncomeBreakdown(workHoursPerDay, jobProfile, obligations, financial),
    [workHoursPerDay, jobProfile, obligations, financial]
  )

  const eliminatedObligations = useMemo(
    () => obligations.filter((o) => !o.isActive && o.costToEliminate),
    [obligations]
  )

  return (
    <div className="financial">
      {/* Income summary */}
      <div className="financial__summary">
        <div className="financial__summary-header">
          <span className="financial__summary-title">Income Summary</span>
          <span className="financial__summary-rate">
            {formatDollars(hourly)}/hr × {workHoursPerDay.toFixed(1)} hrs/day
          </span>
        </div>

        <div className="financial__flow">
          <div className="financial__flow-row financial__flow-row--income">
            <span>Annual Income</span>
            <span className="financial__flow-amount financial__flow-amount--positive">
              {formatDollars(breakdown.annualIncome)}
            </span>
          </div>

          <div className="financial__flow-row financial__flow-row--deduction">
            <span>Baseline Needs</span>
            <span className="financial__flow-amount financial__flow-amount--negative">
              −{formatDollars(financial.baselineNeeds)}
            </span>
          </div>

          {eliminatedObligations.length > 0 && (
            <>
              <div className="financial__flow-divider" />
              <div className="financial__flow-label">Eliminated Obligations</div>
              {eliminatedObligations.map((o) => {
                const cost = o.costToEliminate!
                const periodLabel = cost.period === 'day' ? '/day' : cost.period === 'week' ? '/wk' : cost.period === 'month' ? '/mo' : '/yr'
                const yearlyMultiplier = 365.25 / (cost.period === 'day' ? 1 : cost.period === 'week' ? 7 : cost.period === 'month' ? 30.44 : 365.25)
                const yearly = cost.amount * yearlyMultiplier
                return (
                  <div key={o.id} className="financial__flow-row financial__flow-row--deduction financial__flow-row--sub">
                    <span>
                      {o.name}
                      <span className="financial__flow-detail">
                        {' '}({formatDollars(cost.amount)}{periodLabel})
                      </span>
                    </span>
                    <span className="financial__flow-amount financial__flow-amount--negative">
                      −{formatDollars(yearly)}
                    </span>
                  </div>
                )
              })}
            </>
          )}

          <div className="financial__flow-divider financial__flow-divider--total" />
          <div className="financial__flow-row financial__flow-row--total">
            <span>Disposable Income</span>
            <span className={`financial__flow-amount ${breakdown.disposableIncome > 0 ? 'financial__flow-amount--positive' : 'financial__flow-amount--zero'}`}>
              {formatDollars(breakdown.disposableIncome)}
            </span>
          </div>
        </div>

        <div className="financial__satisfaction-badge">
          Money satisfaction: <strong>{(breakdown.moneySatisfaction * 100).toFixed(0)}%</strong>
        </div>
      </div>

      {/* Sliders */}
      <div className="financial__sliders">
        <LabeledSlider
          label="Baseline Needs"
          description="Your minimum annual cost of living — rent, food, insurance, utilities. Everything below this is survival, not quality of life."
          stops={BASELINE_STOPS}
          value={financial.baselineNeeds}
          onChange={(v) => update({ baselineNeeds: v })}
          unit=""
          showValue={false}
          step={1000}
        />
        <div className="financial__slider-value">
          {formatDollars(financial.baselineNeeds)}/year
        </div>

        <LabeledSlider
          label="Money Sensitivity"
          description="How much each additional dollar improves your life. Frugal people plateau early — a modest income buys most of their happiness. Luxury lifestyles need much more before returns diminish."
          stops={SENSITIVITY_STOPS}
          value={financial.moneySensitivity}
          onChange={(v) => update({ moneySensitivity: v })}
          step={1}
        />
      </div>
    </div>
  )
}
