'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { UnifiedProduct, SearchFilter, SearchResult, Pagination, Sort } from '@/lib/types'
import { searchProducts } from '@/lib/services/search-engine'

export function useSearch(products: UnifiedProduct[]) {
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

  const executeSearch = useCallback(
    (filters: SearchFilter, page: number = 1, sort?: Sort) => {
      const result = searchProducts(
        products,
        filters,
        sort,
        page,
        100
      )

      if (result.success) {
        setResults(result.data.results)
        setPagination(result.data.pagination)
        setCurrentFilters(filters)
        return true
      } else {
        setResults([])
        setPagination({
          page: 1,
          pageSize: 100,
          totalResults: 0,
          totalPages: 0,
        })
        return false
      }
    },
    [products]
  )

  // 商品データが利用可能になったら初回検索を自動実行
  useEffect(() => {
    if (products.length > 0 && !hasInitialSearchRun.current) {
      hasInitialSearchRun.current = true
      executeSearch({})
    }
  }, [products, executeSearch])

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
      const sortField = column as Sort['field']
      executeSearch(currentFilters, pagination.page, { field: sortField, order: newDirection })
    },
    [sortColumn, sortDirection, currentFilters, pagination.page, executeSearch]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      const sort: Sort | undefined = sortColumn && sortDirection
        ? { field: sortColumn as Sort['field'], order: sortDirection }
        : undefined
      executeSearch(currentFilters, page, sort)
    },
    [currentFilters, sortColumn, sortDirection, executeSearch]
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
