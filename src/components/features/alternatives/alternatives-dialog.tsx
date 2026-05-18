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
      <div className="space-y-5">
        <div className="bg-slate-50 p-4 rounded-xl">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">対象商品</p>
          <p className="font-semibold text-slate-900">{targetProduct.productCode}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>幅: {targetProduct.width}mm</span>
            {targetProduct.meshSize && <span>目開き: {targetProduct.meshSize}μ</span>}
            {targetProduct.material && <span>材質: {targetProduct.material}</span>}
            {targetProduct.color && <span>カラー: {targetProduct.color}</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : alternatives.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              候補 ({alternatives.length}件)
            </p>
            {alternatives.map((alternative, index) => (
              <AlternativeCard key={index} alternative={alternative} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-sm text-slate-500">
            代替品が見つかりませんでした
          </div>
        )}
      </div>
    </Dialog>
  )
}
