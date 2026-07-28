'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchForm from '@/components/features/search/search-form'
import ResultsTable from '@/components/features/results/results-table'
import { useInventory } from '@/hooks/use-inventory'
import { useProductOverrides } from '@/hooks/use-product-overrides'
import { useSearch } from '@/hooks/use-search'
import type { SearchFilter } from '@/lib/types'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { isFirebaseConfigured } from '@/lib/firebase'

const CATEGORIES = [
  { key: 'mesh', label: 'メッシュ', active: true },
  { key: 'netoron', label: 'ネトロン', active: false },
  { key: 'trikaru', label: 'トリカル', active: false },
] as const

function SearchPageInner() {
  const searchParams = useSearchParams()

  const initialFilters = useMemo(() => {
    const f: SearchFilter = {}
    const zaishitsu = searchParams.get('zaishitsu')
    if (zaishitsu) f.zaishitsu = zaishitsu
    const min = parseFloat(searchParams.get('meopen_min') ?? '')
    if (!isNaN(min)) f.meopen_um_min = min
    const max = parseFloat(searchParams.get('meopen_max') ?? '')
    if (!isNaN(max)) f.meopen_um_max = max
    return f
  }, [searchParams])

  const { products, isLoading: baseLoading, error: baseError } = useInventory()
  const { overrides, isLoading: ovLoading, error: ovError, saveOverride } = useProductOverrides()
  const { results, pagination, sortColumn, sortDirection, search, onSort, onPageChange } =
    useSearch(products, overrides)

  // Apply URL-provided filters once the data is ready
  const appliedInitial = useRef(false)
  useEffect(() => {
    if (!appliedInitial.current && products.length > 0 && Object.keys(initialFilters).length > 0) {
      appliedInitial.current = true
      search(initialFilters)
    }
  }, [products, initialFilters, search])

  const materialOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      if (p.zaishitsu) counts.set(p.zaishitsu, (counts.get(p.zaishitsu) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name)
  }, [products])

  const handleSearch = (filters: SearchFilter) => {
    search(filters)
  }

  const isLoading = baseLoading || ovLoading
  const error = baseError || ovError

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">商品検索・見積</h1>
          <p className="mt-1 text-sm text-stone-500">
            材質・目開きで検索し、EC販売価格を確認できます
            {!isLoading && !error && (
              <span className="text-stone-400">（全 {products.length.toLocaleString()} 件）</span>
            )}
          </p>
        </div>

        {/* Category segmented control */}
        <div className="inline-flex items-center gap-0.5 p-0.5 bg-stone-200/60 rounded-lg">
          {CATEGORIES.map((cat) => (
            <span
              key={cat.key}
              className={`
                inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-sm
                ${cat.active
                  ? 'bg-white shadow-card text-stone-900 font-medium'
                  : 'text-stone-400 cursor-not-allowed'
                }
              `}
            >
              {cat.label}
              {!cat.active && (
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded-full leading-none">
                  準備中
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {!isFirebaseConfigured && (
        <div className="rounded-lg border border-stone-200 bg-stone-100/70 px-4 py-3 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-stone-900">
              仕入値・固定費・粗利率の編集は現在無効です
            </p>
            <p className="mt-0.5 text-sm text-stone-500">
              保存先（Firestore）が未設定のため、変更しても保存されません。表示中の値は元データの値です。
            </p>
          </div>
        </div>
      )}

      <SearchForm
        onSearch={handleSearch}
        initialFilters={initialFilters}
        materialOptions={materialOptions}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="商品データを読み込んでいます…" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-sm font-medium text-stone-900">データの読み込みに失敗しました</p>
            <p className="mt-1 text-sm text-stone-500">{error}</p>
          </div>
        </div>
      ) : (
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
          canEdit={isFirebaseConfigured}
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  )
}
