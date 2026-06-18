import type { UnifiedProduct } from '../types'
import { PRICE_CONFIG } from '../constants'

/**
 * 確定済み計算式で EC 販売価格を算出する。
 * 販売価格 = (仕入値/m × カット長 + 固定費) ÷ (1 - 粗利率)
 *
 * 仕入値/m (shiire_per_m) とカット長 (cut_m) の両方が必要。
 * いずれかが欠けている場合は null を返す。
 */
export function calculateEcPrice(product: UnifiedProduct): number | null {
  const shiire = product.shiire_per_m
  const cutM = product.cut_m
  if (shiire == null || cutM == null) return null

  const arari = product.arari_rate ?? PRICE_CONFIG.defaultGrossMarginRate
  const kotei = product.kotei_hi ?? PRICE_CONFIG.defaultFixedCost

  if (arari >= 1) return null

  return Math.round((shiire * cutM + kotei) / (1 - arari))
}
