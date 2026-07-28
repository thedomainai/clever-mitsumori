'use client'

export interface RangeFieldProps {
  label: string
  /** Unit shown inside both fields (e.g. "μm", "mm", "%") */
  unit?: string
  minValue: string
  maxValue: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  minPlaceholder?: string
  maxPlaceholder?: string
}

/**
 * A min–max numeric range presented as one visual unit:
 * [ min ] 〜 [ max ]  — far less noisy than two labeled inputs.
 */
export default function RangeField({
  label,
  unit,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = '下限なし',
  maxPlaceholder = '上限なし',
}: RangeFieldProps) {
  const inputClass = `
    w-full h-10 min-w-0 px-3 text-sm rounded-lg border border-stone-300 bg-white
    placeholder:text-stone-400
    hover:border-stone-400
    focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500
    transition-colors duration-150
    ${unit ? 'pr-9' : ''}
  `

  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            placeholder={minPlaceholder}
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
          />
          {unit && (
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-stone-400">
              {unit}
            </span>
          )}
        </div>
        <span className="text-stone-400 text-sm flex-shrink-0">〜</span>
        <div className="relative flex-1 min-w-0">
          <input
            type="number"
            inputMode="decimal"
            className={inputClass}
            placeholder={maxPlaceholder}
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
          />
          {unit && (
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-stone-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
