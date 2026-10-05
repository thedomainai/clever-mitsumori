'use client'

import { forwardRef, useMemo, useState } from 'react'
import type { ProductOverride, UnifiedProduct } from '@/lib/types'
import type { OverrideMap } from '@/hooks/use-product-overrides'
import { Table, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import EditableCell from '@/components/ui/editable-cell'
import Badge from '@/components/ui/badge'
import MultiSelect from '@/components/ui/multi-select'
import { findSimilarProducts, productWidthMm, SIMILAR_CONFIG, type SimilarTarget } from '@/lib/services/similar-products'
import { CHEMICALS, CHEMICAL_TABLE_SOURCE } from '@/lib/constants/material-master'
import { getStockStatus } from '@/lib/constants/stock-status'

export interface SimilarPanelProps {
  /** Firestore のオーバーライドを合成済みの商品 */
  products: UnifiedProduct[]
  target: SimilarTarget
  /** 何を基準にしているか（「検索条件」「EC品番 xxx」など） */
  baseLabel: string
  onClearBase?: () => void
  overrides: OverrideMap
  onSaveOverride: (ecHinban: string, fields: Partial<Omit<ProductOverride, 'updated_at'>>) => void
  canEdit: boolean
}

const chemicalLabel = (c: { name: string; condition: string | null }) =>
  c.condition ? `${c.name}（${c.condition}）` : c.name
const CHEMICAL_OPTIONS = CHEMICALS.map((c) => ({ value: chemicalLabel(c) }))
const CHEMICAL_ID_BY_LABEL = new Map(CHEMICALS.map((c) => [chemicalLabel(c), c.id]))

const yen = (v: number | null | undefined) =>
  v == null ? '-' : new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v)

function formatDiff(diff: number): string {
  const pct = Math.round(diff * 100)
  if (pct === 0) return '一致'
  return `${pct > 0 ? '+' : ''}${pct}%`
}

const HEADERS = ['EC品番', '材質', '目開き(μm)', 'メッシュ数', 'サイズ差', '幅(mm)', '在庫', '仕入値(/m)', '算出販売価格']

const SimilarPanel = forwardRef<HTMLDivElement, SimilarPanelProps>(function SimilarPanel(
  { products, target, baseLabel, onClearBase, overrides, onSaveOverride, canEdit },
  ref,
) {
  const [heatMin, setHeatMin] = useState(target.heatMinC != null ? String(target.heatMinC) : '')
  const [chemicals, setChemicals] = useState<string[]>([])
  const [minWidth, setMinWidth] = useState(target.minWidthMm != null ? String(target.minWidthMm) : '')

  const effectiveTarget: SimilarTarget = useMemo(() => {
    const heat = parseFloat(heatMin)
    const width = parseFloat(minWidth)
    return {
      ...target,
      heatMinC: isNaN(heat) ? undefined : heat,
      minWidthMm: isNaN(width) ? undefined : width,
      chemicalIds: chemicals.map((l) => CHEMICAL_ID_BY_LABEL.get(l)!).filter((id) => id != null),
    }
  }, [target, heatMin, minWidth, chemicals])

  const result = useMemo(() => findSimilarProducts(products, effectiveTarget), [products, effectiveTarget])
  const pricedCount = result.candidates.filter((c) => c.calculatedPrice != null).length
  const sizeText = target.meopen_um != null
    ? `目開き ${target.meopen_um}μm`
    : `メッシュ数 ${target.mesh_count}`
  const materialText = target.materials && target.materials.length > 0 ? target.materials.join('・') : '材質指定なし'
  const excludedTotal = result.excluded.material + result.excluded.heatUnknown + result.excluded.chemicalUnknown

  return (
    <section ref={ref} className="space-y-3 scroll-mt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-stone-900">近い商品</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            基準: {baseLabel}（{materialText} / {sizeText}）
            {onClearBase && (
              <button type="button" onClick={onClearBase} className="ml-2 text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2">
                検索条件に戻す
              </button>
            )}
          </p>
        </div>
        <p className="text-sm text-stone-500">
          候補{' '}
          <span className="font-semibold text-stone-900 tabular-nums">{result.total.toLocaleString()}件</span>
          {result.total > result.candidates.length && (
            <span className="text-stone-400">（近い順に {result.candidates.length} 件を表示）</span>
          )}
          <span className="ml-2 text-stone-400">価格あり {pricedCount} 件</span>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-stone-200/80 shadow-card">
        <div className="p-4 flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-stone-100">
          <div className="w-full sm:w-80">
            <MultiSelect
              label={<>お客様が使う薬品 <span className="text-stone-400 font-normal">（◎か○の材質だけ）</span></>}
              options={CHEMICAL_OPTIONS}
              selected={chemicals}
              onChange={setChemicals}
              placeholder="指定なし"
            />
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-stone-500 mb-1.5">使用温度</span>
            <span className="relative inline-block">
              <input
                type="number"
                placeholder="例: 120"
                value={heatMin}
                onChange={(e) => setHeatMin(e.target.value)}
                className="w-36 h-10 pl-3 pr-14 text-sm rounded-lg border border-stone-300 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-400">℃以上</span>
            </span>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-stone-500 mb-1.5">必要な幅</span>
            <span className="relative inline-block">
              <input
                type="number"
                placeholder="例: 420"
                value={minWidth}
                onChange={(e) => setMinWidth(e.target.value)}
                className="w-36 h-10 pl-3 pr-14 text-sm rounded-lg border border-stone-300 bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-400">mm以上</span>
            </span>
          </label>
          <p className="basis-full text-[11px] text-stone-400 leading-relaxed">
            サイズ差 ±{Math.round(SIMILAR_CONFIG.maxSizeDiff * 100)}% 以内の生地を近い順に表示します。
            別の材質は、耐薬品性が全薬品で基準と同等以上（薬品を指定したときはその薬品で◎か○）で、耐熱温度が基準以上のものだけを出します。
            耐薬品性の出典: {CHEMICAL_TABLE_SOURCE}（仮の値）。耐熱温度は樹脂7素材のみ収録。
            {excludedTotal > 0 && (
              <> 材質の条件で除外 {result.excluded.material} 件
                {result.excluded.heatUnknown > 0 && `・耐熱未収録 ${result.excluded.heatUnknown} 件`}
                {result.excluded.chemicalUnknown > 0 && `・耐薬品未収録 ${result.excluded.chemicalUnknown} 件`}。
              </>
            )}
          </p>
        </div>

        {result.candidates.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500">
            条件に合う近い商品はありません。薬品・温度・幅の条件を外すと見つかる場合があります。
          </p>
        ) : (
          <Table
            maxHeight="480px"
            headers={HEADERS.map((h, i) => (
              <TableHeader key={h} align={i >= 2 && i !== 6 ? 'right' : 'left'} stickyLeft={i === 0} emphasis={h === '算出販売価格'}>
                {h}
              </TableHeader>
            ))}
          >
            {result.candidates.map((c) => {
              const p = c.product
              const override = overrides.get(p.ec_hinban)
              const stock = getStockStatus(p)
              return (
                <TableRow key={p.ec_hinban + (p.size ?? '')}>
                  <TableCell stickyLeft className="text-xs font-medium text-stone-900 max-w-[200px] truncate" title={`${p.hinban ?? ''} ${p.size ?? ''}`}>
                    {p.ec_hinban}
                    <span className="block text-[11px] font-normal text-stone-400">{p.hinban ?? '品番なし'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      {p.zaishitsu ?? '-'}
                      {c.materialMatch === 'alternative' && (
                        <span title={c.cautions.join(' / ') || '耐薬品性が基準と同等以上'} className="cursor-help">
                          <Badge color="gray">代替材質</Badge>
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums" title={p.spec_source ? `出どころ: ${p.spec_source}` : undefined}>
                    {p.meopen_um ?? '-'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.mesh_count ?? '-'}</TableCell>
                  <TableCell className={`text-right tabular-nums ${Math.abs(c.sizeDiff) < 0.005 ? 'text-stone-900 font-medium' : ''}`}>
                    {formatDiff(c.sizeDiff)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{productWidthMm(p) ?? '-'}</TableCell>
                  <TableCell>
                    {stock === 'in_stock' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="tabular-nums text-stone-700">{p.nokori_m}m</span>
                        <Badge color="green">在庫</Badge>
                      </span>
                    ) : stock === 'direct_ship' ? <Badge color="yellow">直送品</Badge> : <Badge color="gray">品番未整備</Badge>}
                  </TableCell>
                  <EditableCell
                    value={p.shiire_per_m}
                    format={(v) => (v == null ? (canEdit ? '入力' : '-') : yen(v))}
                    isOverridden={override?.shiire_per_m != null}
                    onSave={(v) => onSaveOverride(p.ec_hinban, { shiire_per_m: v })}
                    readOnly={!canEdit}
                  />
                  <TableCell className="text-right tabular-nums font-semibold text-stone-900">
                    {c.calculatedPrice != null ? yen(c.calculatedPrice) : (
                      <span className="text-xs font-normal text-stone-400">価格要確認</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </Table>
        )}
      </div>
      {canEdit && (
        <p className="text-[11px] text-stone-400">
          仕入値が空の商品は「入力」をクリックすると仕入値（1m あたり）を入力できます。入力した値は保存され、検索結果と価格計算にも反映されます。
        </p>
      )}
    </section>
  )
})

export default SimilarPanel
