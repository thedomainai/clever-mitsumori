'use client'

import { ProductType } from '@/lib/types'

export interface ProductTypeSelectorProps {
  value: ProductType | 'all'
  onChange: (value: ProductType | 'all') => void
}

export default function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  const options: Array<{ value: ProductType | 'all'; label: string }> = [
    { value: 'all', label: '全て' },
    { value: 'mesh', label: 'メッシュ' },
    { value: 'netoron', label: 'ネトロン' },
    { value: 'trikaru', label: 'トリカル' },
  ]

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">商品タイプ</label>
      <div className="inline-flex rounded-lg bg-slate-100 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-150
              ${
                value === option.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
