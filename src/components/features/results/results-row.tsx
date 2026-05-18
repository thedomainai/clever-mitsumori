'use client'

import { SearchResult, UnifiedProduct } from '@/lib/types'
import { TableRow, TableCell } from '@/components/ui/table'
import InventoryStatusBadge from './inventory-status-badge'
import PriceDisplay from './price-display'
import Button from '@/components/ui/button'

export interface ResultsRowProps {
  result: SearchResult
  onShowAlternatives: (product: UnifiedProduct) => void
}

export default function ResultsRow({ result, onShowAlternatives }: ResultsRowProps) {
  const { product, calculatedPrice, inventoryStatusLabel, inventoryStatusColor, hasAlternatives } = result

  const isExcess = product.inventoryStatus === 'EXCESS'
  const isOutOfStock = product.inventoryStatus === 'DELIVERY_INQUIRY'

  const rowClassName = isExcess ? 'bg-red-50' : ''

  const getCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      mesh: 'メッシュ',
      netoron: 'ネトロン',
      trikaru: 'トリカル',
    }
    return labels[type] || type
  }

  const getMaterialOrColor = () => {
    if (product.productType === 'mesh') {
      return product.material || '-'
    }
    return product.color || '-'
  }

  return (
    <TableRow className={rowClassName}>
      <TableCell>{product.productCode}</TableCell>
      <TableCell>{product.commonKey || '-'}</TableCell>
      <TableCell>{getCategoryLabel(product.productType)}</TableCell>
      <TableCell>{getMaterialOrColor()}</TableCell>
      <TableCell>{product.meshSize ? `${product.meshSize}μ` : '-'}</TableCell>
      <TableCell>{product.width}mm</TableCell>
      <TableCell>{product.meshCount || '-'}</TableCell>
      <TableCell className="text-right">{product.stockQuantity.toFixed(1)}</TableCell>
      <TableCell className="text-right">
        <PriceDisplay price={product.purchasePrice} />
      </TableCell>
      <TableCell className="text-right">
        <PriceDisplay price={calculatedPrice.unitPrice} />
      </TableCell>
      <TableCell>
        <InventoryStatusBadge status={inventoryStatusLabel} color={inventoryStatusColor} />
      </TableCell>
      <TableCell>
        {isOutOfStock && hasAlternatives && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onShowAlternatives(product)}
          >
            代替品
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
