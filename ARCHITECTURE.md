# Architecture

## Core Thesis

The purpose of work is money. The purpose of money is quality of life. Therefore, if a job hurts your quality of life more than the money improves it, the job is a net negative — no matter how much it pays.

This tool makes that trade-off visible and tweakable.

## The QoL Model

Quality of life at any given work-hours level is a time-weighted blend of two experiences:

1. **Work satisfaction** — how the work itself feels, weighted by hours spent doing it
2. **Free-time satisfaction** — how good your non-work hours are, given what money affords you

```
QoL(h) = (h/24) × workSat(h) + (freeTime/24) × freeTimeSat(money, freeTime)
```

Where:
- `h` = work hours per day
- `freeTime` = 24 - h - sum(obligations)
- `money` = h × hourlyRate (or salary equivalent)
- `workSat(h)` = intrinsic job satisfaction, which degrades with volume (monotony)
- `freeTimeSat(money, freeTime)` = how good off-hours are, driven by disposable income

The interesting insight: **money only buys QoL during free time.** More work hours earn more money but shrink the window where that money matters. This creates a natural optimum.

## Three Layers

### Layer 1: Config (`src/config/`)

YAML files define defaults and slider schemas. A user (or developer) edits these directly.

- `defaults.yaml` — obligation defaults, work hour defaults
- Future: `sliders.yaml` — declarative slider definitions with labeled stops and values

The config system should be extensible: adding a new parameter means adding YAML, not writing new React components.

### Layer 2: Engine (`src/engine/`)

Pure TypeScript. No React, no DOM. Just math.

- `types.ts` — all domain types
- `obligations.ts` — free time calculation, period conversion, elimination cost
- Future: `satisfaction.ts` — work satisfaction curves, monotony, career shelf-life
- Future: `financial.ts` — income calculation, money satisfaction curve, obligation elimination costs feeding back into income
- Future: `qol.ts` — composite QoL score combining all inputs

**Engine functions are the source of truth for all formulas.** The UI calls these and displays results. If you want to understand or tweak how the score is calculated, you read the engine files.

### Layer 3: UI (`src/components/`)

React components that render config as interactive controls and pipe changes to the engine.

- `LabeledSlider.tsx` — reusable slider with labeled stops (the core primitive)
- `ObligationEditor.tsx` — obligation table with add/remove/edit
- `PeriodToggle.tsx` — day/week/month/year switcher
- `TimeBar.tsx` — stacked color bar showing 24hr breakdown

## Data Flow

```
defaults.yaml
    ↓ (parsed at startup)
React state (obligations[], workHoursPerDay, jobProfile, financial)
    ↓ (on every change)
Engine functions (calculateTimeBreakdown, calculateQoL, etc.)
    ↓ (pure outputs)
Visualization components (charts, scores, comparisons)
```

## Existing: Obligations

Each obligation has:
- `name`, `category` (biological | household | personal | transport | custom)
- `hoursPerDay` (canonical unit; converted for display)
- `isDefault` (came from YAML), `isActive` (user can toggle off)
- `defaultHoursPerDay` (original value, for reset-to-default)
- Optional `costToEliminate: { amount, period }` — dollar cost to remove this obligation

Free time = `24 - workHoursPerDay - sum(active obligation hours)`

When an obligation is eliminated (toggled off) and has a costToEliminate, that cost should eventually feed back into the financial model as reduced disposable income.

---

## Roadmap

### Work Profile (next)

The Work Profile tab models how the job itself affects QoL. It needs:

#### Job Satisfaction Rating
A LabeledSlider with stops like:
- "Soul-crushing" → -30
- "Boring but bearable" → 0
- "It's fine" → 15
- "I sometimes enjoy it" → 25
- "I love this work" → 40

This is the *baseline* satisfaction at low hours. The monotony curve modifies it at higher hours.

#### Daily Monotony Curve
Models how satisfaction degrades across a workday. Two parameters:

1. **Monotony rate** — how fast the work gets boring with volume
   - "Always engaging" (like Candle Science) → slow decay
   - "Repetitive" (like assembly line) → fast decay

2. **Enjoyment half-life** — the number of hours at which satisfaction drops to 50% of baseline
   - Assembly line: ~2 hours
   - Interesting office work: ~6 hours
   - Dream job: ~10+ hours

The formula: `workSat(h) = baselineSatisfaction × e^(-monotonyRate × h)`

Or similar decay function. The key behavior: assembly line work is fun for 30 minutes but hell at 8 hours. A fascinating job stays engaging even at 10 hours.

#### Career Shelf Life
A simple multiplier, not a curve. How long this job stays interesting:
- "Weeks" → 0.3
- "Months" → 0.5
- "A year or two" → 0.7
- "Many years" → 0.9
- "Indefinitely" → 1.0

This discounts the entire QoL score. It's a gut-check, not a precise model.

#### "Takes Work Home" Factor
Quantifies how much the job bleeds into free time. A LabeledSlider:
- "I forget about work instantly" → 0
- "Occasional thoughts" → 0.1
- "Regular evening stress" → 0.3
- "Always on my mind" → 0.5
- "Never stops" → 0.8

This factor reduces freeTimeSatisfaction: your free time quality is multiplied by `(1 - takesWorkHome)`. A job that follows you home poisons the hours that were supposed to be the payoff.

#### Pay Rate
- Toggle between salary and hourly
- If salary: enter annual amount + hours/week → derives effective hourly rate
- If hourly: enter rate directly
- This feeds into the financial model

#### Mini Visualizations
Above the Work Profile controls, show two small charts:
1. **Daily satisfaction curve** — satisfaction vs hours-in-the-day, showing how the monotony decay shapes the experience
2. **QoL preview** — how this job's work satisfaction combines with the current obligation/financial setup

### Financial (later)

- Baseline financial needs (minimum viable income)
- Money satisfaction curve (diminishing returns — $0→$50k is transformative, $200k→$250k is meh)
- Obligation elimination costs feeding back as reduced income
- Tax bracket awareness (optional)

### Composite QoL Score

Once Work Profile and Financial exist, the engine combines everything:

```typescript
function calculateQoL(
  workHoursPerDay: number,
  obligations: Obligation[],
  jobProfile: JobProfile,
  financial: FinancialProfile
): QoLResult {
  const freeTime = calculateFreeTime(workHoursPerDay, obligations)
  const income = calculateIncome(workHoursPerDay, jobProfile.payRate, financial)
  const elimCost = calculateEliminationCostPerYear(obligations)
  const disposableIncome = income - elimCost - financial.baselineNeeds

  const workSat = calculateWorkSatisfaction(
    workHoursPerDay,
    jobProfile.baselineSatisfaction,
    jobProfile.monotonyRate,
    jobProfile.shelfLife
  )

  const freeTimeSat = calculateFreeTimeSatisfaction(
    freeTime,
    disposableIncome,
    financial.moneySatisfactionCurve
  ) * (1 - jobProfile.takesWorkHome)

  const compositeQoL =
    (workHoursPerDay / 24) * workSat +
    (freeTime / 24) * freeTimeSat

  return {
    compositeQoL,
    workSat,
    freeTimeSat,
    freeTime,
    income,
    disposableIncome,
    optimalHours: /* find h that maximizes compositeQoL */
  }
}
```

The top visualization should show the QoL curve across all possible work hours (0–16), with a marker at the user's current hours and a marker at the optimal.

### Save & Compare (later)

- Serialize entire state (obligations + job profile + financial) as a named JSON config
- Store in `localStorage` or a `saves/` directory
- Side-by-side comparison view: "Current Job" vs "That Offer"

### Compared to Defaults

Every parameter should show its default value (from YAML) as a reference mark. Reset-to-default already works for obligations. Extend this pattern to all sliders:
- Show a small tick or ghost marker at the default position
- Show the default value in muted text
- One-click reset to default

This lets users see how far their customizations have drifted from the baseline assumptions.
