import { useMemo } from 'react'
import type { JobProfile } from '../engine/types'
import { calculateSatisfactionCurve, effectiveHourlyRate } from '../engine/satisfaction'
import { LabeledSlider } from './LabeledSlider'
import { SatisfactionCurve } from './SatisfactionCurve'

interface WorkProfileEditorProps {
  profile: JobProfile
  onChange: (profile: JobProfile) => void
  workHoursPerDay: number
}

const SATISFACTION_STOPS = [
  { label: 'Soul-crushing', value: -30 },
  { label: 'Boring', value: 0 },
  { label: "It's fine", value: 15 },
  { label: 'Sometimes enjoy', value: 25 },
  { label: 'Love it', value: 40 },
]

const HALF_LIFE_STOPS = [
  { label: 'Assembly line', value: 2 },
  { label: 'Repetitive', value: 4 },
  { label: 'Interesting', value: 6 },
  { label: 'Engaging', value: 10 },
  { label: 'Dream job', value: 14 },
]

const SHELF_LIFE_STOPS = [
  { label: 'Weeks', value: 0.3 },
  { label: 'Months', value: 0.5 },
  { label: '1-2 years', value: 0.7 },
  { label: 'Many years', value: 0.9 },
  { label: 'Indefinitely', value: 1.0 },
]

const TAKES_WORK_HOME_STOPS = [
  { label: 'Forget instantly', value: 0 },
  { label: 'Occasional', value: 0.1 },
  { label: 'Evening stress', value: 0.3 },
  { label: 'Always on mind', value: 0.5 },
  { label: 'Never stops', value: 0.8 },
]

export function WorkProfileEditor({
  profile,
  onChange,
  workHoursPerDay,
}: WorkProfileEditorProps) {
  const update = (patch: Partial<JobProfile>) =>
    onChange({ ...profile, ...patch })

  const curve = useMemo(
    () =>
      calculateSatisfactionCurve(
        profile.baselineSatisfaction,
        profile.enjoymentHalfLife,
        profile.shelfLife
      ),
    [profile.baselineSatisfaction, profile.enjoymentHalfLife, profile.shelfLife]
  )

  const hourly = effectiveHourlyRate(
    profile.payMode,
    profile.salary,
    profile.hoursPerWeek,
    profile.hourlyRate
  )

  return (
    <div className="work-profile">
      {/* Mini visualization */}
      <div className="work-profile__viz">
        <div className="work-profile__viz-header">
          <span className="work-profile__viz-title">Daily Satisfaction Curve</span>
          <span className="work-profile__viz-subtitle">
            How the job feels as hours pile up
          </span>
        </div>
        <SatisfactionCurve
          curve={curve}
          currentHours={workHoursPerDay}
          baselineSatisfaction={profile.baselineSatisfaction}
          shelfLife={profile.shelfLife}
        />
      </div>

      {/* Sliders */}
      <div className="work-profile__sliders">
        <LabeledSlider
          label="Job Satisfaction"
          stops={SATISFACTION_STOPS}
          value={profile.baselineSatisfaction}
          onChange={(v) => update({ baselineSatisfaction: v })}
        />

        <LabeledSlider
          label="Enjoyment Half-Life"
          stops={HALF_LIFE_STOPS}
          value={profile.enjoymentHalfLife}
          onChange={(v) => update({ enjoymentHalfLife: v })}
          unit=" hrs"
        />

        <LabeledSlider
          label="Career Shelf Life"
          stops={SHELF_LIFE_STOPS}
          value={profile.shelfLife}
          onChange={(v) => update({ shelfLife: v })}
          step={0.01}
        />

        <LabeledSlider
          label="Takes Work Home"
          stops={TAKES_WORK_HOME_STOPS}
          value={profile.takesWorkHome}
          onChange={(v) => update({ takesWorkHome: v })}
          step={0.01}
        />
      </div>

      {/* Pay Rate */}
      <div className="work-profile__pay">
        <div className="work-profile__pay-header">
          <span className="work-profile__pay-title">Pay Rate</span>
          <div className="work-profile__pay-toggle">
            <button
              className={`work-profile__pay-btn ${profile.payMode === 'salary' ? 'work-profile__pay-btn--active' : ''}`}
              onClick={() => update({ payMode: 'salary' })}
            >
              Salary
            </button>
            <button
              className={`work-profile__pay-btn ${profile.payMode === 'hourly' ? 'work-profile__pay-btn--active' : ''}`}
              onClick={() => update({ payMode: 'hourly' })}
            >
              Hourly
            </button>
          </div>
        </div>

        {profile.payMode === 'salary' ? (
          <div className="work-profile__pay-fields">
            <label className="work-profile__field">
              <span className="work-profile__field-label">Annual Salary</span>
              <div className="work-profile__input-wrap">
                <span className="work-profile__input-prefix">$</span>
                <input
                  type="number"
                  className="work-profile__input"
                  value={profile.salary}
                  onChange={(e) => update({ salary: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={1000}
                />
              </div>
            </label>
            <label className="work-profile__field">
              <span className="work-profile__field-label">Hours / Week</span>
              <input
                type="number"
                className="work-profile__input"
                value={profile.hoursPerWeek}
                onChange={(e) => update({ hoursPerWeek: parseFloat(e.target.value) || 0 })}
                min={0}
                max={168}
                step={1}
              />
            </label>
          </div>
        ) : (
          <div className="work-profile__pay-fields">
            <label className="work-profile__field">
              <span className="work-profile__field-label">Hourly Rate</span>
              <div className="work-profile__input-wrap">
                <span className="work-profile__input-prefix">$</span>
                <input
                  type="number"
                  className="work-profile__input"
                  value={profile.hourlyRate}
                  onChange={(e) => update({ hourlyRate: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.5}
                />
              </div>
            </label>
          </div>
        )}

        <div className="work-profile__pay-summary">
          Effective rate: <strong>${hourly.toFixed(2)}/hr</strong>
          {profile.payMode === 'salary' && (
            <span className="work-profile__pay-detail">
              {' '}({profile.hoursPerWeek}hrs/wk × 52 weeks)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
