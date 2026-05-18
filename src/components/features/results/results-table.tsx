'use client'

import { SearchResult, UnifiedProduct } from '@/lib/types'
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
  onShowAlternatives: (product: UnifiedProduct) => void
}

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
  onShowAlternatives,
}: ResultsTableProps) {
  const headers = [
    { key: 'productCode', label: '品番' },
    { key: 'commonKey', label: '共通キー' },
    { key: 'productType', label: 'カテゴリ' },
    { key: 'material', label: '材質/カラー' },
    { key: 'meshSize', label: '目開き(μ)' },
    { key: 'width', label: '幅(mm)' },
    { key: 'meshCount', label: 'メッシュ/線径' },
    { key: 'stockQuantity', label: '在庫(m)' },
    { key: 'purchasePrice', label: '仕入値(/m)' },
    { key: 'unitPrice', label: 'EC参考単価' },
    { key: 'inventoryStatus', label: 'ステータス' },
    { key: 'actions', label: '' },
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          検索結果: <span className="font-semibold text-slate-900">{totalResults}件</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          headers={headers.map((header) => (
            <TableHeader
              key={header.key}
              sortable={header.key !== 'actions'}
              sorted={sortColumn === header.key ? sortDirection : null}
              onSort={() => header.key !== 'actions' && onSort(header.key)}
            >
              {header.label}
            </TableHeader>
          ))}
        >
          {results.map((result, index) => (
            <ResultsRow
              key={result.product.id || index}
              result={result}
              onShowAlternatives={onShowAlternatives}
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
