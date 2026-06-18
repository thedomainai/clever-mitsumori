import { searchProducts, mergeOverrides } from '@/lib/services/search-engine'
import type { UnifiedProduct, ProductOverride, SearchFilter, Sort } from '@/lib/types'

function createProduct(overrides: Partial<UnifiedProduct> = {}): UnifiedProduct {
  return {
    ec_hinban: 'EC-001',
    ...overrides,
  }
}

describe('searchProducts', () => {
  const products: UnifiedProduct[] = [
    createProduct({ ec_hinban: 'EC-001', zaishitsu: 'SUS304', hinban: 'M-100', meopen_um: 100, color: 'シルバー', shiire_per_m: 500, cut_m: 1 }),
    createProduct({ ec_hinban: 'EC-002', zaishitsu: 'SUS316', hinban: 'M-200', meopen_um: 300, color: 'ブラック', shiire_per_m: 800, cut_m: 2 }),
    createProduct({ ec_hinban: 'EC-003', zaishitsu: 'SUS304', hinban: 'M-300', meopen_um: 600, color: 'シルバー', shiire_per_m: 150, cut_m: 1 }),
    createProduct({ ec_hinban: 'EC-004', zaishitsu: 'ポリプロ', hinban: 'P-100', color: 'ホワイト', shiire_per_m: 200, cut_m: 1 }),
    createProduct({ ec_hinban: 'EC-005', zaishitsu: 'SUS304', hinban: 'M-400', meopen_um: 50 }),
  ]

  it('should return all products with empty filter', () => {
    const result = searchProducts(products, {})
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(5)
    expect(result.data.pagination.totalResults).toBe(5)
  })

  it('should filter by zaishitsu partial match', () => {
    const filter: SearchFilter = { zaishitsu: 'SUS304' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(3)
    expect(result.data.results.every(r => r.product.zaishitsu === 'SUS304')).toBe(true)
  })

  it('should filter by meopen_um range', () => {
    const filter: SearchFilter = { meopen_um_min: 100, meopen_um_max: 400 }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(2)
    expect(result.data.results.map(r => r.product.meopen_um)).toEqual([100, 300])
  })

  it('should filter by meopen_um min only', () => {
    const filter: SearchFilter = { meopen_um_min: 300 }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(2)
  })

  it('should exclude products without meopen_um when filtering by range', () => {
    const filter: SearchFilter = { meopen_um_min: 0 }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    // EC-004 has no meopen_um, so excluded
    expect(result.data.results).toHaveLength(4)
  })

  it('should filter by hinban partial match', () => {
    const filter: SearchFilter = { hinban: 'M-' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(4)
  })

  it('should filter by ec_hinban partial match', () => {
    const filter: SearchFilter = { ec_hinban: 'EC-00' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(5)
  })

  it('should filter by color partial match', () => {
    const filter: SearchFilter = { color: 'シルバー' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(2)
  })

  it('should filter by freeText across fields', () => {
    const filter: SearchFilter = { freeText: 'ブラック' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(1)
    expect(result.data.results[0].product.ec_hinban).toBe('EC-002')
  })

  it('should combine multiple filters', () => {
    const filter: SearchFilter = { zaishitsu: 'SUS304', meopen_um_max: 200 }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(2)
  })

  it('should return empty results when no match', () => {
    const filter: SearchFilter = { zaishitsu: 'NONEXISTENT' }
    const result = searchProducts(products, filter)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(0)
  })

  it('should sort by meopen_um ascending', () => {
    const sort: Sort = { field: 'meopen_um', order: 'asc' }
    const result = searchProducts(products, {}, sort)
    expect(result.success).toBe(true)
    if (!result.success) return
    // null values go last
    const vals = result.data.results.map(r => r.product.meopen_um)
    expect(vals).toEqual([50, 100, 300, 600, undefined])
  })

  it('should sort by shiire_per_m descending', () => {
    const sort: Sort = { field: 'shiire_per_m', order: 'desc' }
    const result = searchProducts(products, {}, sort)
    expect(result.success).toBe(true)
    if (!result.success) return
    const vals = result.data.results.map(r => r.product.shiire_per_m)
    expect(vals).toEqual([800, 500, 200, 150, undefined])
  })

  it('should paginate results', () => {
    const result = searchProducts(products, {}, undefined, 1, 2)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results).toHaveLength(2)
    expect(result.data.pagination.page).toBe(1)
    expect(result.data.pagination.totalPages).toBe(3)
    expect(result.data.pagination.totalResults).toBe(5)
  })

  it('should include calculatedPrice in results', () => {
    const result = searchProducts(products, { ec_hinban: 'EC-001' })
    expect(result.success).toBe(true)
    if (!result.success) return
    // (500 * 1 + 6000) / (1 - 0.5) = 13000
    expect(result.data.results[0].calculatedPrice).toBe(13000)
  })

  it('should return null calculatedPrice when shiire_per_m missing', () => {
    const result = searchProducts(products, { ec_hinban: 'EC-005' })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.results[0].calculatedPrice).toBeNull()
  })
})

describe('mergeOverrides', () => {
  const baseProducts: UnifiedProduct[] = [
    createProduct({ ec_hinban: 'A-001', shiire_per_m: 500, kotei_hi: 6000, arari_rate: 0.5 }),
    createProduct({ ec_hinban: 'A-002', shiire_per_m: 300 }),
    createProduct({ ec_hinban: 'A-003', shiire_per_m: 100 }),
  ]

  it('should return products unchanged when no overrides', () => {
    const overrides = new Map<string, ProductOverride>()
    const { merged, overriddenKeys } = mergeOverrides(baseProducts, overrides)
    expect(merged).toEqual(baseProducts)
    expect(overriddenKeys.size).toBe(0)
  })

  it('should override shiire_per_m for matched product', () => {
    const overrides = new Map<string, ProductOverride>([
      ['A-001', { shiire_per_m: 800, updated_at: '2026-06-18T00:00:00Z' }],
    ])
    const { merged, overriddenKeys } = mergeOverrides(baseProducts, overrides)
    expect(merged[0].shiire_per_m).toBe(800)
    expect(merged[1].shiire_per_m).toBe(300) // untouched
    expect(overriddenKeys.has('A-001')).toBe(true)
    expect(overriddenKeys.has('A-002')).toBe(false)
  })

  it('should override kotei_hi and arari_rate independently', () => {
    const overrides = new Map<string, ProductOverride>([
      ['A-002', { kotei_hi: 3000, updated_at: '2026-06-18T00:00:00Z' }],
    ])
    const { merged } = mergeOverrides(baseProducts, overrides)
    expect(merged[1].kotei_hi).toBe(3000)
    expect(merged[1].shiire_per_m).toBe(300) // base value kept
  })

  it('should ignore overrides for non-existent products (CSV rebuilt)', () => {
    const overrides = new Map<string, ProductOverride>([
      ['DELETED-001', { shiire_per_m: 999, updated_at: '2026-06-18T00:00:00Z' }],
    ])
    const { merged, overriddenKeys } = mergeOverrides(baseProducts, overrides)
    expect(merged).toEqual(baseProducts)
    expect(overriddenKeys.size).toBe(0)
  })
})
