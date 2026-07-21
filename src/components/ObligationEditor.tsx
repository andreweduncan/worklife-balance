import { useState } from 'react'
import type { Obligation, Period } from '../engine/types'
import { convertHours, toHoursPerDay, generateId } from '../engine/obligations'

interface ObligationEditorProps {
  obligations: Obligation[]
  onChange: (obligations: Obligation[]) => void
  period: Period
}

const CATEGORY_COLORS: Record<string, string> = {
  biological: '#8b5cf6',
  household: '#f59e0b',
  personal: '#10b981',
  transport: '#6366f1',
  custom: '#ec4899',
}

export function ObligationEditor({
  obligations,
  onChange,
  period,
}: ObligationEditorProps) {
  const [newName, setNewName] = useState('')
  const [newHours, setNewHours] = useState('')
  const [newCategory, setNewCategory] =
    useState<Obligation['category']>('custom')

  const updateObligation = (id: string, updates: Partial<Obligation>) => {
    onChange(obligations.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }

  const removeObligation = (id: string) => {
    onChange(obligations.filter((o) => o.id !== id))
  }

  const addObligation = () => {
    if (!newName.trim() || !newHours) return
    const hoursPerDay = toHoursPerDay(parseFloat(newHours), period)
    onChange([
      ...obligations,
      {
        id: generateId(),
        name: newName.trim(),
        hoursPerDay,
        category: newCategory,
        isDefault: false,
        isActive: true,
      },
    ])
    setNewName('')
    setNewHours('')
  }

  const resetToDefault = (id: string) => {
    const ob = obligations.find((o) => o.id === id)
    if (ob?.defaultHoursPerDay !== undefined) {
      updateObligation(id, { hoursPerDay: ob.defaultHoursPerDay })
    }
  }

  const handleHoursChange = (id: string, displayValue: string) => {
    const parsed = parseFloat(displayValue)
    if (!isNaN(parsed) && parsed >= 0) {
      updateObligation(id, { hoursPerDay: toHoursPerDay(parsed, period) })
    }
  }

  return (
    <div className="obligation-editor">
      <table className="obligation-editor__table">
        <thead>
          <tr>
            <th className="col-active"></th>
            <th className="col-name">Obligation</th>
            <th className="col-category">Category</th>
            <th className="col-hours">Hours</th>
            <th className="col-default">Default</th>
            <th className="col-cost">Eliminate Cost</th>
            <th className="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {obligations.map((ob) => {
            const displayHours = convertHours(ob.hoursPerDay, period)
            const defaultDisplay =
              ob.defaultHoursPerDay !== undefined
                ? convertHours(ob.defaultHoursPerDay, period)
                : null
            const isModified =
              ob.defaultHoursPerDay !== undefined &&
              Math.abs(ob.hoursPerDay - ob.defaultHoursPerDay) > 0.001

            return (
              <tr
                key={ob.id}
                className={`obligation-row ${!ob.isActive ? 'obligation-row--inactive' : ''}`}
              >
                <td className="col-active">
                  <input
                    type="checkbox"
                    checked={ob.isActive}
                    onChange={(e) =>
                      updateObligation(ob.id, { isActive: e.target.checked })
                    }
                  />
                </td>
                <td className="col-name">{ob.name}</td>
                <td className="col-category">
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: CATEGORY_COLORS[ob.category] || '#999',
                    }}
                  >
                    {ob.category}
                  </span>
                </td>
                <td className="col-hours">
                  <input
                    type="number"
                    value={displayHours}
                    onChange={(e) => handleHoursChange(ob.id, e.target.value)}
                    min={0}
                    step={0.25}
                    className="hours-input"
                  />
                </td>
                <td className="col-default">
                  {defaultDisplay !== null && (
                    <span
                      className={`default-value ${isModified ? 'default-value--modified' : ''}`}
                    >
                      {defaultDisplay.toFixed(1)}
                      {isModified && (
                        <button
                          className="reset-btn"
                          onClick={() => resetToDefault(ob.id)}
                          title="Reset to default"
                        >
                          ↺
                        </button>
                      )}
                    </span>
                  )}
                </td>
                <td className="col-cost">
                  {ob.costToEliminate && (
                    <span className="cost-badge">
                      ${ob.costToEliminate.amount}/{ob.costToEliminate.period}
                    </span>
                  )}
                </td>
                <td className="col-actions">
                  {!ob.isDefault && (
                    <button
                      className="remove-btn"
                      onClick={() => removeObligation(ob.id)}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="obligation-editor__add">
        <input
          type="text"
          placeholder="Obligation name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="add-name-input"
          onKeyDown={(e) => e.key === 'Enter' && addObligation()}
        />
        <input
          type="number"
          placeholder="Hours"
          value={newHours}
          onChange={(e) => setNewHours(e.target.value)}
          min={0}
          step={0.25}
          className="add-hours-input"
          onKeyDown={(e) => e.key === 'Enter' && addObligation()}
        />
        <select
          value={newCategory}
          onChange={(e) =>
            setNewCategory(e.target.value as Obligation['category'])
          }
          className="add-category-select"
        >
          <option value="custom">Custom</option>
          <option value="biological">Biological</option>
          <option value="household">Household</option>
          <option value="personal">Personal</option>
          <option value="transport">Transport</option>
        </select>
        <button onClick={addObligation} className="add-btn">
          + Add
        </button>
      </div>
    </div>
  )
}
