import { calculateEcPrice } from '@/lib/services/price-calculator'
import type { UnifiedProduct } from '@/lib/types'

function createProduct(overrides: Partial<UnifiedProduct> = {}): UnifiedProduct {
  return {
    ec_hinban: 'TEST-001',
    shiire_per_m: 500,
    cut_m: 1,
    ...overrides,
  }
}

describe('calculateEcPrice', () => {
  it('should calculate price with default arari and kotei', () => {
    // (500 * 1 + 6000) / (1 - 0.5) = 6500 / 0.5 = 13000
    const result = calculateEcPrice(createProduct({ shiire_per_m: 500, cut_m: 1 }))
    expect(result).toBe(13000)
  })

  it('should use product arari_rate when provided', () => {
    // (500 * 1 + 6000) / (1 - 0.4) = 6500 / 0.6 ≈ 10833.33 → 10833
    const result = calculateEcPrice(createProduct({ arari_rate: 0.4 }))
    expect(result).toBe(10833)
  })

  it('should use product kotei_hi when provided', () => {
    // (500 * 1 + 3000) / (1 - 0.5) = 3500 / 0.5 = 7000
    const result = calculateEcPrice(createProduct({ kotei_hi: 3000 }))
    expect(result).toBe(7000)
  })

  it('should handle cut_m greater than 1', () => {
    // (500 * 3 + 6000) / (1 - 0.5) = 7500 / 0.5 = 15000
    const result = calculateEcPrice(createProduct({ cut_m: 3 }))
    expect(result).toBe(15000)
  })

  it('should return null when shiire_per_m is missing', () => {
    const result = calculateEcPrice(createProduct({ shiire_per_m: undefined }))
    expect(result).toBeNull()
  })

  it('should return null when cut_m is missing', () => {
    const result = calculateEcPrice(createProduct({ cut_m: undefined }))
    expect(result).toBeNull()
  })

  it('should return null when arari_rate is 1 (division by zero)', () => {
    const result = calculateEcPrice(createProduct({ arari_rate: 1 }))
    expect(result).toBeNull()
  })

  it('should return null when arari_rate is greater than 1', () => {
    const result = calculateEcPrice(createProduct({ arari_rate: 1.5 }))
    expect(result).toBeNull()
  })

  it('should round result to nearest integer', () => {
    // (333 * 1 + 6000) / (1 - 0.5) = 6333 / 0.5 = 12666
    const result = calculateEcPrice(createProduct({ shiire_per_m: 333 }))
    expect(result).toBe(12666)
  })

  it('should handle shiire_per_m of 0', () => {
    // (0 * 1 + 6000) / (1 - 0.5) = 6000 / 0.5 = 12000
    const result = calculateEcPrice(createProduct({ shiire_per_m: 0 }))
    expect(result).toBe(12000)
  })
})
