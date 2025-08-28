'use client';

import { Button } from '@cms/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  className = ''
}: PaginationProps) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between bg-white px-4 py-3 sm:px-6 ${className}`}>
      <div className="flex flex-1 justify-between sm:hidden">
        {/* Mobile pagination */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center gap-2"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="relative ml-3 inline-flex items-center gap-2"
        >
          Sau
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
            <span className="font-medium">{endItem}</span> trong{' '}
            <span className="font-medium">{total}</span> kết quả
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-2" aria-label="Pagination">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    isCurrentPage
                      ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
