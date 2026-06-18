'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type { ProductOverride } from '@/lib/types'

const COLLECTION = 'product_overrides'

export type OverrideMap = Map<string, ProductOverride>

export function useProductOverrides() {
  const [overrides, setOverrides] = useState<OverrideMap>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  // Real-time listener (skip if Firebase is not configured)
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const colRef = collection(db, COLLECTION)

    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const map = new Map<string, ProductOverride>()
        snapshot.docs.forEach((d) => {
          map.set(d.id, d.data() as ProductOverride)
        })
        setOverrides(map)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore snapshot error:', err)
        // Fallback: try one-time fetch
        getDocs(colRef)
          .then((snap) => {
            const map = new Map<string, ProductOverride>()
            snap.docs.forEach((d) => {
              map.set(d.id, d.data() as ProductOverride)
            })
            setOverrides(map)
            setError(null)
          })
          .catch(() => {
            setError('オーバーライドの読み込みに失敗しました')
          })
          .finally(() => setIsLoading(false))
      },
    )

    unsubRef.current = unsub
    return () => unsub()
  }, [])

  const saveOverride = useCallback(
    async (ecHinban: string, fields: Partial<Omit<ProductOverride, 'updated_at'>>) => {
      if (!db) return

      const existing = overrides.get(ecHinban)
      const merged: ProductOverride = {
        ...existing,
        ...fields,
        updated_at: new Date().toISOString(),
      }

      // Remove undefined fields
      const clean: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(merged)) {
        if (v !== undefined) clean[k] = v
      }

      await setDoc(doc(db, COLLECTION, ecHinban), clean)
    },
    [overrides],
  )

  const removeOverride = useCallback(async (ecHinban: string) => {
    if (!db) return
    await deleteDoc(doc(db, COLLECTION, ecHinban))
  }, [])

  return { overrides, isLoading: isLoading, error, saveOverride, removeOverride }
}
