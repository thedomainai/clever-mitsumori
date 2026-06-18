'use client'

import Link from 'next/link'
import { useInventory } from '@/hooks/use-inventory'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function Home() {
  const { products, isLoading, error } = useInventory()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  const meshCount = products.filter((p) => p.zaiko_source === 'mesh').length
  const withPrice = products.filter((p) => p.hanbai_kakaku != null).length
  const withShiire = products.filter((p) => p.shiire_per_m != null).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">EC 価格管理ツール</h1>
        <p className="mt-1 text-sm text-slate-500">
          材質・目開きで検索し、EC 販売価格を確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">総商品数</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {products.length.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">仕入値あり</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {withShiire.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">販売価格算出済み</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {withPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm font-medium text-slate-900 mb-3">在庫表との突合</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">メッシュ</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">{meshCount}件</p>
          </div>
          <div className="relative rounded-lg border border-slate-200 p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="px-2.5 py-1 bg-slate-200 text-slate-500 text-xs font-medium rounded-full">未実装</span>
            </div>
            <p className="text-xs font-medium text-slate-400">ネトロン</p>
            <p className="mt-1 text-lg font-semibold text-slate-300 tabular-nums">-</p>
          </div>
          <div className="relative rounded-lg border border-slate-200 p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="px-2.5 py-1 bg-slate-200 text-slate-500 text-xs font-medium rounded-full">未実装</span>
            </div>
            <p className="text-xs font-medium text-slate-400">トリカル</p>
            <p className="mt-1 text-lg font-semibold text-slate-300 tabular-nums">-</p>
          </div>
        </div>
      </div>

      <Link
        href="/search"
        className="block bg-slate-900 text-white text-center py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        商品検索・見積へ
      </Link>
    </div>
  )
}
