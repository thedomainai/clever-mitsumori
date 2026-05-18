'use client'

export interface CsvUploadSuccessProps {
  validRows: number
  errorRows: number
}

export default function CsvUploadSuccess({ validRows, errorRows }: CsvUploadSuccessProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg ring-1 ring-inset ring-emerald-600/10">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-emerald-800">アップロード完了</p>
        <p className="mt-1 text-sm text-emerald-700">
          取込件数: <span className="font-semibold">{validRows}件</span>
          {errorRows > 0 && (
            <span className="ml-3 text-red-600">エラー: <span className="font-semibold">{errorRows}件</span></span>
          )}
        </p>
      </div>
    </div>
  )
}
