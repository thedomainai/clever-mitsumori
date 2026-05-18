export const MESH_CSV_COLUMNS = {
  location: 'エリア',
  shelfLevel: '棚段',
  material: '材質',
  productCode: '品番',
  commonKey: '共通キー',
  meshSize: '目開き(μ)',
  width: '幅(mm)',
  meshCount: 'ﾒｯｼｭor線径',
  arrivalDate: '入荷日',
  lastShipmentDate: '最終出荷',
  stockQuantity: '残り(m)',
  purchasePrice: '仕入値(m)',
  currentPurchasePrice: '現行仕入値(m)',
} as const

export const NETORON_CSV_COLUMNS = {
  location: '1',
  shelfLevel: '棚段',
  productCode: '品番',
  commonKey: '共通キー',
  color: 'カラー',
  width: '幅(mm)',
  unitPrice: '仕切り単価/m',
  arrivalDate: '入荷日',
  lastShipmentDate: '最終出荷日',
  stockQuantity: '残り(m)',
  purchasePrice: '仕入値',
} as const

export const TRIKARU_CSV_COLUMNS = {
  location: '',
  shelfLevel: '棚段',
  productCode: '品番',
  commonKey: '共通キー',
  color: 'カラー',
  width: '幅(mm)',
  unitPrice: '仕切り単価/m',
  arrivalDate: '入荷日',
  lastShipmentDate: '最終出荷日',
  stockQuantity: '残り(m)',
  purchasePricePerSqm: '仕入値(sqm)',
  purchasePrice: '仕入値(m)',
} as const
