import type { UnifiedProduct } from '@/lib/types'

// 在庫状況の分類
//
// unified.json の zaiko_status / nokori_m から導出する。データソース側の
// 変更は不要（build_db.py が既に zaiko_status・nokori_m を出力済み）。
export type StockStatus = 'in_stock' | 'direct_ship' | 'unmatched'

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: '在庫あり',
  direct_ship: '直送品（在庫管理対象外）',
  unmatched: '品番未整備',
}

export function getStockStatus(product: Pick<UnifiedProduct, 'zaiko_status' | 'nokori_m'>): StockStatus {
  if (product.zaiko_status === '突合OK') {
    return product.nokori_m != null && product.nokori_m > 0 ? 'in_stock' : 'direct_ship'
  }
  if (product.zaiko_status === '在庫表対象外(EC専売等)' || product.zaiko_status === '在庫表に品番なし') {
    return 'direct_ship'
  }
  return 'unmatched'
}
