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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            在庫データがありません。CSV取込ページからデータをアップロードしてください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
