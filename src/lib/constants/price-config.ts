// 6/9 MTG, 6/12 MTG で確定した価格計算パラメータ
// 販売価格 = (仕入値/m × カット長 + 固定費) ÷ (1 - 粗利率)
export const PRICE_CONFIG = {
  defaultGrossMarginRate: 0.5,
  defaultFixedCost: 6000,
} as const

export const SEARCH_CONFIG = {
  defaultPageSize: 100,
  // 目開きは中心値 1 つの入力から ±10% の範囲を自動検索する（例: 200 → 180〜220）（7/28 決定）
  meopenTolerance: 0.1,
} as const
