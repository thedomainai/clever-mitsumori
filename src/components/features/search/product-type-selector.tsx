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
      <label className="block text-sm font-medium text-gray-700 mb-2">商品タイプ</label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${
                value === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
