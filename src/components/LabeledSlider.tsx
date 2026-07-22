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
}

export function LabeledSlider({
  stops,
  value,
  onChange,
  label,
  unit = '',
  showValue = true,
  snap = false,
}: LabeledSliderProps) {
  const min = Math.min(...stops.map((s) => s.value))
  const max = Math.max(...stops.map((s) => s.value))
  const step = snap ? undefined : 0.25

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
        percent: max === min ? 50 : ((s.value - min) / (max - min)) * 100,
      })),
    [stops, min, max]
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
      <div className="labeled-slider__track-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="labeled-slider__input"
        />
        <div className="labeled-slider__stops">
          {stopPositions.map((s) => (
            <div
              key={s.value}
              className="labeled-slider__stop"
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
