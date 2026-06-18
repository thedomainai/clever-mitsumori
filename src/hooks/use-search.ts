'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { UnifiedProduct, SearchFilter, SearchResult, Pagination, Sort } from '@/lib/types'
import type { OverrideMap } from './use-product-overrides'
import { searchProducts, mergeOverrides } from '@/lib/services/search-engine'

export function useSearch(products: UnifiedProduct[], overrides: OverrideMap) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 100,
    totalResults: 0,
    totalPages: 0,
  })
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  const [currentFilters, setCurrentFilters] = useState<SearchFilter>({})
  const hasInitialSearchRun = useRef(false)

  // Merge base data with Firestore overrides
  const { merged, overriddenKeys } = useMemo(
    () => mergeOverrides(products, overrides),
    [products, overrides],
  )

  const executeSearch = useCallback(
    (filters: SearchFilter, page: number = 1, sort?: Sort) => {
      const result = searchProducts(merged, filters, sort, page, 100)

      if (result.success) {
        // Tag each result with overridden flag
        const tagged = result.data.results.map((r) => ({
          ...r,
          overridden: overriddenKeys.has(r.product.ec_hinban),
        }))
        setResults(tagged)
        setPagination(result.data.pagination)
        setCurrentFilters(filters)
        return true
      } else {
        setResults([])
        setPagination({ page: 1, pageSize: 100, totalResults: 0, totalPages: 0 })
        return false
      }
    },
    [merged, overriddenKeys],
  )

  // Re-run search when merged data or overrides change
  useEffect(() => {
    if (merged.length > 0) {
      const sort: Sort | undefined =
        sortColumn && sortDirection
          ? { field: sortColumn as Sort['field'], order: sortDirection }
          : undefined
      executeSearch(currentFilters, pagination.page, sort)
      hasInitialSearchRun.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged, overriddenKeys])

  // Initial search
  useEffect(() => {
    if (merged.length > 0 && !hasInitialSearchRun.current) {
      hasInitialSearchRun.current = true
      executeSearch({})
    }
  }, [merged, executeSearch])

  const handleSort = useCallback(
    (column: string) => {
      let newDirection: 'asc' | 'desc' = 'asc'

      if (sortColumn === column) {
        if (sortDirection === 'asc') {
          newDirection = 'desc'
        } else if (sortDirection === 'desc') {
          setSortColumn(null)
          setSortDirection(null)
          executeSearch(currentFilters, pagination.page)
          return
        }
      }

      setSortColumn(column)
      setSortDirection(newDirection)
      executeSearch(currentFilters, pagination.page, {
        field: column as Sort['field'],
        order: newDirection,
      })
    },
    [sortColumn, sortDirection, currentFilters, pagination.page, executeSearch],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      const sort: Sort | undefined =
        sortColumn && sortDirection
          ? { field: sortColumn as Sort['field'], order: sortDirection }
          : undefined
      executeSearch(currentFilters, page, sort)
    },
    [currentFilters, sortColumn, sortDirection, executeSearch],
  )

  return {
    results,
    pagination,
    sortColumn,
    sortDirection,
    search: executeSearch,
    onSort: handleSort,
    onPageChange: handlePageChange,
  }
}
