import type { Result, UnifiedProduct, PriceResult } from '../types'
import { PRICE_CONFIG } from '../constants'

export function calculateEcPrice(product: UnifiedProduct): Result<PriceResult> {
  try {
    const { purchasePrice } = product
    const { markupRate, taxRate } = PRICE_CONFIG

    const unitPrice = Math.ceil(purchasePrice * markupRate)
    const unitPriceWithTax = Math.ceil(unitPrice * taxRate)

    return {
      success: true,
      data: {
        unitPrice,
        unitPriceWithTax,
        breakdown: {
          purchasePricePerMeter: purchasePrice,
          markupRate,
          unitPriceBeforeTax: unitPrice,
          unitPriceWithTax,
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PRICE_CALCULATION_ERROR',
        message: '価格計算に失敗しました',
        details: error,
      },
    }
  }
}
