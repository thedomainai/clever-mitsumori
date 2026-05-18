'use client'

import CsvUploadForm from '@/components/features/csv-upload/csv-upload-form'
import InventorySummary from '@/components/features/csv-upload/inventory-summary'
import { useInventory } from '@/hooks/use-inventory'

export default function Home() {
  const { products, metadata, reload, clear } = useInventory()

  const handleClearData = () => {
    if (window.confirm('すべての在庫データを削除します。よろしいですか?')) {
      clear()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">データ取込</h1>
        <p className="mt-1 text-sm text-slate-500">在庫CSVファイルをアップロードして、商品データを更新します</p>
      </div>

      <CsvUploadForm onUploadSuccess={reload} />

      <InventorySummary
        meshCount={metadata?.productCounts.mesh || 0}
        netoronCount={metadata?.productCounts.netoron || 0}
        trikaruCount={metadata?.productCounts.trikaru || 0}
        totalCount={metadata?.productCounts.total || 0}
        lastUpdated={metadata?.lastUpdated || null}
        onClearData={handleClearData}
      />
    </div>
  )
}
