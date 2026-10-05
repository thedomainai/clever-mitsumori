'use client'

export interface PairFieldProps {
  label: string
  /** Unit shown inside both fields (e.g. "μm") */
  unit?: string
  tateValue: string
  yokoValue: string
  onTateChange: (value: string) => void
  onYokoChange: (value: string) => void
  /** Small helper text under the fields */
  hint?: string
}

/**
 * 縦・横の 2 値を「縦 [ ] / 横 [ ]」で入力する。
 * 「635/4300」のような織物の表記と同じ並びにしている（下限〜上限ではない）。
 */
export default function PairField({
  label,
  unit,
  tateValue,
  yokoValue,
  onTateChange,
  onYokoChange,
  hint,
}: PairFieldProps) {
  const inputClass = `
    w-full h-10 min-w-0 pl-8 text-sm rounded-lg border border-stone-300 bg-white
    placeholder:text-stone-400
    hover:border-stone-400
    focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-500
    transition-colors duration-150
    ${unit ? 'pr-9' : 'pr-3'}
  `

  const field = (side: '縦' | '横', value: string, onChange: (v: string) => void) => (
    <div className="relative flex-1 min-w-0">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-stone-500">
        {side}
      </span>
      <input
        type="number"
        inputMode="decimal"
        aria-label={`${label}（${side}）`}
        className={inputClass}
        placeholder="指定なし"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {unit && (
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-stone-400">
          {unit}
        </span>
      )}
    </div>
  )

  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-stone-500 mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        {field('縦', tateValue, onTateChange)}
        <span className="text-stone-400 text-sm flex-shrink-0">/</span>
        {field('横', yokoValue, onYokoChange)}
      </div>
      {hint && <p className="mt-1 text-[11px] text-stone-400">{hint}</p>}
    </div>
  )
}
