'use client'

import Button from '@/components/ui/button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number)=> void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages: Array<number | string> = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        前へ
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        次へ
      </Button>
    </div>
  )
}
