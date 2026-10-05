import { findSimilarProducts, targetFromProduct } from '@/lib/services/similar-products'
import { CHEMICALS } from '@/lib/constants/material-master'
import type { UnifiedProduct } from '@/lib/types'

function roll(overrides: Partial<UnifiedProduct>): UnifiedProduct {
  return { ec_hinban: 'X', haba_mm: 1000, cut_m: 1, ...overrides }
}

const chemId = (name: string, condition: string) =>
  CHEMICALS.find((c) => c.name === name && c.condition === condition)!.id

describe('findSimilarProducts', () => {
  it('returns nothing without a size to compare', () => {
    const r = findSimilarProducts([roll({ ec_hinban: 'A', meopen_um: 45 })], { materials: ['ﾅｲﾛﾝ'] })
    expect(r.candidates).toHaveLength(0)
  })

  it('ranks by opening closeness and drops those beyond ±25%', () => {
    const products = [
      roll({ ec_hinban: 'far', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 60 }),
      roll({ ec_hinban: 'near', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 44 }),
      roll({ ec_hinban: 'mid', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 50 }),
    ]
    const r = findSimilarProducts(products, { materials: ['ﾅｲﾛﾝ'], meopen_um: 45 })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['near', 'mid'])
    expect(r.candidates[0].materialMatch).toBe('same')
  })

  it('falls back to mesh count when no opening is given', () => {
    const products = [roll({ ec_hinban: 'A', zaishitsu: 'SUS304', mesh_count: 400 })]
    const r = findSimilarProducts(products, { materials: ['SUS304'], mesh_count: 400 })
    expect(r.candidates[0].sizeBasis).toBe('mesh')
  })

  it('excludes processed goods (no width/length) and narrower rolls', () => {
    const products = [
      { ec_hinban: 'bag', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45 } as UnifiedProduct,
      roll({ ec_hinban: 'narrow', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45, haba_mm: 1000 }),
      roll({ ec_hinban: 'wide', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45, haba_mm: 1520 }),
    ]
    const r = findSimilarProducts(products, { materials: ['ﾅｲﾛﾝ'], meopen_um: 45, minWidthMm: 1385 })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['wide'])
  })

  it('accepts another material only if chemically at least as resistant on every chemical', () => {
    const products = [
      roll({ ec_hinban: 'ptfe', zaishitsu: 'PTFE', meopen_um: 45 }),   // ◎ everywhere
      roll({ ec_hinban: 'pet', zaishitsu: 'PET', meopen_um: 45 }),     // worse than nylon on alkali
    ]
    const r = findSimilarProducts(products, { materials: ['ﾅｲﾛﾝ'], meopen_um: 45 })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['ptfe'])
    expect(r.candidates[0].materialMatch).toBe('alternative')
    expect(r.excluded.material).toBe(1)
  })

  it('offers SUS316 as an alternative to SUS304 (HCl 10% cell corrected to △)', () => {
    const products = [roll({ ec_hinban: 'sus316', zaishitsu: 'SUS316', meopen_um: 34 })]
    const r = findSimilarProducts(products, { materials: ['SUS304'], meopen_um: 34 })
    expect(r.candidates.map((c) => c.materialMatch)).toEqual(['alternative'])
  })

  it('never offers an unmapped material (e.g. generic SUS) as an alternative', () => {
    const products = [roll({ ec_hinban: 'sus', zaishitsu: 'SUS', meopen_um: 34 })]
    const r = findSimilarProducts(products, { materials: ['SUS304'], meopen_um: 34 })
    expect(r.candidates).toHaveLength(0)
  })

  it('with customer chemicals, judges only those chemicals (◎ or ○ required)', () => {
    const toluene = chemId('トルエン', '100%・室温') // ナイロン◎ PET○ PP△
    const products = [
      roll({ ec_hinban: 'pet', zaishitsu: 'PET', meopen_um: 100 }),
      roll({ ec_hinban: 'pp', zaishitsu: 'PP', meopen_um: 100 }),
      roll({ ec_hinban: 'unknown', zaishitsu: 'ﾈﾄﾛﾝﾈｯﾄ', meopen_um: 100 }),
    ]
    const r = findSimilarProducts(products, { meopen_um: 100, chemicalIds: [toluene] })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['pet'])
    expect(r.excluded.chemicalUnknown).toBe(1)
  })

  it('with a usage temperature, drops materials below it and those with unknown heat', () => {
    const products = [
      roll({ ec_hinban: 'peek', zaishitsu: 'PEEK', meopen_um: 100 }),   // 260℃
      roll({ ec_hinban: 'nylon', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 100 }),  // 115℃
      roll({ ec_hinban: 'sus', zaishitsu: 'SUS304', meopen_um: 100 }),  // 未収録
    ]
    const r = findSimilarProducts(products, { meopen_um: 100, heatMinC: 150 })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['peek'])
    expect(r.excluded.heatUnknown).toBe(1)
  })

  it('puts same material before alternatives at equal size, then priced items', () => {
    const products = [
      roll({ ec_hinban: 'alt', zaishitsu: 'PTFE', meopen_um: 45 }),
      roll({ ec_hinban: 'same-noprice', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45 }),
      roll({ ec_hinban: 'same-priced', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45, shiire_per_m: 1000 }),
    ]
    const r = findSimilarProducts(products, { materials: ['ﾅｲﾛﾝ'], meopen_um: 45 })
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['same-priced', 'same-noprice', 'alt'])
    expect(r.candidates[1].calculatedPrice).toBeNull()
  })

  it('targetFromProduct excludes the product itself', () => {
    const base = roll({ ec_hinban: 'base', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 45 })
    const other = roll({ ec_hinban: 'other', zaishitsu: 'ﾅｲﾛﾝ', meopen_um: 46 })
    const r = findSimilarProducts([base, other], targetFromProduct(base))
    expect(r.candidates.map((c) => c.product.ec_hinban)).toEqual(['other'])
  })
})
