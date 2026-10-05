'use client'

import { useEffect, useRef, useState } from 'react'

export interface MultiSelectOption {
  value: string
  count?: number
}

export interface MultiSelectProps {
  label?: React.ReactNode
  options: MultiSelectOption[]
  selected: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[　\s]/g, '')
    .normalize('NFKC')
}

/**
 * チップ表示付きの複数選択ドロップダウン。
 * パネル内の絞り込み入力での Enter は親フォームの検索を発火させない。
 */
export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = '選択してください',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const q = normalize(query)
  const visibleOptions = q ? options.filter((o) => normalize(o.value).includes(q)) : options

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    const nev = e.nativeEvent ?? e
    if ((nev as KeyboardEvent).isComposing || e.keyCode === 229) return
    if (e.key === 'Enter') e.stopPropagation()
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {label && <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full min-h-10 pl-2 pr-3 py-1 flex flex-wrap items-center gap-1 text-sm text-left rounded-lg border border-stone-300 bg-white hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-500 transition-colors duration-150"
      >
        {selected.length === 0 ? (
          <span className="px-1 text-stone-400">{placeholder}</span>
        ) : (
          selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 bg-stone-100 text-stone-700 rounded-md text-xs"
            >
              {v}
              <span
                role="button"
                aria-label={`${v} を外す`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(v)
                }}
                className="w-4 h-4 inline-flex items-center justify-center rounded text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                ×
              </span>
            </span>
          ))
        )}
        <svg
          className={`w-3.5 h-3.5 ml-auto text-stone-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lifted"
          onKeyDown={handlePanelKeyDown}
        >
          <div className="p-2 border-b border-stone-100">
            <input
              type="text"
              autoFocus
              placeholder="材質名で絞り込み"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-8 px-2.5 text-sm rounded-md border border-stone-200 bg-stone-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-stone-400"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {visibleOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-stone-400">該当する選択肢がありません</li>
            )}
            {visibleOptions.map((o) => {
              const checked = selected.includes(o.value)
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="w-full px-3 py-1.5 flex items-center gap-2 text-sm text-left hover:bg-stone-50 transition-colors"
                  >
                    <span
                      className={`w-4 h-4 inline-flex items-center justify-center rounded border flex-shrink-0 ${
                        checked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-stone-300 bg-white text-transparent'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="flex-1 text-stone-700">{o.value}</span>
                    {o.count != null && (
                      <span className="text-xs text-stone-400">{o.count.toLocaleString()}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">{selected.length} 件選択中</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                すべて外す
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
