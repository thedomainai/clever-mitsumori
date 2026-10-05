'use client'

import { useState, useEffect } from 'react'
import type { UnifiedProduct } from '@/lib/types'
import { auth } from '@/lib/firebase'

export function useInventory() {
  const [products, setProducts] = useState<UnifiedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // 商品データは仕入値を含むため、ログイン中の利用者の ID トークンを付けて API から取得する
        const token = await auth?.currentUser?.getIdToken()
        const res = await fetch('/api/products', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: UnifiedProduct[] = await res.json()
        if (!cancelled) {
          setProducts(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'データの読み込みに失敗しました')
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { products, isLoading, error }
}
