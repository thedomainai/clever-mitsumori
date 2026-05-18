import { findAlternatives } from '@/lib/services/alternative-finder'
import type { UnifiedProduct } from '@/lib/types'

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

describe('findAlternatives', () => {
  it('should return alternatives for out-of-stock product in same category', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 110,
        width: 1000,
        stockQuantity: 50,
        purchasePrice: 110,
      }),
      createMockProduct({
        id: '3',
        productType: 'mesh',
        meshSize: 90,
        width: 1000,
        stockQuantity: 30,
        purchasePrice: 90,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.length).toBeGreaterThan(0)
    expect(result.data.alternatives.every(alt => alt.product.productType === 'mesh')).toBe(true)
  })

  it('should not include products from different category', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'netoron',
        width: 1000,
        stockQuantity: 50,
        purchasePrice: 100,
      }),
      createMockProduct({
        id: '3',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        stockQuantity: 30,
        purchasePrice: 100,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.every(alt => alt.product.productType === 'mesh')).toBe(true)
    expect(result.data.alternatives.some(alt => alt.product.productType === 'netoron')).toBe(false)
  })

  it('should not include out-of-stock products as alternatives', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        stockQuantity: 0,
        purchasePrice: 100,
      }),
      createMockProduct({
        id: '3',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        stockQuantity: 50,
        purchasePrice: 100,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.every(alt => alt.product.stockQuantity > 0)).toBe(true)
  })

  it('should not include target product itself', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        stockQuantity: 50,
        purchasePrice: 100,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.every(alt => alt.product.id !== targetProduct.id)).toBe(true)
  })

  it('should filter out alternatives with similarity score below 0.3', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        stockQuantity: 50,
        purchasePrice: 100,
      }),
      createMockProduct({
        id: '3',
        productType: 'mesh',
        meshSize: 500,
        width: 5000,
        stockQuantity: 1,
        purchasePrice: 1000,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.every(alt => alt.similarityScore >= 0.3)).toBe(true)
  })

  it('should respect maxResults parameter', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({ id: '2', productType: 'mesh', meshSize: 100, width: 1000, stockQuantity: 50, purchasePrice: 100 }),
      createMockProduct({ id: '3', productType: 'mesh', meshSize: 100, width: 1000, stockQuantity: 50, purchasePrice: 100 }),
      createMockProduct({ id: '4', productType: 'mesh', meshSize: 100, width: 1000, stockQuantity: 50, purchasePrice: 100 }),
      createMockProduct({ id: '5', productType: 'mesh', meshSize: 100, width: 1000, stockQuantity: 50, purchasePrice: 100 }),
    ]

    const result = findAlternatives(targetProduct, allProducts, 2)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives.length).toBeLessThanOrEqual(2)
  })

  it('should include differences structure with diff and diffPercentage', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      purchasePrice: 100,
      stockQuantity: 0,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 110,
        width: 1100,
        purchasePrice: 120,
        stockQuantity: 50,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    const alternative = result.data.alternatives[0]
    expect(alternative.differences).toBeDefined()
    expect(alternative.differences.meshSize.diff).toBeDefined()
    expect(alternative.differences.meshSize.diffPercentage).toBeDefined()
    expect(alternative.differences.width.diff).toBeDefined()
    expect(alternative.differences.width.diffPercentage).toBeDefined()
    expect(alternative.differences.price.diff).toBeDefined()
    expect(alternative.differences.price.diffPercentage).toBeDefined()
  })

  it('should sort alternatives by similarity score descending', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      purchasePrice: 100,
      stockQuantity: 0,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 90,
        width: 1000,
        purchasePrice: 100,
        stockQuantity: 50,
      }),
      createMockProduct({
        id: '3',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        purchasePrice: 100,
        stockQuantity: 100,
      }),
      createMockProduct({
        id: '4',
        productType: 'mesh',
        meshSize: 150,
        width: 1500,
        purchasePrice: 150,
        stockQuantity: 50,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    const scores = result.data.alternatives.map(alt => alt.similarityScore)
    const sortedScores = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sortedScores)
  })

  it('should return empty array when no alternatives meet criteria', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      stockQuantity: 0,
      purchasePrice: 100,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'netoron',
        stockQuantity: 50,
        width: 1000,
        purchasePrice: 100,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.alternatives).toHaveLength(0)
  })

  it('should calculate correct price differences', () => {
    const targetProduct = createMockProduct({
      id: '1',
      productType: 'mesh',
      meshSize: 100,
      width: 1000,
      purchasePrice: 100,
      stockQuantity: 0,
    })

    const allProducts: UnifiedProduct[] = [
      targetProduct,
      createMockProduct({
        id: '2',
        productType: 'mesh',
        meshSize: 100,
        width: 1000,
        purchasePrice: 150,
        stockQuantity: 50,
      }),
    ]

    const result = findAlternatives(targetProduct, allProducts)

    expect(result.success).toBe(true)
    if (!result.success) return

    const alternative = result.data.alternatives[0]
    // diff = target - alternative = 100 - 150 = -50
    expect(alternative.differences.price.diff).toBe(-50)
    expect(alternative.differences.price.diffPercentage).toBeCloseTo(-50, 1)
  })
})
