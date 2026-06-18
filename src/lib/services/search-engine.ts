import type { Result, UnifiedProduct, ProductOverride, SearchFilter, Sort, SearchResult, Pagination } from '../types'
import { calculateEcPrice } from './price-calculator'

type OverrideMap = Map<string, ProductOverride>

/**
 * ベースデータ (unified.json) にオーバーライド (Firestore) を合成する。
 * CSV 再アップロードでベースが更新されても、オーバーライドは独立して生き残る。
 */
export function mergeOverrides(
  products: UnifiedProduct[],
  overrides: OverrideMap,
): { merged: UnifiedProduct[]; overriddenKeys: Set<string> } {
  const overriddenKeys = new Set<string>()

  const merged = products.map((p) => {
    const ov = overrides.get(p.ec_hinban)
    if (!ov) return p

    overriddenKeys.add(p.ec_hinban)
    return {
      ...p,
      ...(ov.shiire_per_m != null ? { shiire_per_m: ov.shiire_per_m } : {}),
      ...(ov.kotei_hi != null ? { kotei_hi: ov.kotei_hi } : {}),
      ...(ov.arari_rate != null ? { arari_rate: ov.arari_rate } : {}),
    }
  })

  return { merged, overriddenKeys }
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u3000\s]/g, '')
    .normalize('NFKC')
}

function matchesFilter(product: UnifiedProduct, filters: SearchFilter): boolean {
  if (filters.zaishitsu) {
    if (!product.zaishitsu) return false
    const normalized = normalizeString(filters.zaishitsu)
    const zaishitsu = normalizeString(product.zaishitsu)
    if (!zaishitsu.includes(normalized)) return false
  }

  if (filters.meopen_um_min != null) {
    if (product.meopen_um == null || product.meopen_um < filters.meopen_um_min) return false
  }

  if (filters.meopen_um_max != null) {
    if (product.meopen_um == null || product.meopen_um > filters.meopen_um_max) return false
  }

  if (filters.hinban) {
    if (!product.hinban) return false
    const normalized = normalizeString(filters.hinban)
    const hinban = normalizeString(product.hinban)
    if (!hinban.includes(normalized)) return false
  }

  if (filters.ec_hinban) {
    const normalized = normalizeString(filters.ec_hinban)
    const ecHinban = normalizeString(product.ec_hinban)
    if (!ecHinban.includes(normalized)) return false
  }

  if (filters.color) {
    if (!product.color) return false
    const normalized = normalizeString(filters.color)
    const color = normalizeString(product.color)
    if (!color.includes(normalized)) return false
  }

  if (filters.freeText) {
    const q = normalizeString(filters.freeText)
    const fields = [
      product.ec_hinban,
      product.hinban,
      product.zaishitsu,
      product.color,
      product.size,
    ]
    const combined = fields.filter(Boolean).map(f => normalizeString(f!)).join(' ')
    if (!combined.includes(q)) return false
  }

  return true
}

function sortProducts(products: UnifiedProduct[], sort?: Sort): UnifiedProduct[] {
  if (!sort) return products

  return [...products].sort((a, b) => {
    const aVal = a[sort.field]
    const bVal = b[sort.field]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.order === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })
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
    const paginatedProducts = sorted.slice(startIndex, startIndex + pageSize)

    const results: SearchResult[] = paginatedProducts.map((product) => ({
      product,
      calculatedPrice: calculateEcPrice(product),
    }))

    return {
      success: true,
      data: {
        results,
        pagination: { page, pageSize, totalResults, totalPages },
      },
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
