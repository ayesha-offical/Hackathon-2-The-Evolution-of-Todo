/**
 * Task: T073 | Spec: @specs/001-sdd-initialization/ui/pages.md §Pagination
 * Description: Pagination component for task lists
 * Purpose: Navigate between pages of paginated results
 * Reference: plan.md Step 5 §Key Design Pattern
 */

'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 *
 * Features:
 * - Previous/Next buttons
 * - Page number buttons
 * - Current page indicator
 * - Results counter
 * - Disabled state for edge pages
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Calculate result range
  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  // Generate page numbers to show
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Results Counter */}
      <div className="text-sm text-gray-600">
        Showing {startResult} to {endResult} of {totalResults} results
      </div>

      {/* Page Controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ← Previous
        </button>

        {/* Page Buttons */}
        <div className="flex gap-1">
          {pageNumbers.map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || page === currentPage}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : page === '...'
                  ? 'border-gray-300 text-gray-500 cursor-default'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={
                page === '...' ? 'More pages' : `Go to page ${page}`
              }
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next →
        </button>
      </nav>

      {/* Page Info */}
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
