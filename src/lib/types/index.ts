import { z } from 'zod'

// Result type
export type Result<T> = Success<T> | Failure

type Success<T> = {
  success: true
  data: T
}

type Failure = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// Product type enum
export type ProductType = 'mesh' | 'netoron' | 'trikaru'

// Inventory status
export type InventoryStatus = 'IN_STOCK' | 'DELIVERY_INQUIRY' | 'EXCESS'

// Unified product (from Zod schema)
export type UnifiedProduct = {
  id: string
  productType: ProductType
  productCode: string
  commonKey?: string
  location?: string
  shelfLevel?: string
  material?: string
  meshSize?: number
  meshCount?: string
  width: number
  color?: string
  stockQuantity: number
  inventoryStatus: InventoryStatus
  arrivalDate: string | null
  lastShipmentDate: string | null
  purchasePrice: number
  currentPurchasePrice?: number
  unitPrice?: number
  purchasePricePerSqm?: number
  createdAt: string
  updatedAt: string
}

// Search filter
export type SearchFilter = {
  productType?: ProductType
  productCode?: string
  commonKey?: string
  material?: string
  meshSize?: { min?: number; max?: number }
  meshCount?: string
  width?: { min?: number; max?: number }
  color?: string
  inventoryStatus?: InventoryStatus
  minStock?: number
  location?: string
  shelfLevel?: string
}

// Sort
export type Sort = {
  field: 'productCode' | 'width' | 'stockQuantity' | 'purchasePrice' | 'meshSize'
  order: 'asc' | 'desc'
}

// SearchResult
export type SearchResult = {
  product: UnifiedProduct
  calculatedPrice: {
    unitPrice: number
    unitPriceWithTax: number
  }
  inventoryStatusLabel: string
  inventoryStatusColor: 'green' | 'red' | 'yellow'
  hasAlternatives: boolean
}

// PriceResult
export type PriceResult = {
  unitPrice: number
  unitPriceWithTax: number
  breakdown: {
    purchasePricePerMeter: number
    markupRate: number
    unitPriceBeforeTax: number
    unitPriceWithTax: number
  }
}

// Alternative
export type Alternative = {
  product: UnifiedProduct
  similarityScore: number
  differences: {
    meshSize: { target: number | null; alternative: number | null; diff: number | null; diffPercentage: number | null }
    width: { target: number; alternative: number; diff: number; diffPercentage: number }
    price: { target: number; alternative: number; diff: number; diffPercentage: number }
  }
  reason: string
}

// ParseStats
export type ParseStats = {
  totalRows: number
  validRows: number
  errorRows: number
  errors: Array<{ row: number; message: string; field?: string }>
}

// StorageMetadata
export type StorageMetadata = {
  lastUpdated: string
  version: string
  productCounts: {
    mesh: number
    netoron: number
    trikaru: number
    total: number
  }
}

// Pagination
export type Pagination = {
  page: number
  pageSize: number
  totalResults: number
  totalPages: number
}
