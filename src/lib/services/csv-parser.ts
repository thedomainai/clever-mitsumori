import Papa from 'papaparse'
import type { Result, ProductType, UnifiedProduct, ParseStats, InventoryStatus } from '../types'
import { parseNumber } from '../utils/parse-number'
import { parseDate } from '../utils/date'

function normalizeHeader(header: string): string {
  return header
    .replace(/\r?\n/g, '')
    .replace(/\s+/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/ｍ/g, 'm')
    .replace(/㎡/g, 'sqm')
    .trim()
}

function determineInventoryStatus(stockQuantity: number): InventoryStatus {
  if (stockQuantity === 0) return 'DELIVERY_INQUIRY'
  if (stockQuantity >= 150) return 'EXCESS'
  return 'IN_STOCK'
}

function parseMeshRow(row: Record<string, string>): UnifiedProduct | null {
  const productCode = row['品番']?.trim()
  if (!productCode) return null

  const width = parseNumber(row['幅(mm)'])
  const stockQuantity = parseNumber(row['残り(m)'])
  const purchasePrice = parseNumber(row['仕入値(m)'])

  if (width === null || stockQuantity === null || purchasePrice === null) {
    return null
  }

  const meshSize = parseNumber(row['目開き(μ)'])
  const currentPurchasePrice = parseNumber(row['現行仕入値(m)'])

  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    productType: 'mesh',
    productCode,
    commonKey: row['共通キー']?.trim() || undefined,
    location: row['エリア']?.trim() || undefined,
    shelfLevel: row['棚段']?.trim() || undefined,
    material: row['材質']?.trim() || undefined,
    meshSize: meshSize ?? undefined,
    meshCount: row['ﾒｯｼｭor線径']?.trim() || undefined,
    width,
    color: undefined,
    stockQuantity,
    inventoryStatus: determineInventoryStatus(stockQuantity),
    arrivalDate: parseDate(row['入荷日']),
    lastShipmentDate: parseDate(row['最終出荷']),
    purchasePrice,
    currentPurchasePrice: currentPurchasePrice ?? undefined,
    unitPrice: undefined,
    purchasePricePerSqm: undefined,
    createdAt: now,
    updatedAt: now,
  }
}

function parseNetoronRow(row: Record<string, string>): UnifiedProduct | null {
  const productCode = row['品番']?.trim()
  if (!productCode) return null

  const width = parseNumber(row['幅(mm)'])
  const stockQuantity = parseNumber(row['残り(m)'])
  const purchasePrice = parseNumber(row['仕入値'])

  if (width === null || stockQuantity === null || purchasePrice === null) {
    return null
  }

  const unitPrice = parseNumber(row['仕切り単価/m'])

  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    productType: 'netoron',
    productCode,
    commonKey: row['共通キー']?.trim() || undefined,
    location: row['1']?.trim() || undefined,
    shelfLevel: row['棚段']?.trim() || undefined,
    material: undefined,
    meshSize: undefined,
    meshCount: undefined,
    width,
    color: row['カラー']?.trim() || undefined,
    stockQuantity,
    inventoryStatus: determineInventoryStatus(stockQuantity),
    arrivalDate: parseDate(row['入荷日']),
    lastShipmentDate: parseDate(row['最終出荷日']),
    purchasePrice,
    currentPurchasePrice: undefined,
    unitPrice: unitPrice ?? undefined,
    purchasePricePerSqm: undefined,
    createdAt: now,
    updatedAt: now,
  }
}

function parseTrikaruRow(row: Record<string, string>): UnifiedProduct | null {
  const productCode = row['品番']?.trim()
  if (!productCode) return null

  const width = parseNumber(row['幅(mm)'])
  const stockQuantity = parseNumber(row['残り(m)'])
  const purchasePrice = parseNumber(row['仕入値(m)'])

  if (width === null || stockQuantity === null || purchasePrice === null) {
    return null
  }

  const unitPrice = parseNumber(row['仕切り単価/m'])
  const purchasePricePerSqm = parseNumber(row['仕入値(sqm)'])

  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    productType: 'trikaru',
    productCode,
    commonKey: row['共通キー']?.trim() || undefined,
    location: row['']?.trim() || undefined,
    shelfLevel: row['棚段']?.trim() || undefined,
    material: undefined,
    meshSize: undefined,
    meshCount: undefined,
    width,
    color: row['カラー']?.trim() || undefined,
    stockQuantity,
    inventoryStatus: determineInventoryStatus(stockQuantity),
    arrivalDate: parseDate(row['入荷日']),
    lastShipmentDate: parseDate(row['最終出荷日']),
    purchasePrice,
    currentPurchasePrice: undefined,
    unitPrice: unitPrice ?? undefined,
    purchasePricePerSqm: purchasePricePerSqm ?? undefined,
    createdAt: now,
    updatedAt: now,
  }
}

export async function parseCsv(
  file: File,
  productType: ProductType
): Promise<Result<{ products: UnifiedProduct[]; stats: ParseStats }>> {
  try {
    const text = await file.text()

    const parseResult = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
    })

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'CSVパースエラーが発生しました',
          details: parseResult.errors,
        },
      }
    }

    const products: UnifiedProduct[] = []
    const errors: Array<{ row: number; message: string; field?: string }> = []

    const parseRow = productType === 'mesh' ? parseMeshRow : productType === 'netoron' ? parseNetoronRow : parseTrikaruRow

    parseResult.data.forEach((row, index) => {
      try {
        const product = parseRow(row)
        if (product) {
          products.push(product)
        }
      } catch (error) {
        errors.push({
          row: index + 1,
          message: error instanceof Error ? error.message : '不明なエラー',
        })
      }
    })

    const stats: ParseStats = {
      totalRows: parseResult.data.length,
      validRows: products.length,
      errorRows: errors.length,
      errors,
    }

    return {
      success: true,
      data: { products, stats },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FILE_READ_ERROR',
        message: 'ファイルの読み込みに失敗しました',
        details: error,
      },
    }
  }
}
