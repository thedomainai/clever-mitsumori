'use client'

import { useState } from 'react'
import SearchForm from '@/components/features/search/search-form'
import ResultsTable from '@/components/features/results/results-table'
import AlternativesDialog from '@/components/features/alternatives/alternatives-dialog'
import { useInventory } from '@/hooks/use-inventory'
import { useSearch } from '@/hooks/use-search'
import { UnifiedProduct, Alternative, SearchFilter } from '@/lib/types'
import { findAlternatives } from '@/lib/services/alternative-finder'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function SearchPage() {
  const { products, isLoading: isLoadingInventory } = useInventory()
  const { results, pagination, sortColumn, sortDirection, search, onSort, onPageChange } = useSearch(products)
  const [showAlternativesDialog, setShowAlternativesDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null)
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false)

  const handleSearch = (filters: SearchFilter) => {
    search(filters)
  }

  const handleShowAlternatives = (product: UnifiedProduct) => {
    setSelectedProduct(product)
    setShowAlternativesDialog(true)
    setIsLoadingAlternatives(true)

    const result = findAlternatives(product, products, 5)

    if (result.success) {
      setAlternatives(result.data.alternatives)
    } else {
      setAlternatives([])
    }

    setIsLoadingAlternatives(false)
  }

  const handleCloseAlternativesDialog = () => {
    setShowAlternativesDialog(false)
    setSelectedProduct(null)
    setAlternatives([])
  }

  if (isLoadingInventory) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900">在庫データがありません</p>
          <p className="mt-1 text-sm text-slate-500">CSV取込ページからデータをアップロードしてください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">商品検索</h1>
        <p className="mt-1 text-sm text-slate-500">条件を指定して在庫商品を検索します</p>
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
        onShowAlternatives={handleShowAlternatives}
      />

      <AlternativesDialog
        isOpen={showAlternativesDialog}
        onClose={handleCloseAlternativesDialog}
        targetProduct={selectedProduct}
        alternatives={alternatives}
        isLoading={isLoadingAlternatives}
      />
    </div>
  )
}
