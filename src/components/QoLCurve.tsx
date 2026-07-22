import { useMemo } from 'react'
import type { QoLPoint } from '../engine/types'

interface QoLCurveProps {
  curve: QoLPoint[]
  currentHours: number
  optimalHours: number
  currentQoL: number
}

const W = 500
const H = 200
const PAD = { top: 24, right: 24, bottom: 36, left: 50 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

export function QoLCurve({
  curve,
  currentHours,
  optimalHours,
  currentQoL,
}: QoLCurveProps) {
  const maxHours = curve.length > 0 ? curve[curve.length - 1].hours : 16

  const { minQoL, maxQoL, qolRange } = useMemo(() => {
    const vals = curve.map((p) => p.qol)
    const mn = Math.min(0, ...vals)
    const mx = Math.max(1, ...vals)
    const padding = (mx - mn) * 0.1 || 1
    return { minQoL: mn - padding, maxQoL: mx + padding, qolRange: mx - mn + padding * 2 }
  }, [curve])

  const toX = (h: number) => PAD.left + (h / maxHours) * PLOT_W
  const toY = (q: number) => PAD.top + PLOT_H - ((q - minQoL) / qolRange) * PLOT_H

  const pathD = useMemo(() => {
    if (curve.length === 0) return ''
    return curve
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.hours).toFixed(1)},${toY(p.qol).toFixed(1)}`)
      .join(' ')
  }, [curve, maxHours, qolRange, minQoL])

  const optimalQoL = useMemo(() => {
    if (curve.length === 0) return 0
    const closest = curve.reduce((prev, curr) =>
      Math.abs(curr.hours - optimalHours) < Math.abs(prev.hours - optimalHours) ? curr : prev
    )
    return closest.qol
  }, [curve, optimalHours])

  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const range = maxQoL - minQoL
    const step = range > 40 ? 10 : range > 20 ? 5 : range > 8 ? 2 : 1
    const start = Math.ceil(minQoL / step) * step
    for (let v = start; v <= maxQoL; v += step) {
      ticks.push(v)
    }
    return ticks
  }, [minQoL, maxQoL])

  const xTicks = [0, 4, 8, 12, 16]

  return (
    <svg className="qol-curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Quality of Life curve">
      {/* Grid */}
      {yTicks.map((v) => (
        <g key={`y-${v}`}>
          <line
            x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)}
            className="qol-curve__grid"
          />
          <text x={PAD.left - 6} y={toY(v)} className="qol-curve__axis-label" textAnchor="end" dominantBaseline="central">
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={`x-${v}`} x={toX(v)} y={H - 4} className="qol-curve__axis-label" textAnchor="middle">
          {v}h
        </text>
      ))}

      {/* Zero line */}
      {minQoL < 0 && (
        <line
          x1={PAD.left} y1={toY(0)} x2={W - PAD.right} y2={toY(0)}
          className="qol-curve__zero"
        />
      )}

      {/* Curve */}
      <path d={pathD} className="qol-curve__line" />

      {/* Optimal hours marker */}
      {optimalHours > 0 && Math.abs(optimalHours - currentHours) > 0.5 && (
        <g>
          <line
            x1={toX(optimalHours)} y1={PAD.top}
            x2={toX(optimalHours)} y2={PAD.top + PLOT_H}
            className="qol-curve__optimal-line"
          />
          <circle
            cx={toX(optimalHours)} cy={toY(optimalQoL)}
            r={4}
            className="qol-curve__optimal-dot"
          />
          <text
            x={toX(optimalHours)} y={PAD.top - 6}
            className="qol-curve__optimal-label"
            textAnchor="middle"
          >
            optimal {optimalHours.toFixed(1)}h
          </text>
        </g>
      )}

      {/* Current hours marker */}
      {currentHours > 0 && (
        <g>
          <line
            x1={toX(currentHours)} y1={PAD.top}
            x2={toX(currentHours)} y2={PAD.top + PLOT_H}
            className="qol-curve__current-line"
          />
          <circle
            cx={toX(currentHours)} cy={toY(currentQoL)}
            r={5}
            className="qol-curve__current-dot"
          />
          <text
            x={toX(currentHours)} y={toY(currentQoL) - 12}
            className="qol-curve__current-label"
            textAnchor="middle"
          >
            {currentQoL.toFixed(1)}
          </text>
        </g>
      )}
    </svg>
  )
}
