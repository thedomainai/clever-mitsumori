'use client'

import Card from '@/components/ui/card'

export interface InventorySummaryProps {
  meshCount: number
  netoronCount: number
  trikaruCount: number
  totalCount: number
  lastUpdated: string | null
  onClearData: () => void
}

export default function InventorySummary({
  meshCount,
  netoronCount,
  trikaruCount,
  totalCount,
  lastUpdated,
  onClearData,
}: InventorySummaryProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = [
    { label: 'メッシュ', value: meshCount, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'ネトロン', value: netoronCount, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'トリカル', value: trikaruCount, color: 'bg-violet-50 text-violet-700' },
    { label: '合計', value: totalCount, color: 'bg-slate-100 text-slate-700' },
  ]

  return (
    <Card title="現在の在庫データ">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`px-4 py-3 rounded-lg ${stat.color}`}>
              <p className="text-xs font-medium opacity-70">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}件</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            最終更新: {formatDate(lastUpdated)}
          </p>
          <button
            onClick={onClearData}
            className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
          >
            データクリア
          </button>
        </div>
      </div>
    </Card>
  )
}
