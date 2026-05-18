import { searchProducts } from '@/lib/services/search-engine'
import type { UnifiedProduct, SearchFilter, Sort } from '@/lib/types'

function createMockProduct(overrides: Partial<UnifiedProduct> = {}): UnifiedProduct {
  return {
    id: 'test-id',
    productType: 'mesh',
    productCode: 'TEST-001',
    width: 1000,
    stockQuantity: 50,
    inventoryStatus: 'IN_STOCK',
    arrivalDate: null,
    lastShipmentDate: null,
    purchasePrice: 100,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('searchProducts', () => {
  const mockProducts: UnifiedProduct[] = [
    createMockProduct({ id: '1', productType: 'mesh', productCode: 'MESH-001', width: 1000, purchasePrice: 100, stockQuantity: 50, inventoryStatus: 'IN_STOCK' }),
    createMockProduct({ id: '2', productType: 'mesh', productCode: 'MESH-002', width: 500, purchasePrice: 200, stockQuantity: 0, inventoryStatus: 'DELIVERY_INQUIRY' }),
    createMockProduct({ id: '3', productType: 'netoron', productCode: 'NET-001', width: 1500, purchasePrice: 150, stockQuantity: 100, inventoryStatus: 'IN_STOCK' }),
    createMockProduct({ id: '4', productType: 'mesh', productCode: 'MESH-003', width: 800, purchasePrice: 300, stockQuantity: 30, inventoryStatus: 'IN_STOCK' }),
    createMockProduct({ id: '5', productType: 'netoron', productCode: 'NET-002', width: 600, purchasePrice: 250, stockQuantity: 200, inventoryStatus: 'EXCESS' }),
  ]

  it('should return all products with empty filter', () => {
    const result = searchProducts(mockProducts, {})

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(5)
    expect(result.data.pagination.totalResults).toBe(5)
  })

  it('should filter by productType', () => {
    const filter: SearchFilter = { productType: 'mesh' }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(3)
    expect(result.data.results.every(r => r.product.productType === 'mesh')).toBe(true)
  })

  it('should filter by productCode partial match', () => {
    const filter: SearchFilter = { productCode: 'MESH' }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(3)
    expect(result.data.results.every(r => r.product.productCode.includes('MESH'))).toBe(true)
  })

  it('should filter by meshSize range', () => {
    const productsWithMeshSize = [
      createMockProduct({ id: '1', productType: 'mesh', meshSize: 100 }),
      createMockProduct({ id: '2', productType: 'mesh', meshSize: 300 }),
      createMockProduct({ id: '3', productType: 'mesh', meshSize: 600 }),
    ]

    const filter: SearchFilter = { meshSize: { min: 100, max: 500 } }
    const result = searchProducts(productsWithMeshSize, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(2)
    expect(result.data.results.map(r => r.product.meshSize)).toEqual([100, 300])
  })

  it('should filter by width range', () => {
    const filter: SearchFilter = { width: { min: 500, max: 1500 } }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(5)
    expect(result.data.results.every(r => r.product.width >= 500 && r.product.width <= 1500)).toBe(true)
  })

  it('should filter by inventoryStatus', () => {
    const filter: SearchFilter = { inventoryStatus: 'EXCESS' }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(1)
    expect(result.data.results[0].product.inventoryStatus).toBe('EXCESS')
  })

  it('should sort by width ascending', () => {
    const sort: Sort = { field: 'width', order: 'asc' }
    const result = searchProducts(mockProducts, {}, sort)

    expect(result.success).toBe(true)
    if (!result.success) return

    const widths = result.data.results.map(r => r.product.width)
    expect(widths).toEqual([500, 600, 800, 1000, 1500])
  })

  it('should sort by purchasePrice descending', () => {
    const sort: Sort = { field: 'purchasePrice', order: 'desc' }
    const result = searchProducts(mockProducts, {}, sort)

    expect(result.success).toBe(true)
    if (!result.success) return

    const prices = result.data.results.map(r => r.product.purchasePrice)
    expect(prices).toEqual([300, 250, 200, 150, 100])
  })

  it('should paginate results - page 1', () => {
    const result = searchProducts(mockProducts, {}, undefined, 1, 2)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(2)
    expect(result.data.pagination.page).toBe(1)
    expect(result.data.pagination.totalPages).toBe(3)
    expect(result.data.pagination.totalResults).toBe(5)
    expect(result.data.results.map(r => r.product.id)).toEqual(['1', '2'])
  })

  it('should paginate results - page 2', () => {
    const result = searchProducts(mockProducts, {}, undefined, 2, 2)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(2)
    expect(result.data.pagination.page).toBe(2)
    expect(result.data.pagination.totalPages).toBe(3)
    expect(result.data.results.map(r => r.product.id)).toEqual(['3', '4'])
  })

  it('should map inventoryStatus to correct label', () => {
    const result = searchProducts(mockProducts, {})

    expect(result.success).toBe(true)
    if (!result.success) return

    const inStockResult = result.data.results.find(r => r.product.inventoryStatus === 'IN_STOCK')
    const deliveryResult = result.data.results.find(r => r.product.inventoryStatus === 'DELIVERY_INQUIRY')
    const excessResult = result.data.results.find(r => r.product.inventoryStatus === 'EXCESS')

    expect(inStockResult?.inventoryStatusLabel).toBe('在庫あり')
    expect(deliveryResult?.inventoryStatusLabel).toBe('納期確認')
    expect(excessResult?.inventoryStatusLabel).toBe('余剰在庫')
  })

  it('should set hasAlternatives to true when stockQuantity is 0', () => {
    const result = searchProducts(mockProducts, {})

    expect(result.success).toBe(true)
    if (!result.success) return

    const zeroStockResult = result.data.results.find(r => r.product.stockQuantity === 0)
    const inStockResult = result.data.results.find(r => r.product.stockQuantity > 0)

    expect(zeroStockResult?.hasAlternatives).toBe(true)
    expect(inStockResult?.hasAlternatives).toBe(false)
  })

  it('should include EC price in SearchResult', () => {
    const result = searchProducts(mockProducts, {})

    expect(result.success).toBe(true)
    if (!result.success) return

    const searchResult = result.data.results[0]
    expect(searchResult.calculatedPrice).toBeDefined()
    expect(searchResult.calculatedPrice.unitPrice).toBeGreaterThan(0)
    expect(searchResult.calculatedPrice.unitPriceWithTax).toBeGreaterThan(0)
  })

  it('should combine multiple filters', () => {
    const filter: SearchFilter = {
      productType: 'mesh',
      width: { min: 500, max: 1000 },
    }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(3)
    expect(result.data.results.every(r => r.product.productType === 'mesh')).toBe(true)
    expect(result.data.results.every(r => r.product.width >= 500 && r.product.width <= 1000)).toBe(true)
  })

  it('should return empty results when no products match filter', () => {
    const filter: SearchFilter = { productCode: 'NONEXISTENT' }
    const result = searchProducts(mockProducts, filter)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.results).toHaveLength(0)
    expect(result.data.pagination.totalResults).toBe(0)
  })
})
