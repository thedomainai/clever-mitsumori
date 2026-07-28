'use client'

import type { SearchResult, ProductOverride } from '@/lib/types'
import { PRICE_CONFIG } from '@/lib/constants'
import { TableRow, TableCell } from '@/components/ui/table'
import EditableCell from '@/components/ui/editable-cell'
import Badge from '@/components/ui/badge'
import { getStockStatus, STOCK_STATUS_LABEL } from '@/lib/constants/stock-status'
import { getMaterialProperties } from '@/lib/constants/material-properties'

export interface ResultsRowProps {
  result: SearchResult
  override?: ProductOverride
  onSaveOverride: (ecHinban: string, fields: Partial<Omit<ProductOverride, 'updated_at'>>) => void
  /** When false, the editable columns render as plain text */
  canEdit: boolean
}

function formatPrice(price: number | undefined | null): string {
  if (price == null) return '-'
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatPercent(rate: number | undefined | null): string {
  if (rate == null) return '-'
  return `${(rate * 100).toFixed(0)}%`
}

export default function ResultsRow({ result, override, onSaveOverride, canEdit }: ResultsRowProps) {
  const { product, calculatedPrice } = result
  const ecHinban = product.ec_hinban
  const stockStatus = getStockStatus(product)
  const materialProps = getMaterialProperties(product.zaishitsu)
  const materialTitle = materialProps
    ? `${materialProps.label} / 使用温度 ${materialProps.heatMinC ?? '?'}〜${materialProps.heatMaxC ?? '?'}℃ / 耐酸性${materialProps.acid} 耐アルカリ性${materialProps.alkali} 耐溶剤性${materialProps.solvent}`
    : undefined

  return (
    <TableRow>
      <TableCell stickyLeft className="font-medium text-stone-900 text-xs max-w-[180px] truncate">
        {product.ec_hinban}
      </TableCell>
      <TableCell className="text-xs">{product.hinban ?? '-'}</TableCell>
      <TableCell title={materialTitle} className={materialTitle ? 'cursor-help decoration-dotted underline underline-offset-2' : undefined}>
        {product.zaishitsu ?? '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.meopen_um != null ? `${product.meopen_um}` : '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.mesh_count != null ? `${product.mesh_count}` : '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.senkei_um != null ? `${product.senkei_um}` : '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.kaikouritsu != null ? `${product.kaikouritsu}` : '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.zaiko_haba_mm != null ? `${product.zaiko_haba_mm}` : '-'}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {stockStatus === 'in_stock' ? (
          <span className="inline-flex items-center gap-1.5 justify-end">
            <span className="tabular-nums text-stone-700">{product.nokori_m}m</span>
            <Badge color="green">在庫</Badge>
          </span>
        ) : stockStatus === 'direct_ship' ? (
          <span title={STOCK_STATUS_LABEL.direct_ship} className="cursor-help">
            <Badge color="yellow">直送品</Badge>
          </span>
        ) : (
          <span title={STOCK_STATUS_LABEL.unmatched} className="cursor-help">
            <Badge color="gray">品番未整備</Badge>
          </span>
        )}
      </TableCell>
      <TableCell className="text-xs max-w-[120px] truncate">{product.size ?? '-'}</TableCell>
      <TableCell>{product.color ?? '-'}</TableCell>
      <EditableCell
        value={product.shiire_per_m}
        format={formatPrice}
        isOverridden={override?.shiire_per_m != null}
        onSave={(v) => onSaveOverride(ecHinban, { shiire_per_m: v })}
        readOnly={!canEdit}
      />
      <EditableCell
        value={product.kotei_hi ?? PRICE_CONFIG.defaultFixedCost}
        format={formatPrice}
        isOverridden={override?.kotei_hi != null}
        onSave={(v) => onSaveOverride(ecHinban, { kotei_hi: v })}
        readOnly={!canEdit}
      />
      <EditableCell
        value={product.arari_rate ?? PRICE_CONFIG.defaultGrossMarginRate}
        format={formatPercent}
        isOverridden={override?.arari_rate != null}
        onSave={(v) => onSaveOverride(ecHinban, { arari_rate: v })}
        inputSuffix="%"
        editScale={100}
        readOnly={!canEdit}
      />
      <TableCell className="text-right tabular-nums font-semibold text-stone-900">
        {formatPrice(calculatedPrice)}
      </TableCell>
      <TableCell className="text-right tabular-nums text-stone-500">{formatPrice(product.rakuten_price)}</TableCell>
      <TableCell className="text-right tabular-nums text-stone-500">{formatPrice(product.yahoo_price)}</TableCell>
      <TableCell className="text-right tabular-nums text-stone-500">{formatPrice(product.amazon_price)}</TableCell>
    </TableRow>
  )
}
