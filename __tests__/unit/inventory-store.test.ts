import { vi } from 'vitest'

// Mock localStorage before importing the module
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  }),
  get length() {
    return Object.keys(store).length
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

import { loadInventory, saveInventory, clearInventory } from '@/lib/store/inventory-store'
import type { UnifiedProduct } from '@/lib/types'

function createMockProduct(overrides: Partial<UnifiedProduct> = {}): UnifiedProduct {
  return {
    id: 'test-id',
    productType: 'mesh',
    productCode: 'TEST-001',
    width: 1000,
    stockQuantity: 50,
    inventoryStatus: 'IN_STOCK',
    arrivalDate: null,
    lastShipmentDate: null,
    purchasePrice: 100,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('inventory-store', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('loadInventory', () => {
    it('should return empty array and metadata when no data exists', () => {
      const result = loadInventory()

      expect(result.success).toBe(true)
      if (!result.success) return

      expect(result.data.products).toEqual([])
      expect(result.data.metadata).toBeDefined()
      expect(result.data.metadata.lastUpdated).toBeDefined()
      expect(result.data.metadata.productCounts).toBeDefined()
    })

    it('should load saved inventory data', () => {
      const products = [
        createMockProduct({ id: '1', productType: 'mesh' }),
        createMockProduct({ id: '2', productType: 'netoron' }),
      ]

      // Save first
      saveInventory(products)

      const result = loadInventory()

      expect(result.success).toBe(true)
      if (!result.success) return

      expect(result.data.products).toHaveLength(2)
      expect(result.data.metadata.lastUpdated).toBeDefined()
    })

    it('should handle corrupted data gracefully', () => {
      store['clever-inventory-data'] = 'invalid json'

      const result = loadInventory()

      // Should fail since JSON.parse will throw
      expect(result.success).toBe(false)
    })
  })

  describe('saveInventory', () => {
    it('should save inventory data to localStorage', () => {
      const products = [
        createMockProduct({ id: '1', productType: 'mesh' }),
        createMockProduct({ id: '2', productType: 'netoron' }),
      ]

      const result = saveInventory(products)

      expect(result.success).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'clever-inventory-data',
        expect.any(String)
      )
    })

    it('should count products by type correctly', () => {
      const products = [
        createMockProduct({ id: '1', productType: 'mesh' }),
        createMockProduct({ id: '2', productType: 'mesh' }),
        createMockProduct({ id: '3', productType: 'netoron' }),
        createMockProduct({ id: '4', productType: 'trikaru' }),
        createMockProduct({ id: '5', productType: 'mesh' }),
      ]

      saveInventory(products)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.metadata.productCounts).toEqual({
        mesh: 3,
        netoron: 1,
        trikaru: 1,
        total: 5,
      })
    })

    it('should set lastUpdated timestamp', () => {
      const products = [createMockProduct()]

      const beforeSave = new Date().toISOString()
      saveInventory(products)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.metadata.lastUpdated).toBeDefined()
      expect(savedData.metadata.lastUpdated >= beforeSave).toBe(true)
    })

    it('should allow loading saved data with loadInventory', () => {
      const products = [
        createMockProduct({ id: '1', productType: 'mesh' }),
        createMockProduct({ id: '2', productType: 'netoron' }),
      ]

      saveInventory(products)

      const loaded = loadInventory()

      expect(loaded.success).toBe(true)
      if (!loaded.success) return

      expect(loaded.data.products).toHaveLength(2)
      expect(loaded.data.products[0].id).toBe('1')
      expect(loaded.data.products[1].id).toBe('2')
    })

    it('should handle empty product array', () => {
      saveInventory([])

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.products).toEqual([])
      expect(savedData.metadata.productCounts.total).toBe(0)
    })
  })

  describe('clearInventory', () => {
    it('should clear inventory data from localStorage', () => {
      const products = [createMockProduct()]
      saveInventory(products)

      clearInventory()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('clever-inventory-data')
    })

    it('should result in empty inventory after clear', () => {
      const products = [createMockProduct()]
      saveInventory(products)

      clearInventory()

      const result = loadInventory()
      expect(result.success).toBe(true)
      if (!result.success) return

      expect(result.data.products).toEqual([])
    })
  })

  describe('integration', () => {
    it('should handle save-load-clear cycle', () => {
      const products = [
        createMockProduct({ id: '1', productType: 'mesh' }),
        createMockProduct({ id: '2', productType: 'netoron' }),
      ]
      saveInventory(products)

      const loaded = loadInventory()
      expect(loaded.success).toBe(true)
      if (!loaded.success) return
      expect(loaded.data.products).toHaveLength(2)

      clearInventory()

      const afterClear = loadInventory()
      expect(afterClear.success).toBe(true)
      if (!afterClear.success) return
      expect(afterClear.data.products).toEqual([])
    })

    it('should preserve product data integrity through save-load cycle', () => {
      const originalProduct = createMockProduct({
        id: 'test-123',
        productType: 'mesh',
        productCode: 'MESH-001',
        width: 1234,
        stockQuantity: 56,
        purchasePrice: 789,
      })

      saveInventory([originalProduct])

      const loaded = loadInventory()
      expect(loaded.success).toBe(true)
      if (!loaded.success) return

      expect(loaded.data.products[0]).toEqual(originalProduct)
    })
  })
})
