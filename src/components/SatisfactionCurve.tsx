import { useMemo } from 'react'
import type { SatisfactionPoint } from '../engine/types'

interface SatisfactionCurveProps {
  curve: SatisfactionPoint[]
  currentHours: number
  baselineSatisfaction: number
  shelfLife: number
}

const W = 400
const H = 160
const PAD = { top: 20, right: 20, bottom: 32, left: 44 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

export function SatisfactionCurve({
  curve,
  currentHours,
  baselineSatisfaction,
  shelfLife,
}: SatisfactionCurveProps) {
  const satValues = curve.map((p) => p.satisfaction)
  const maxSat = Math.max(0, ...satValues)
  const minSat = Math.min(0, ...satValues)
  const satRange = Math.max(maxSat - minSat, 1)
  const maxHours = curve.length > 0 ? curve[curve.length - 1].hours : 16

  const toX = (h: number) => PAD.left + (h / maxHours) * PLOT_W
  const toY = (s: number) => PAD.top + PLOT_H - ((s - minSat) / satRange) * PLOT_H

  const pathD = useMemo(() => {
    if (curve.length === 0) return ''
    return curve
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.hours).toFixed(1)},${toY(p.satisfaction).toFixed(1)}`)
      .join(' ')
  }, [curve, maxHours, satRange, minSat])

  const currentSat = useMemo(() => {
    if (curve.length === 0) return 0
    const closest = curve.reduce((prev, curr) =>
      Math.abs(curr.hours - currentHours) < Math.abs(prev.hours - currentHours) ? curr : prev
    )
    return closest.satisfaction
  }, [curve, currentHours])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const step = satRange > 30 ? 10 : satRange > 10 ? 5 : 2
    const start = Math.ceil(minSat / step) * step
    for (let v = start; v <= maxSat; v += step) {
      ticks.push(v)
    }
    return ticks
  }, [minSat, maxSat, satRange])

  const xTicks = [0, 4, 8, 12, 16]

  return (
    <svg className="satisfaction-curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily satisfaction curve">
      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={`y-${v}`}>
          <line
            x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)}
            className="satisfaction-curve__grid"
          />
          <text x={PAD.left - 6} y={toY(v)} className="satisfaction-curve__axis-label" textAnchor="end" dominantBaseline="central">
            {v}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={`x-${v}`} x={toX(v)} y={H - 4} className="satisfaction-curve__axis-label" textAnchor="middle">
          {v}h
        </text>
      ))}

      {/* Zero line if range spans negative */}
      {minSat < 0 && (
        <line
          x1={PAD.left} y1={toY(0)} x2={W - PAD.right} y2={toY(0)}
          className="satisfaction-curve__zero"
        />
      )}

      {/* Curve */}
      <path d={pathD} className="satisfaction-curve__line" />

      {/* Current hours marker */}
      {currentHours > 0 && (
        <g>
          <line
            x1={toX(currentHours)} y1={PAD.top}
            x2={toX(currentHours)} y2={PAD.top + PLOT_H}
            className="satisfaction-curve__marker-line"
          />
          <circle
            cx={toX(currentHours)} cy={toY(currentSat)}
            r={4}
            className="satisfaction-curve__marker-dot"
          />
          <text
            x={toX(currentHours)} y={toY(currentSat) - 10}
            className="satisfaction-curve__marker-label"
            textAnchor="middle"
          >
            {currentSat.toFixed(1)}
          </text>
        </g>
      )}
    </svg>
  )
}
