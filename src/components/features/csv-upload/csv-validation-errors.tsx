'use client'

export interface CsvValidationErrorsProps {
  errors: Array<{ row: number; message: string }>
}

export default function CsvValidationErrors({ errors }: CsvValidationErrorsProps) {
  if (errors.length === 0) return null

  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-red-600 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-red-800">バリデーションエラー</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1 max-h-60 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index}>
                  {error.row > 0 ? `${error.row}行目: ` : ''}{error.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
