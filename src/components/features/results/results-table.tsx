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
}

export default function ResultsTable({
  results,
  totalResults,
  page,
  totalPages,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  overrides,
  onSaveOverride,
}: ResultsTableProps) {
  const headers = [
    { key: 'ec_hinban', label: 'EC品番' },
    { key: 'hinban', label: '品番' },
    { key: 'zaishitsu', label: '材質' },
    { key: 'meopen_um', label: '目開き(μm)' },
    { key: 'mesh_count', label: 'メッシュ数' },
    { key: 'senkei_um', label: '線径(μm)' },
    { key: 'kaikouritsu', label: '開口率(%)' },
    { key: 'zaiko_haba_mm', label: '幅(mm)' },
    { key: 'size', label: 'サイズ' },
    { key: 'color', label: 'カラー' },
    { key: 'shiire_per_m', label: '仕入値(/m)' },
    { key: 'kotei_hi', label: '固定費' },
    { key: 'arari_rate', label: '粗利率' },
    { key: 'hanbai_kakaku', label: '算出販売価格' },
    { key: 'rakuten_price', label: '楽天価格' },
    { key: 'yahoo_price', label: 'Yahoo価格' },
    { key: 'amazon_price', label: 'Amazon価格' },
  ]

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">検索結果がありません</p>
        </div>
      </div>
    )
  }

  const overrideCount = results.filter((r) => overrides.has(r.product.ec_hinban)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          検索結果: <span className="font-semibold text-slate-900">{totalResults.toLocaleString()}件</span>
          {overrideCount > 0 && (
            <span className="ml-2 text-blue-600">
              （<span className="inline-flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                {overrideCount}件 編集済み
              </span>）
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          headers={headers.map((header) => (
            <TableHeader
              key={header.key}
              sortable
              sorted={sortColumn === header.key ? sortDirection : null}
              onSort={() => onSort(header.key)}
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
