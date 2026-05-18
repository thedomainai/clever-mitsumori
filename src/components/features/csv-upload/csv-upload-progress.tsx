'use client'

import LoadingSpinner from '@/components/ui/loading-spinner'

export default function CsvUploadProgress() {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-indigo-50 rounded-lg">
      <LoadingSpinner size="sm" />
      <span className="text-sm font-medium text-indigo-700">処理中...</span>
    </div>
  )
}
