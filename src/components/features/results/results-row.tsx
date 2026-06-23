'use client'

import type { SearchResult, ProductOverride } from '@/lib/types'
import { PRICE_CONFIG } from '@/lib/constants'
import { TableRow, TableCell } from '@/components/ui/table'
import EditableCell from '@/components/ui/editable-cell'

export interface ResultsRowProps {
  result: SearchResult
  override?: ProductOverride
  onSaveOverride: (ecHinban: string, fields: Partial<Omit<ProductOverride, 'updated_at'>>) => void
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

export default function ResultsRow({ result, override, onSaveOverride }: ResultsRowProps) {
  const { product, calculatedPrice } = result
  const ecHinban = product.ec_hinban

  return (
    <TableRow>
      <TableCell className="font-medium text-slate-900 text-xs max-w-[180px] truncate">
        {product.ec_hinban}
      </TableCell>
      <TableCell className="text-xs">{product.hinban ?? '-'}</TableCell>
      <TableCell>{product.zaishitsu ?? '-'}</TableCell>
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
      <TableCell className="text-xs max-w-[120px] truncate">{product.size ?? '-'}</TableCell>
      <TableCell>{product.color ?? '-'}</TableCell>
      <EditableCell
        value={product.shiire_per_m}
        format={formatPrice}
        isOverridden={override?.shiire_per_m != null}
        onSave={(v) => onSaveOverride(ecHinban, { shiire_per_m: v })}
      />
      <EditableCell
        value={product.kotei_hi ?? PRICE_CONFIG.defaultFixedCost}
        format={formatPrice}
        isOverridden={override?.kotei_hi != null}
        onSave={(v) => onSaveOverride(ecHinban, { kotei_hi: v })}
      />
      <EditableCell
        value={product.arari_rate ?? PRICE_CONFIG.defaultGrossMarginRate}
        format={formatPercent}
        isOverridden={override?.arari_rate != null}
        onSave={(v) => onSaveOverride(ecHinban, { arari_rate: v })}
        inputSuffix="%"
        editScale={100}
      />
      <TableCell className="text-right tabular-nums font-medium">
        {formatPrice(calculatedPrice)}
      </TableCell>
      <TableCell className="text-right tabular-nums">{formatPrice(product.rakuten_price)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatPrice(product.yahoo_price)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatPrice(product.amazon_price)}</TableCell>
    </TableRow>
  )
}
