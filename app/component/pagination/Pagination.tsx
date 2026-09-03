interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  windowSize?: number
  disablePrev?: boolean
  disableNext?: boolean
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  windowSize = 5,
  disablePrev = false,
  disableNext = false,
  className = "",
}: PaginationProps) {
  const getPaginationButtons = () => {
    const buttons: { page: number; isActive: boolean; isEllipsis?: boolean }[] =
      []
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
    let end = start + windowSize - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - windowSize + 1)
    }

    // Always show first page
    if (start > 1) {
      buttons.push({ page: 1, isActive: currentPage === 1 })
      if (start > 2) {
        buttons.push({ page: -1, isActive: false, isEllipsis: true })
      }
    }

    // Middle window
    for (let i = start; i <= end; i++) {
      buttons.push({ page: i, isActive: i === currentPage })
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push({ page: -1, isActive: false, isEllipsis: true })
      }
      buttons.push({ page: totalPages, isActive: currentPage === totalPages })
    }

    return buttons
  }

  const paginationButtons = getPaginationButtons()

  return (
    <div
      className={`flex justify-center items-center space-x-2 mt-4 ${className}`}
    >
      {/* Prev */}
      <button
        disabled={disablePrev || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      {/* Page buttons */}
      {paginationButtons.map((btn, idx) =>
        btn.isEllipsis ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">
            …
          </span>
        ) : (
          <button
            key={`page-${btn.page}`}
            onClick={() => onPageChange(btn.page)}
            className={`px-3 py-1 rounded ${
              btn.isActive ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {btn.page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        disabled={disableNext || currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}
