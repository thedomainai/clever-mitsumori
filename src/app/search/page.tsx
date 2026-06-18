'use client'

import SearchForm from '@/components/features/search/search-form'
import ResultsTable from '@/components/features/results/results-table'
import { useInventory } from '@/hooks/use-inventory'
import { useProductOverrides } from '@/hooks/use-product-overrides'
import { useSearch } from '@/hooks/use-search'
import type { SearchFilter } from '@/lib/types'
import LoadingSpinner from '@/components/ui/loading-spinner'

const CATEGORIES = [
  { key: 'mesh', label: 'メッシュ', active: true },
  { key: 'netoron', label: 'ネトロン', active: false },
  { key: 'trikaru', label: 'トリカル', active: false },
] as const

export default function SearchPage() {
  const { products, isLoading: baseLoading, error: baseError } = useInventory()
  const { overrides, isLoading: ovLoading, error: ovError, saveOverride } = useProductOverrides()
  const { results, pagination, sortColumn, sortDirection, search, onSort, onPageChange } =
    useSearch(products, overrides)

  const handleSearch = (filters: SearchFilter) => {
    search(filters)
  }

  const isLoading = baseLoading || ovLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const error = baseError || ovError
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">データの読み込みに失敗しました</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">商品検索・見積</h1>
        <p className="mt-1 text-sm text-slate-500">
          材質・目開きで検索し、EC 販売価格を確認できます（{products.length.toLocaleString()} 件）
        </p>
      </div>

      <div className="flex items-center gap-1">
        {CATEGORIES.map((cat) => (
          <span
            key={cat.key}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              ${cat.active
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {cat.label}
            {!cat.active && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full leading-none">
                未実装
              </span>
            )}
          </span>
        ))}
      </div>

      <SearchForm onSearch={handleSearch} />

      <ResultsTable
        results={results}
        totalResults={pagination.totalResults}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        onSort={onSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        overrides={overrides}
        onSaveOverride={saveOverride}
      />
    </div>
  )
}
