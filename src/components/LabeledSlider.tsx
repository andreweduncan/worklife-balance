import { useCallback, useMemo } from 'react'

export interface SliderStop {
  label: string
  value: number
}

interface LabeledSliderProps {
  stops: SliderStop[]
  value: number
  onChange: (value: number) => void
  label?: string
  unit?: string
  showValue?: boolean
  /** If true, slider snaps to stop values only. If false, continuous between min/max. */
  snap?: boolean
  /** Custom step size for continuous mode (default 0.25) */
  step?: number
  /** Override the maximum value (caps below the highest stop) */
  maxValue?: number
  /** Description shown between the label and the slider */
  description?: string
}

export function LabeledSlider({
  stops,
  value,
  onChange,
  label,
  unit = '',
  showValue = true,
  snap = false,
  step: customStep,
  maxValue,
  description,
}: LabeledSliderProps) {
  const min = Math.min(...stops.map((s) => s.value))
  const stopsMax = Math.max(...stops.map((s) => s.value))
  const max = maxValue !== undefined ? Math.min(maxValue, stopsMax) : stopsMax
  const step = snap ? undefined : (customStep ?? 0.25)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value)
      if (snap) {
        const nearest = stops.reduce((prev, curr) =>
          Math.abs(curr.value - raw) < Math.abs(prev.value - raw) ? curr : prev
        )
        onChange(nearest.value)
      } else {
        onChange(raw)
      }
    },
    [stops, snap, onChange]
  )

  const stopPositions = useMemo(
    () =>
      stops.map((s) => ({
        ...s,
        percent: stopsMax === min ? 50 : ((s.value - min) / (stopsMax - min)) * 100,
        disabled: s.value > max,
      })),
    [stops, min, max, stopsMax]
  )

  return (
    <div className="labeled-slider">
      {label && (
        <div className="labeled-slider__header">
          <span className="labeled-slider__label">{label}</span>
          {showValue && (
            <span className="labeled-slider__value">
              {typeof value === 'number' ? value.toFixed(1) : value}
              {unit}
            </span>
          )}
        </div>
      )}
      {description && (
        <p className="labeled-slider__description">{description}</p>
      )}
      <div className="labeled-slider__track-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={handleChange}
          className="labeled-slider__input"
          style={maxValue !== undefined && max < stopsMax
            ? { width: `${((max - min) / (stopsMax - min)) * 100}%` }
            : undefined
          }
        />
        <div className="labeled-slider__stops">
          {stopPositions.map((s) => (
            <div
              key={s.value}
              className={`labeled-slider__stop ${s.disabled ? 'labeled-slider__stop--disabled' : ''}`}
              style={{ left: `${s.percent}%` }}
            >
              <div className="labeled-slider__tick" />
              <span className="labeled-slider__stop-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
