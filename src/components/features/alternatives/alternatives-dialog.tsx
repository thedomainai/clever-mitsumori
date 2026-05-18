'use client'

import { UnifiedProduct, Alternative } from '@/lib/types'
import Dialog from '@/components/ui/dialog'
import AlternativeCard from './alternative-card'
import LoadingSpinner from '@/components/ui/loading-spinner'

export interface AlternativesDialogProps {
  isOpen: boolean
  onClose: () => void
  targetProduct: UnifiedProduct | null
  alternatives: Alternative[]
  isLoading: boolean
}

export default function AlternativesDialog({
  isOpen,
  onClose,
  targetProduct,
  alternatives,
  isLoading,
}: AlternativesDialogProps) {
  if (!targetProduct) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="代替品候補">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">対象商品</h4>
          <div className="text-sm text-gray-700">
            <p>品番: {targetProduct.productCode}</p>
            <p>幅: {targetProduct.width}mm</p>
            {targetProduct.meshSize && <p>目開き: {targetProduct.meshSize}μ</p>}
            {targetProduct.material && <p>材質: {targetProduct.material}</p>}
            {targetProduct.color && <p>カラー: {targetProduct.color}</p>}
          </div>
        </div>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : alternatives.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">代替品リスト</h4>
            {alternatives.map((alternative, index) => (
              <AlternativeCard key={index} alternative={alternative} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            代替品が見つかりませんでした
          </div>
        )}
      </div>
    </Dialog>
  )
}
