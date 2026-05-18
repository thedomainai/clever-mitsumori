'use client'

import LoadingSpinner from '@/components/ui/loading-spinner'

export default function CsvUploadProgress() {
  return (
    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
      <LoadingSpinner size="md" />
      <span className="ml-3 text-sm text-blue-900 font-medium">アップロード中...</span>
    </div>
  )
}
