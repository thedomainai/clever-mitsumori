'use client'

import { useState } from 'react'
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
    { key: 'inventoryStatus', label: '在庫ステータス' },
    { key: 'actions', label: '操作' },
  ]

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        検索結果がありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-sm text-gray-600">
          検索結果: <span className="font-semibold">{totalResults}件</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
