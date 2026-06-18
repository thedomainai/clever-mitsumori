'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface EditableCellProps {
  value: number | undefined | null
  format: (v: number | undefined | null) => string
  onSave: (value: number) => void
  isOverridden?: boolean
  className?: string
  /** Suffix displayed inside the input (e.g. "%" ) */
  inputSuffix?: string
  /** Multiply display value by this factor for editing (e.g. 100 for percentages) */
  editScale?: number
}

export default function EditableCell({
  value,
  format,
  onSave,
  isOverridden,
  className = '',
  inputSuffix,
  editScale = 1,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEdit = useCallback(() => {
    const displayValue = value != null ? (value * editScale) : ''
    setDraft(String(displayValue))
    setEditing(true)
  }, [value, editScale])

  const commit = useCallback(() => {
    setEditing(false)
    const parsed = parseFloat(draft)
    if (isNaN(parsed)) return
    const actual = parsed / editScale
    if (actual !== value) {
      onSave(actual)
    }
  }, [draft, editScale, value, onSave])

  const cancel = useCallback(() => {
    setEditing(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const nev = e.nativeEvent ?? e
      if ((nev as KeyboardEvent).isComposing || e.keyCode === 229) return
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    },
    [commit, cancel],
  )

  if (editing) {
    return (
      <td className={`px-4 py-3 text-right ${className}`}>
        <div className="flex items-center justify-end gap-0.5">
          <input
            ref={inputRef}
            type="number"
            step="any"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-20 px-1.5 py-0.5 text-right text-sm tabular-nums border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          {inputSuffix && (
            <span className="text-xs text-slate-400">{inputSuffix}</span>
          )}
        </div>
      </td>
    )
  }

  return (
    <td
      onClick={startEdit}
      className={`
        px-4 py-3 text-right tabular-nums text-sm cursor-pointer
        hover:bg-slate-50 transition-colors
        ${isOverridden ? 'text-blue-700 font-medium' : 'text-slate-600'}
        ${className}
      `}
      title={isOverridden ? '編集済み（クリックで変更）' : 'クリックで編集'}
    >
      <span className="inline-flex items-center gap-1">
        {format(value)}
        {isOverridden && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
        )}
      </span>
    </td>
  )
}
