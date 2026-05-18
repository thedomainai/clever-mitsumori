import type { Result, UnifiedProduct, StorageMetadata } from '../types'

const STORAGE_KEY = 'clever-inventory-data'
const VERSION = '1.0.0'

export function loadInventory(): Result<{ products: UnifiedProduct[]; metadata: StorageMetadata }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: 'localStorage が利用できません',
        },
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      const emptyMetadata: StorageMetadata = {
        lastUpdated: new Date().toISOString(),
        version: VERSION,
        productCounts: {
          mesh: 0,
          netoron: 0,
          trikaru: 0,
          total: 0,
        },
      }

      return {
        success: true,
        data: {
          products: [],
          metadata: emptyMetadata,
        },
      }
    }

    const parsed = JSON.parse(stored)

    return {
      success: true,
      data: {
        products: parsed.products || [],
        metadata: parsed.metadata,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'LOAD_ERROR',
        message: 'データの読み込みに失敗しました',
        details: error,
      },
    }
  }
}

export function saveInventory(products: UnifiedProduct[]): Result<{ success: boolean; bytesUsed: number }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: 'localStorage が利用できません',
        },
      }
    }

    const metadata: StorageMetadata = {
      lastUpdated: new Date().toISOString(),
      version: VERSION,
      productCounts: {
        mesh: products.filter((p) => p.productType === 'mesh').length,
        netoron: products.filter((p) => p.productType === 'netoron').length,
        trikaru: products.filter((p) => p.productType === 'trikaru').length,
        total: products.length,
      },
    }

    const data = {
      products,
      metadata,
    }

    const serialized = JSON.stringify(data)

    localStorage.setItem(STORAGE_KEY, serialized)

    const bytesUsed = new Blob([serialized]).size

    return {
      success: true,
      data: {
        success: true,
        bytesUsed,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'ストレージ容量が不足しています',
          details: error,
        },
      }
    }

    return {
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: 'データの保存に失敗しました',
        details: error,
      },
    }
  }
}

export function clearInventory(): Result<{ success: boolean }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          code: 'STORAGE_UNAVAILABLE',
          message: 'localStorage が利用できません',
        },
      }
    }

    localStorage.removeItem(STORAGE_KEY)

    return {
      success: true,
      data: { success: true },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CLEAR_ERROR',
        message: 'データのクリアに失敗しました',
        details: error,
      },
    }
  }
}

export function getStorageInfo(): { bytesUsed: number; estimatedLimit: number; usagePercentage: number } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        bytesUsed: 0,
        estimatedLimit: 0,
        usagePercentage: 0,
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    const bytesUsed = stored ? new Blob([stored]).size : 0
    const estimatedLimit = 5 * 1024 * 1024
    const usagePercentage = (bytesUsed / estimatedLimit) * 100

    return {
      bytesUsed,
      estimatedLimit,
      usagePercentage,
    }
  } catch {
    return {
      bytesUsed: 0,
      estimatedLimit: 0,
      usagePercentage: 0,
    }
  }
}
