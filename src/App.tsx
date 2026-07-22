import { useState, useMemo } from 'react'
import type { Obligation, Period } from './engine/types'
import {
  calculateTimeBreakdown,
  calculateEliminationCostPerYear,
  convertHours,
} from './engine/obligations'
import { loadDefaults, obligationsFromConfig } from './config/loadConfig'
import { TimeBar } from './components/TimeBar'
import { ObligationEditor } from './components/ObligationEditor'
import { PeriodToggle } from './components/PeriodToggle'
import { LabeledSlider } from './components/LabeledSlider'
import './App.css'

const defaults = loadDefaults()

const WORK_HOUR_STOPS = [
  { label: 'None', value: 0 },
  { label: 'Part-time', value: 4 },
  { label: 'Standard', value: 8 },
  { label: 'Overtime', value: 10 },
  { label: 'Crunch', value: 12 },
  { label: 'No life', value: 16 },
]

function App() {
  const [obligations, setObligations] = useState<Obligation[]>(() =>
    obligationsFromConfig(defaults.obligations)
  )
  const [workHoursPerDay, setWorkHoursPerDay] = useState(
    defaults.workHoursPerDay
  )
  const [period, setPeriod] = useState<Period>('day')
  const [activeTab, setActiveTab] = useState<
    'obligations' | 'work' | 'financial'
  >('obligations')

  const breakdown = useMemo(
    () => calculateTimeBreakdown(workHoursPerDay, obligations),
    [workHoursPerDay, obligations]
  )

  const eliminationCost = useMemo(
    () => calculateEliminationCostPerYear(obligations),
    [obligations]
  )

  const freeTimeDisplay = convertHours(breakdown.freeTime, period)
  const periodLabel =
    period === 'day'
      ? 'hrs/day'
      : period === 'week'
        ? 'hrs/week'
        : period === 'month'
          ? 'hrs/month'
          : 'hrs/year'

  return (
    <div className="app">
      <header className="app__header">
        <h1>WorkLife Balance</h1>
        <p className="app__subtitle">
          Understand where your time goes. Find your trade-offs.
        </p>
      </header>

      {/* Top: Visualization */}
      <section className="app__viz">
        <div className="free-time-display">
          <span className="free-time-display__number">
            {freeTimeDisplay.toFixed(1)}
          </span>
          <span className="free-time-display__unit">{periodLabel}</span>
          <span className="free-time-display__label">Free Time</span>
        </div>

        <TimeBar breakdown={breakdown} period={period} />

        {eliminationCost > 0 && (
          <div className="elimination-cost">
            You're spending{' '}
            <strong>${eliminationCost.toLocaleString()}/year</strong> to
            eliminate obligations
          </div>
        )}
      </section>

      {/* Controls bar */}
      <div className="app__controls">
        <PeriodToggle value={period} onChange={setPeriod} />
        <div className="work-hours-slider">
          <LabeledSlider
            label="Work Hours / Day"
            stops={WORK_HOUR_STOPS}
            value={workHoursPerDay}
            onChange={setWorkHoursPerDay}
            unit=" hrs"
          />
        </div>
      </div>

      {/* Bottom: Tabs */}
      <section className="app__tabs">
        <div className="tab-bar">
          <button
            className={`tab-bar__tab ${activeTab === 'obligations' ? 'tab-bar__tab--active' : ''}`}
            onClick={() => setActiveTab('obligations')}
          >
            Obligations
          </button>
          <button
            className={`tab-bar__tab ${activeTab === 'work' ? 'tab-bar__tab--active' : ''}`}
            onClick={() => setActiveTab('work')}
          >
            Work Profile
          </button>
          <button
            className={`tab-bar__tab ${activeTab === 'financial' ? 'tab-bar__tab--active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            Financial
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'obligations' && (
            <ObligationEditor
              obligations={obligations}
              onChange={setObligations}
              period={period}
            />
          )}
          {activeTab === 'work' && (
            <div className="placeholder-tab">
              <p>Work Profile — coming soon</p>
              <p className="placeholder-hint">
                Job satisfaction, monotony curves, career trajectory, "takes
                work home" factor
              </p>
            </div>
          )}
          {activeTab === 'financial' && (
            <div className="placeholder-tab">
              <p>Financial — coming soon</p>
              <p className="placeholder-hint">
                Pay rate, salary vs hourly, financial goals, money satisfaction
                curve
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
