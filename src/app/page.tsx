'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInventory } from '@/hooks/use-inventory'
import Button from '@/components/ui/button'
import RangeField from '@/components/ui/range-field'

function StatBlock({
  label,
  value,
  total,
  isLoading,
}: {
  label: string
  value: number | null
  total?: number | null
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="p-5">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <div className="mt-2.5 h-8 w-24 bg-stone-100 rounded animate-pulse" />
      </div>
    )
  }

  const ratio = total && total > 0 && value != null ? value / total : null

  return (
    <div className="p-5">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-stone-900 tabular-nums tracking-tight">
        {value != null ? value.toLocaleString() : '-'}
        {ratio != null && (
          <span className="ml-2 text-sm font-medium text-stone-400 tabular-nums">
            {(ratio * 100).toFixed(0)}%
          </span>
        )}
      </p>
      {ratio != null && (
        <div className="mt-2.5 h-1 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-stone-700"
            style={{ width: `${Math.max(ratio * 100, 1.5)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { products, isLoading, error } = useInventory()
  const router = useRouter()

  const [zaishitsu, setZaishitsu] = useState('')
  const [meopenMin, setMeopenMin] = useState('')
  const [meopenMax, setMeopenMax] = useState('')

  const materialOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      if (p.zaishitsu) counts.set(p.zaishitsu, (counts.get(p.zaishitsu) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name)
  }, [products])

  const handleQuickSearch = () => {
    const params = new URLSearchParams()
    if (zaishitsu.trim()) params.set('zaishitsu', zaishitsu.trim())
    if (meopenMin) params.set('meopen_min', meopenMin)
    if (meopenMax) params.set('meopen_max', meopenMax)
    const query = params.toString()
    router.push(query ? `/search?${query}` : '/search')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nev = e.nativeEvent ?? e
    if ((nev as KeyboardEvent).isComposing || e.keyCode === 229) return
    if (e.key === 'Enter') handleQuickSearch()
  }

  const meshCount = products.filter((p) => p.zaiko_source === 'mesh').length
  const withPrice = products.filter((p) => p.hanbai_kakaku != null).length
  const withShiire = products.filter((p) => p.shiire_per_m != null).length

  return (
    <div className="space-y-10">
      {/* Hero: quick search */}
      <section className="pt-4 md:pt-8 animate-fade-in-up">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl md:text-[28px] font-semibold text-stone-900 tracking-tight leading-snug">
            販売価格を、その場で確認
          </h1>
          <p className="mt-2.5 text-sm md:text-[15px] text-stone-500 leading-relaxed">
            材質と目開きを入れるだけで、該当商品のEC販売価格を一覧できます
          </p>
        </div>

        <div className="mt-6 max-w-2xl mx-auto">
          <div
            className="bg-white rounded-lg border border-stone-200/80 shadow-lifted p-5"
            onKeyDown={handleKeyDown}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  材質 <span className="text-stone-400 font-normal">（任意）</span>
                </label>
                <input
                  type="text"
                  list="material-options"
                  placeholder="例: ナイロン、PET"
                  value={zaishitsu}
                  onChange={(e) => setZaishitsu(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-stone-300 bg-white placeholder:text-stone-400 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 transition-colors duration-150"
                />
                <datalist id="material-options">
                  {materialOptions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <RangeField
                label="目開き"
                unit="μm"
                minValue={meopenMin}
                maxValue={meopenMax}
                onMinChange={setMeopenMin}
                onMaxChange={setMeopenMax}
                minPlaceholder="150"
                maxPlaceholder="250"
              />
            </div>
            <Button size="lg" className="w-full mt-4" onClick={handleQuickSearch}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              検索する
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-stone-400">
            メッシュ数・線径・品番などの詳細条件は{' '}
            <Link href="/search" className="text-stone-600 underline underline-offset-2 decoration-stone-300 hover:text-stone-900 hover:decoration-stone-500 transition-colors">
              商品検索ページ
            </Link>{' '}
            で指定できます
          </p>
        </div>
      </section>

      {/* Data status */}
      <section>
        <h2 className="text-xs font-semibold text-stone-400 tracking-wider uppercase mb-3">
          データの状況
        </h2>
        {error ? (
          <div className="bg-white rounded-lg border border-stone-200/80 shadow-card p-5">
            <p className="text-sm font-medium text-stone-900">データの読み込みに失敗しました</p>
            <p className="mt-1 text-sm text-stone-500">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-stone-200/80 shadow-card grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            <StatBlock label="総商品数" value={isLoading ? null : products.length} isLoading={isLoading} />
            <StatBlock
              label="仕入値あり"
              value={isLoading ? null : withShiire}
              total={products.length}
              isLoading={isLoading}
            />
            <StatBlock
              label="販売価格 算出済み"
              value={isLoading ? null : withPrice}
              total={products.length}
              isLoading={isLoading}
            />
          </div>
        )}
      </section>

      {/* Inventory coverage */}
      <section>
        <h2 className="text-xs font-semibold text-stone-400 tracking-wider uppercase mb-3">
          在庫表との突合
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-stone-200/80 shadow-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-500">メッシュ</p>
              <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-medium rounded-full">
                対応済み
              </span>
            </div>
            <p className="mt-1.5 text-lg font-semibold text-stone-900 tabular-nums">
              {isLoading ? (
                <span className="inline-block h-6 w-16 bg-stone-100 rounded animate-pulse align-middle" />
              ) : (
                `${meshCount.toLocaleString()}件`
              )}
            </p>
          </div>
          {['ネトロン', 'トリカル'].map((name) => (
            <div key={name} className="rounded-lg border border-dashed border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-400">{name}</p>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-400 text-[10px] font-medium rounded-full">
                  準備中
                </span>
              </div>
              <p className="mt-1.5 text-lg font-semibold text-stone-300 tabular-nums">-</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
