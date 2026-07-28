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
  /** Disable editing entirely (e.g. when the override backend is unavailable) */
  readOnly?: boolean
}

export default function EditableCell({
  value,
  format,
  onSave,
  isOverridden,
  className = '',
  inputSuffix,
  editScale = 1,
  readOnly = false,
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
    if (readOnly) return
    const displayValue = value != null ? (value * editScale) : ''
    setDraft(String(displayValue))
    setEditing(true)
  }, [value, editScale, readOnly])

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

  if (readOnly) {
    return (
      <td
        className={`
          px-4 py-2.5 text-right tabular-nums text-sm whitespace-nowrap
          ${isOverridden ? 'text-stone-700 font-medium' : 'text-stone-500'}
          ${className}
        `}
        title="編集は無効です（保存先が未設定のため）"
      >
        <span className="inline-flex items-center gap-1.5">
          {format(value)}
          {isOverridden && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0" />
          )}
        </span>
      </td>
    )
  }

  if (editing) {
    return (
      <td className={`px-4 py-1.5 text-right whitespace-nowrap ${className}`}>
        <div className="flex items-center justify-end gap-1">
          <input
            ref={inputRef}
            type="number"
            step="any"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-24 h-8 px-2 text-right text-sm tabular-nums border border-stone-400 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500"
          />
          {inputSuffix && (
            <span className="text-xs text-stone-400">{inputSuffix}</span>
          )}
        </div>
      </td>
    )
  }

  return (
    <td
      onClick={startEdit}
      className={`
        group/cell px-4 py-2.5 text-right tabular-nums text-sm whitespace-nowrap cursor-pointer
        hover:bg-stone-100/80 transition-colors
        ${isOverridden ? 'text-blue-700 font-medium' : 'text-stone-600'}
        ${className}
      `}
      title={isOverridden ? '編集済み（クリックで変更）' : 'クリックで編集'}
    >
      <span
        className={`
          inline-flex items-center gap-1.5
          underline decoration-dotted underline-offset-4
          ${isOverridden ? 'decoration-blue-300' : 'decoration-stone-300 group-hover/cell:decoration-stone-500'}
          transition-colors
        `}
      >
        {format(value)}
        {isOverridden && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
        )}
      </span>
    </td>
  )
}
