'use client'

export interface CsvUploadSuccessProps {
  validRows: number
  errorRows: number
}

export default function CsvUploadSuccess({ validRows, errorRows }: CsvUploadSuccessProps) {
  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-green-600 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">アップロード完了</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>取込件数: <span className="font-semibold">{validRows}件</span></p>
            {errorRows > 0 && (
              <p className="mt-1 text-red-700">エラー: <span className="font-semibold">{errorRows}件</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
