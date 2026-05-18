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
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-semibold text-gray-900">{product.productCode}</h5>
          {product.commonKey && (
            <p className="text-sm text-gray-500">共通キー: {product.commonKey}</p>
          )}
        </div>
        <SimilarityScore score={similarityScore} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-600">幅:</span>
          <span className="ml-2 font-medium">{product.width}mm</span>
          {differences.width.diff !== 0 && (
            <span className={`ml-2 text-xs ${differences.width.diff > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              ({differences.width.diff > 0 ? '+' : ''}{differences.width.diff}mm)
            </span>
          )}
        </div>

        {product.meshSize && (
          <div>
            <span className="text-gray-600">目開き:</span>
            <span className="ml-2 font-medium">{product.meshSize}μ</span>
            {differences.meshSize.diff !== null && differences.meshSize.diff !== 0 && (
              <span className={`ml-2 text-xs ${(differences.meshSize.diff ?? 0) > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                ({(differences.meshSize.diff ?? 0) > 0 ? '+' : ''}{differences.meshSize.diff}μ)
              </span>
            )}
          </div>
        )}

        <div>
          <span className="text-gray-600">在庫:</span>
          <span className="ml-2 font-medium">{product.stockQuantity.toFixed(1)}m</span>
        </div>

        <div>
          <span className="text-gray-600">仕入値:</span>
          <span className="ml-2 font-medium">
            <PriceDisplay price={product.purchasePrice} />
          </span>
          {differences.price.diff !== 0 && (
            <span className={`ml-2 text-xs ${differences.price.diff > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              ({differences.price.diff > 0 ? '+' : ''}
              <PriceDisplay price={differences.price.diff} showCurrency={false} />)
            </span>
          )}
        </div>

        {product.material && (
          <div>
            <span className="text-gray-600">材質:</span>
            <span className="ml-2 font-medium">{product.material}</span>
          </div>
        )}

        {product.color && (
          <div>
            <span className="text-gray-600">カラー:</span>
            <span className="ml-2 font-medium">{product.color}</span>
          </div>
        )}
      </div>

      {reason && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          {reason}
        </div>
      )}
    </div>
  )
}
