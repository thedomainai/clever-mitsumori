'use client'

import type { SearchResult, ProductOverride } from '@/lib/types'
import type { OverrideMap } from '@/hooks/use-product-overrides'
import { Table, TableHeader } from '@/components/ui/table'
import ResultsRow from './results-row'
import Pagination from './pagination'

export interface ResultsTableProps {
  results: SearchResult[]
  totalResults: number
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onSort: (column: string) => void
  sortColumn: string | null
  sortDirection: 'asc' | 'desc' | null
  overrides: OverrideMap
  onSaveOverride: (ecHinban: string, fields: Partial<Omit<ProductOverride, 'updated_at'>>) => void
  /** When false, the editable columns render as plain text */
  canEdit: boolean
}

interface HeaderDef {
  key: string
  label: string
  align?: 'left' | 'right'
  stickyLeft?: boolean
  emphasis?: boolean
}

const HEADERS: HeaderDef[] = [
  { key: 'ec_hinban', label: 'EC品番', stickyLeft: true },
  { key: 'hinban', label: '品番' },
  { key: 'zaishitsu', label: '材質' },
  { key: 'meopen_um', label: '目開き(μm)', align: 'right' },
  { key: 'mesh_count', label: 'メッシュ数', align: 'right' },
  { key: 'senkei_um', label: '線径(μm)', align: 'right' },
  { key: 'kaikouritsu', label: '開口率(%)', align: 'right' },
  { key: 'zaiko_haba_mm', label: '幅(mm)', align: 'right' },
  { key: 'nokori_m', label: '在庫', align: 'right' },
  { key: 'size', label: 'サイズ' },
  { key: 'color', label: 'カラー' },
  { key: 'shiire_per_m', label: '仕入値(/m)', align: 'right' },
  { key: 'kotei_hi', label: '固定費', align: 'right' },
  { key: 'arari_rate', label: '粗利率', align: 'right' },
  { key: 'hanbai_kakaku', label: '算出販売価格', align: 'right', emphasis: true },
  { key: 'rakuten_price', label: '楽天', align: 'right' },
  { key: 'yahoo_price', label: 'Yahoo', align: 'right' },
  { key: 'amazon_price', label: 'Amazon', align: 'right' },
]

export default function ResultsTable({
  results,
  totalResults,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  overrides,
  onSaveOverride,
  canEdit,
}: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-stone-200/80 shadow-card">
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm px-6">
            <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-900">条件に一致する商品が見つかりませんでした</p>
            <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
              条件を減らすか、目開きの範囲を広げて再検索してみてください
            </p>
          </div>
        </div>
      </div>
    )
  }

  const overrideCount = results.filter((r) => overrides.has(r.product.ec_hinban)).length
  const rangeStart = (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalResults)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-500">
          検索結果{' '}
          <span className="font-semibold text-stone-900 tabular-nums">
            {totalResults.toLocaleString()}件
          </span>
          {overrideCount > 0 && (
            <span className="ml-3 inline-flex items-center gap-1.5 text-stone-600">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              {overrideCount}件 編集済み
            </span>
          )}
        </p>
        <p className="text-xs text-stone-400 tabular-nums">
          {rangeStart.toLocaleString()}〜{rangeEnd.toLocaleString()} 件を表示
        </p>
      </div>

      <div className="bg-white rounded-lg border border-stone-200/80 shadow-card overflow-hidden">
        <Table
          maxHeight="calc(100vh - 240px)"
          headers={HEADERS.map((header) => (
            <TableHeader
              key={header.key}
              sortable
              sorted={sortColumn === header.key ? sortDirection : null}
              onSort={() => onSort(header.key)}
              align={header.align}
              stickyLeft={header.stickyLeft}
              emphasis={header.emphasis}
            >
              {header.label}
            </TableHeader>
          ))}
        >
          {results.map((result, index) => (
            <ResultsRow
              key={result.product.ec_hinban + index}
              result={result}
              override={overrides.get(result.product.ec_hinban)}
              onSaveOverride={onSaveOverride}
              canEdit={canEdit}
            />
          ))}
        </Table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
