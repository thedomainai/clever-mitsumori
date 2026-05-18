'use client'

import { useState, useEffect } from 'react'
import { UnifiedProduct, StorageMetadata } from '@/lib/types'
import { loadInventory, saveInventory, clearInventory } from '@/lib/store'

export function useInventory() {
  const [products, setProducts] = useState<UnifiedProduct[]>([])
  const [metadata, setMetadata] = useState<StorageMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setIsLoading(true)
    const result = loadInventory()

    if (result.success) {
      setProducts(result.data.products)
      setMetadata(result.data.metadata)
    } else {
      setProducts([])
      setMetadata(null)
    }

    setIsLoading(false)
  }

  const saveData = (newProducts: UnifiedProduct[]) => {
    const result = saveInventory(newProducts)

    if (result.success) {
      loadData()
      return true
    }

    return false
  }

  const clearData = () => {
    const result = clearInventory()

    if (result.success) {
      setProducts([])
      setMetadata(null)
      return true
    }

    return false
  }

  return {
    products,
    metadata,
    isLoading,
    reload: loadData,
    save: saveData,
    clear: clearData,
  }
}
