'use client'

import Card from '@/components/ui/card'
import Button from '@/components/ui/button'

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
    if (!dateString) return '未設定'
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card title="現在の在庫データ">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">メッシュ</p>
            <p className="text-2xl font-bold text-blue-900">{meshCount}件</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">ネトロン</p>
            <p className="text-2xl font-bold text-green-900">{netoronCount}件</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">トリカル</p>
            <p className="text-2xl font-bold text-purple-900">{trikaruCount}件</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">合計</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}件</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            最終更新: <span className="font-medium">{formatDate(lastUpdated)}</span>
          </div>
          <Button variant="danger" size="sm" onClick={onClearData}>
            データクリア
          </Button>
        </div>
      </div>
    </Card>
  )
}
