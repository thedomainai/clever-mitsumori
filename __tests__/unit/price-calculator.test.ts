import { calculateEcPrice } from '@/lib/services/price-calculator'
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

describe('calculateEcPrice', () => {
  it('should calculate EC price for purchase price 100', () => {
    const product = createMockProduct({ purchasePrice: 100 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.unitPrice).toBe(150) // Math.ceil(100 * 1.5)
    expect(result.data.unitPriceWithTax).toBe(165) // Math.ceil(150 * 1.1)
  })

  it('should calculate EC price for purchase price 511', () => {
    const product = createMockProduct({ purchasePrice: 511 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    // 511 * 1.5 = 766.5 → Math.ceil = 767
    expect(result.data.unitPrice).toBe(767)
    // 767 * 1.1 = 843.7 → Math.ceil = 844
    expect(result.data.unitPriceWithTax).toBe(844)
  })

  it('should calculate EC price for purchase price 0', () => {
    const product = createMockProduct({ purchasePrice: 0 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.unitPrice).toBe(0)
    expect(result.data.unitPriceWithTax).toBe(0)
  })

  it('should round up unit price for decimal purchase price', () => {
    const product = createMockProduct({ purchasePrice: 333 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    // 333 * 1.5 = 499.5 → Math.ceil = 500
    expect(result.data.unitPrice).toBe(500)
    // 500 * 1.1 = 550 → Math.ceil = 550
    expect(result.data.unitPriceWithTax).toBe(550)
  })

  it('should round up unit price with tax for decimal result', () => {
    const product = createMockProduct({ purchasePrice: 100 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.unitPrice).toBe(150)
    expect(result.data.unitPriceWithTax).toBe(165)
  })

  it('should handle large purchase price', () => {
    const product = createMockProduct({ purchasePrice: 10000 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.unitPrice).toBe(15000)
    expect(result.data.unitPriceWithTax).toBe(16500)
  })

  it('should round up when markup results in decimal', () => {
    const product = createMockProduct({ purchasePrice: 777 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    // 777 * 1.5 = 1165.5 → Math.ceil = 1166
    expect(result.data.unitPrice).toBe(1166)
    // 1166 * 1.1 = 1282.6 → Math.ceil = 1283
    expect(result.data.unitPriceWithTax).toBe(1283)
  })

  it('should round up when tax results in decimal', () => {
    const product = createMockProduct({ purchasePrice: 667 })
    const result = calculateEcPrice(product)

    expect(result.success).toBe(true)
    if (!result.success) return

    // 667 * 1.5 = 1000.5 → Math.ceil = 1001
    expect(result.data.unitPrice).toBe(1001)
    // 1001 * 1.1 = 1101.1 → Math.ceil = 1102
    expect(result.data.unitPriceWithTax).toBe(1102)
  })
})
