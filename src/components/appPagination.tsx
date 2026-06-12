import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { AppPaginationNavProps } from '@/lib/types'

export function AppPagination({
  page,
  totalCount,
  pageSize = 10,
  isPending = false,
  onPageChange,
}: AppPaginationNavProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  const handlePageClick = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isPending) return
    onPageChange(newPage)
  }

  // Helper to generate dynamic page link groups
  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 3
    let startPage = Math.max(1, page - 1)
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            className="cursor-pointer select-none"
            isActive={page === i}
            onClick={() => handlePageClick(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 dark:text-primary text-secondary">
      {/* Control Buttons Module */}
      <Pagination className="w-auto mx-0">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={`cursor-pointer select-none ${
                page <= 1 ? 'pointer-events-none opacity-40' : ''
              }`}
              onClick={() => handlePageClick(page - 1)}
            />
          </PaginationItem>

          {renderPageNumbers()}

          {page < totalPages - 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              className={`cursor-pointer select-none ${
                page >= totalPages ? 'pointer-events-none opacity-40' : ''
              }`}
              onClick={() => handlePageClick(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Metrics Row summary */}
      <div className="text-sm text-neutral-400 ">
        Showing{' '}
        <span className="font-medium dark:text-primary text-secondary">
          {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>{' '}
        to{' '}
        <span className="font-medium dark:text-primary text-secondary">
          {Math.min(page * pageSize, totalCount)}
        </span>{' '}
        of{' '}
        <span className="font-medium dark:text-primary text-secondary">
          {totalCount}
        </span>{' '}
        entries
      </div>
    </div>
  )
}
