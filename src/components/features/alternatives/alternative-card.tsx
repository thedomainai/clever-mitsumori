'use client'

import { Alternative } from '@/lib/types'
import SimilarityScore from './similarity-score'
import PriceDisplay from '../results/price-display'

export interface AlternativeCardProps {
  alternative: Alternative
}

export default function AlternativeCard({ alternative }: AlternativeCardProps) {
  const { product, similarityScore, differences, reason } = alternative

  return (
    <div className="rounded-xl border border-slate-200 p-4 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-semibold text-slate-900">{product.productCode}</h5>
          {product.commonKey && (
            <p className="text-xs text-slate-500 mt-0.5">共通キー: {product.commonKey}</p>
          )}
        </div>
        <SimilarityScore score={similarityScore} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 text-xs">幅:</span>
          <span className="font-medium text-slate-900">{product.width}mm</span>
          {differences.width.diff !== 0 && (
            <span className={`text-xs ${differences.width.diff > 0 ? 'text-red-600' : 'text-indigo-600'}`}>
              ({differences.width.diff > 0 ? '+' : ''}{differences.width.diff}mm)
            </span>
          )}
        </div>

        {product.meshSize && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 text-xs">目開き:</span>
            <span className="font-medium text-slate-900">{product.meshSize}μ</span>
            {differences.meshSize.diff !== null && differences.meshSize.diff !== 0 && (
              <span className={`text-xs ${(differences.meshSize.diff ?? 0) > 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                ({(differences.meshSize.diff ?? 0) > 0 ? '+' : ''}{differences.meshSize.diff}μ)
              </span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 text-xs">在庫:</span>
          <span className="font-medium text-slate-900">{product.stockQuantity.toFixed(1)}m</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 text-xs">仕入値:</span>
          <span className="font-medium text-slate-900">
            <PriceDisplay price={product.purchasePrice} />
          </span>
          {differences.price.diff !== 0 && (
            <span className={`text-xs ${differences.price.diff > 0 ? 'text-red-600' : 'text-indigo-600'}`}>
              ({differences.price.diff > 0 ? '+' : ''}
              <PriceDisplay price={differences.price.diff} showCurrency={false} />)
            </span>
          )}
        </div>

        {product.material && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 text-xs">材質:</span>
            <span className="font-medium text-slate-900">{product.material}</span>
          </div>
        )}

        {product.color && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-500 text-xs">カラー:</span>
            <span className="font-medium text-slate-900">{product.color}</span>
          </div>
        )}
      </div>

      {reason && (
        <p className="text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
          {reason}
        </p>
      )}
    </div>
  )
}
