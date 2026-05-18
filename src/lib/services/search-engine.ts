import type { Result, UnifiedProduct, SearchFilter, Sort, SearchResult, Pagination } from '../types'
import { calculateEcPrice } from './price-calculator'

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u3000\s]/g, '')
    .normalize('NFKC')
}

function matchesFilter(product: UnifiedProduct, filters: SearchFilter): boolean {
  if (filters.productType && product.productType !== filters.productType) {
    return false
  }

  if (filters.productCode) {
    const normalized = normalizeString(filters.productCode)
    const productCode = normalizeString(product.productCode)
    if (!productCode.includes(normalized)) {
      return false
    }
  }

  if (filters.commonKey) {
    if (!product.commonKey) return false
    const normalized = normalizeString(filters.commonKey)
    const commonKey = normalizeString(product.commonKey)
    if (!commonKey.includes(normalized)) {
      return false
    }
  }

  if (filters.material) {
    if (!product.material) return false
    const normalized = normalizeString(filters.material)
    const material = normalizeString(product.material)
    if (!material.includes(normalized)) {
      return false
    }
  }

  if (filters.meshSize) {
    if (!product.meshSize) return false
    if (filters.meshSize.min && product.meshSize < filters.meshSize.min) {
      return false
    }
    if (filters.meshSize.max && product.meshSize > filters.meshSize.max) {
      return false
    }
  }

  if (filters.meshCount) {
    if (!product.meshCount) return false
    const normalized = normalizeString(filters.meshCount)
    const meshCount = normalizeString(product.meshCount)
    if (!meshCount.includes(normalized)) {
      return false
    }
  }

  if (filters.width) {
    if (filters.width.min && product.width < filters.width.min) {
      return false
    }
    if (filters.width.max && product.width > filters.width.max) {
      return false
    }
  }

  if (filters.color) {
    if (!product.color) return false
    const normalized = normalizeString(filters.color)
    const color = normalizeString(product.color)
    if (!color.includes(normalized)) {
      return false
    }
  }

  if (filters.inventoryStatus && product.inventoryStatus !== filters.inventoryStatus) {
    return false
  }

  if (filters.minStock !== undefined && product.stockQuantity < filters.minStock) {
    return false
  }

  if (filters.location) {
    if (!product.location) return false
    const normalized = normalizeString(filters.location)
    const location = normalizeString(product.location)
    if (!location.includes(normalized)) {
      return false
    }
  }

  if (filters.shelfLevel) {
    if (!product.shelfLevel) return false
    const normalized = normalizeString(filters.shelfLevel)
    const shelfLevel = normalizeString(product.shelfLevel)
    if (!shelfLevel.includes(normalized)) {
      return false
    }
  }

  return true
}

function sortProducts(products: UnifiedProduct[], sort?: Sort): UnifiedProduct[] {
  if (!sort) return products

  return [...products].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sort.field) {
      case 'productCode':
        aValue = a.productCode
        bValue = b.productCode
        break
      case 'width':
        aValue = a.width
        bValue = b.width
        break
      case 'stockQuantity':
        aValue = a.stockQuantity
        bValue = b.stockQuantity
        break
      case 'purchasePrice':
        aValue = a.purchasePrice
        bValue = b.purchasePrice
        break
      case 'meshSize':
        aValue = a.meshSize ?? 0
        bValue = b.meshSize ?? 0
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.order === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })
}

function getInventoryStatusLabel(status: UnifiedProduct['inventoryStatus']): string {
  switch (status) {
    case 'IN_STOCK':
      return '在庫あり'
    case 'DELIVERY_INQUIRY':
      return '納期確認'
    case 'EXCESS':
      return '余剰在庫'
  }
}

function getInventoryStatusColor(status: UnifiedProduct['inventoryStatus']): 'green' | 'red' | 'yellow' {
  switch (status) {
    case 'IN_STOCK':
      return 'green'
    case 'DELIVERY_INQUIRY':
      return 'red'
    case 'EXCESS':
      return 'yellow'
  }
}

export function searchProducts(
  products: UnifiedProduct[],
  filters: SearchFilter,
  sort?: Sort,
  page: number = 1,
  pageSize: number = 50
): Result<{ results: SearchResult[]; pagination: Pagination }> {
  try {
    const filtered = products.filter((product) => matchesFilter(product, filters))

    const sorted = sortProducts(filtered, sort)

    const totalResults = sorted.length
    const totalPages = Math.ceil(totalResults / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = sorted.slice(startIndex, endIndex)

    const results: SearchResult[] = paginatedProducts.map((product) => {
      const priceResult = calculateEcPrice(product)

      const calculatedPrice = priceResult.success
        ? priceResult.data
        : { unitPrice: 0, unitPriceWithTax: 0 }

      return {
        product,
        calculatedPrice,
        inventoryStatusLabel: getInventoryStatusLabel(product.inventoryStatus),
        inventoryStatusColor: getInventoryStatusColor(product.inventoryStatus),
        hasAlternatives: product.stockQuantity === 0,
      }
    })

    const pagination: Pagination = {
      page,
      pageSize,
      totalResults,
      totalPages,
    }

    return {
      success: true,
      data: { results, pagination },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: '検索処理に失敗しました',
        details: error,
      },
    }
  }
}
