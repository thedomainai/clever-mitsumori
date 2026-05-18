'use client'

export interface CsvValidationErrorsProps {
  errors: Array<{ row: number; message: string }>
}

export default function CsvValidationErrors({ errors }: CsvValidationErrorsProps) {
  if (errors.length === 0) return null

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg ring-1 ring-inset ring-red-600/10">
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-red-800">バリデーションエラー</p>
        <ul className="mt-2 space-y-1 text-sm text-red-700 max-h-40 overflow-y-auto">
          {errors.map((error, index) => (
            <li key={index}>
              {error.row > 0 ? `${error.row}行目: ` : ''}{error.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
