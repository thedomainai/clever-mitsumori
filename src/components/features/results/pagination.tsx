'use client'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  const getPageNumbers = () => {
    const pages: Array<number | string> = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const navButtonClass =
    'inline-flex items-center gap-1 h-9 px-3 text-sm font-medium text-stone-600 hover:bg-stone-200/60 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'

  return (
    <div className="flex items-center justify-center gap-1 pt-1">
      <button onClick={handlePrevious} disabled={currentPage === 1} className={navButtonClass}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        前へ
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-stone-400">
              …
            </span>
          )
        }

        const isActive = currentPage === page
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`
              min-w-9 h-9 px-2 text-sm font-medium rounded-md tabular-nums transition-colors duration-150
              ${isActive
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-200/60'
              }
            `}
          >
            {page}
          </button>
        )
      })}

      <button onClick={handleNext} disabled={currentPage === totalPages} className={navButtonClass}>
        次へ
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
