import type { UnifiedProduct } from '../types'
import { calculateEcPrice } from './price-calculator'
import { getStockStatus } from '../constants/stock-status'
import { CHEMICALS, getChemicalGrade, getMaterialInfo, type MaterialInfo } from '../constants/material-master'
import { meetsGrade } from '../constants/material-properties'

/**
 * 類似品の条件。見積もり依頼の商品が無い（在庫切れ・未登録・価格未整備）ときに、
 * 「目開き（サイズ）・耐熱温度・耐薬品性」が近い商品を探す。
 */
export type SimilarTarget = {
  /** 基準の材質（商品データの表記）。空なら材質を問わない */
  materials?: string[]
  /** 基準の目開き（μm）。指定があればメッシュ数より優先する */
  meopen_um?: number
  /** 基準のメッシュ数（目開きが無いときに使う） */
  mesh_count?: number
  /** 必要な幅（mm）。この幅以上の商品だけを出す */
  minWidthMm?: number
  /** 使用温度（℃）。耐熱温度がこの値以上の材質だけを出す */
  heatMinC?: number
  /** お客様が使う薬品（判定表の id）。すべてで ◎ か ○ の材質だけを出す */
  chemicalIds?: number[]
  /** 候補から除く EC 品番（基準にした商品自身） */
  excludeEcHinban?: string
}

export type MaterialMatch = 'same' | 'alternative' | 'any'

export type SimilarCandidate = {
  product: UnifiedProduct
  calculatedPrice: number | null
  /** 基準とのサイズ差（+0.05 = 5% 大きい） */
  sizeDiff: number
  sizeBasis: 'meopen' | 'mesh'
  materialMatch: MaterialMatch
  /** 確認が必要な点（耐熱未確認など） */
  cautions: string[]
}

export type SimilarResult = {
  candidates: SimilarCandidate[]
  /** 条件に合うが件数上限で切った分を含む総数 */
  total: number
  /** 除外理由ごとの件数（サイズは合うが材質の条件で外れた商品） */
  excluded: { material: number; heatUnknown: number; chemicalUnknown: number }
}

export const SIMILAR_CONFIG = {
  /** サイズ差の上限（±25%）。検索の ±10% より広く取り、近い順に並べる */
  maxSizeDiff: 0.25,
  limit: 50,
} as const

export function productWidthMm(p: UnifiedProduct): number | undefined {
  return p.haba_mm ?? p.zaiko_haba_mm
}

/** 生地（幅 × 長さで売る商品）か。平袋・丸抜きなどの加工品は類似品にしない */
function isRollGood(p: UnifiedProduct): boolean {
  return productWidthMm(p) != null && p.cut_m != null
}

/** 判定表の全薬品で、candidate が base と同等以上か */
function chemicallyAtLeast(candidate: MaterialInfo, base: MaterialInfo, chemicalIds?: number[]): boolean {
  if (!candidate.tableName || !base.tableName) return false
  const ids = chemicalIds && chemicalIds.length > 0 ? chemicalIds : CHEMICALS.map((c) => c.id)
  return ids.every((id) => {
    const b = getChemicalGrade(base.tableName, id)
    const c = getChemicalGrade(candidate.tableName, id)
    if (!b) return true
    if (!c) return false
    return meetsGrade(c, b)
  })
}

export function findSimilarProducts(
  products: UnifiedProduct[],
  target: SimilarTarget,
  options: { maxSizeDiff?: number; limit?: number } = {},
): SimilarResult {
  const maxSizeDiff = options.maxSizeDiff ?? SIMILAR_CONFIG.maxSizeDiff
  const limit = options.limit ?? SIMILAR_CONFIG.limit
  const empty: SimilarResult = { candidates: [], total: 0, excluded: { material: 0, heatUnknown: 0, chemicalUnknown: 0 } }

  const sizeBasis: 'meopen' | 'mesh' | null =
    target.meopen_um != null && target.meopen_um > 0 ? 'meopen'
      : target.mesh_count != null && target.mesh_count > 0 ? 'mesh'
        : null
  if (!sizeBasis) return empty
  const targetSize = sizeBasis === 'meopen' ? target.meopen_um! : target.mesh_count!
  const maxLog = Math.log(1 + maxSizeDiff)

  const bases = (target.materials ?? []).filter(Boolean).map(getMaterialInfo)
  const baseKeys = new Set(bases.map((b) => b.key))
  const chemicalIds = target.chemicalIds ?? []
  const excluded = { material: 0, heatUnknown: 0, chemicalUnknown: 0 }
  const candidates: (SimilarCandidate & { _dist: number })[] = []

  for (const p of products) {
    if (p.ec_hinban === target.excludeEcHinban) continue
    // EC 品番が「なし」の行は複数商品が同じキーを共有し、仕入値を入力すると
    // 全行に効いてしまうため候補にしない
    if (p.ec_hinban === 'なし') continue
    if (!isRollGood(p)) continue
    const width = productWidthMm(p)
    if (target.minWidthMm != null && (width == null || width < target.minWidthMm)) continue

    const size = sizeBasis === 'meopen' ? p.meopen_um : p.mesh_count
    if (size == null || size <= 0) continue
    const dist = Math.abs(Math.log(size / targetSize))
    if (dist > maxLog) continue

    const info = getMaterialInfo(p.zaishitsu)
    const cautions: string[] = []

    // 材質: 同じ材質か、耐薬品性（と耐熱温度）が基準と同等以上の材質
    let materialMatch: MaterialMatch = 'any'
    if (bases.length > 0) {
      if (baseKeys.has(info.key)) {
        materialMatch = 'same'
      } else {
        const ok = bases.some((b) => {
          if (!chemicallyAtLeast(info, b, chemicalIds)) return false
          if (b.heatMaxC != null && info.heatMaxC != null) return info.heatMaxC >= b.heatMaxC
          return true
        })
        if (!ok) { excluded.material += 1; continue }
        materialMatch = 'alternative'
        if (bases.some((b) => b.heatMaxC == null || info.heatMaxC == null)) cautions.push('耐熱温度は未確認')
      }
    }

    // お客様の使用条件（指定があるときだけ）
    if (target.heatMinC != null) {
      if (info.heatMaxC == null) { excluded.heatUnknown += 1; continue }
      if (info.heatMaxC < target.heatMinC) { excluded.material += 1; continue }
    }
    if (chemicalIds.length > 0) {
      if (!info.tableName) { excluded.chemicalUnknown += 1; continue }
      const ok = chemicalIds.every((id) => {
        const g = getChemicalGrade(info.tableName, id)
        return g != null && meetsGrade(g, '○')
      })
      if (!ok) { excluded.material += 1; continue }
    }

    candidates.push({
      product: p,
      calculatedPrice: calculateEcPrice(p),
      sizeDiff: size / targetSize - 1,
      sizeBasis,
      materialMatch,
      cautions,
      _dist: dist,
    })
  }

  const rank = (m: MaterialMatch) => (m === 'alternative' ? 1 : 0)
  candidates.sort((a, b) =>
    // サイズ差は 1% 刻みで同順位とみなし、その中で同材質・価格あり・在庫あり・幅の狭い順
    Math.round(a._dist * 100) - Math.round(b._dist * 100)
    || rank(a.materialMatch) - rank(b.materialMatch)
    || Number(a.calculatedPrice == null) - Number(b.calculatedPrice == null)
    || Number(getStockStatus(a.product) !== 'in_stock') - Number(getStockStatus(b.product) !== 'in_stock')
    || (productWidthMm(a.product) ?? 0) - (productWidthMm(b.product) ?? 0),
  )

  return {
    candidates: candidates.slice(0, limit).map(({ _dist, ...c }) => c),
    total: candidates.length,
    excluded,
  }
}

/** 商品 1 件を基準にした類似品の条件 */
export function targetFromProduct(p: UnifiedProduct): SimilarTarget {
  return {
    materials: p.zaishitsu ? [p.zaishitsu] : [],
    meopen_um: p.meopen_um,
    mesh_count: p.meopen_um == null ? p.mesh_count : undefined,
    excludeEcHinban: p.ec_hinban,
  }
}
