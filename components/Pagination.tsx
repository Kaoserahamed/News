import React, { useEffect, useCallback, useRef } from 'react';

/**
 * Pagination component for the Automated News Aggregation Web Application
 * 
 * Provides pagination controls with Previous/Next buttons and page numbers.
 * Also implements infinite scroll functionality to automatically load the next page
 * when the user scrolls to the bottom of the page.
 * 
 * Validates: Requirements 5.2 (pagination), 8.5 (infinite scroll)
 */

interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  
  /**
   * Total number of pages available
   */
  totalPages: number;
  
  /**
   * Callback function triggered when the page changes
   * @param page - The new page number to navigate to
   */
  onPageChange: (page: number) => void;
  
  /**
   * Whether to enable infinite scroll functionality
   * @default true
   */
  enableInfiniteScroll?: boolean;
  
  /**
   * Whether the component is currently loading data
   * Used to prevent multiple simultaneous infinite scroll triggers
   * @default false
   */
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  enableInfiniteScroll = true,
  loading = false
}) => {
  // Ref to track if we're already loading to prevent duplicate requests
  const isLoadingRef = useRef(false);
  
  // Update the loading ref when loading prop changes
  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);
  
  /**
   * Handle infinite scroll - detect when user scrolls to bottom of page
   */
  const handleScroll = useCallback(() => {
    // Don't trigger if already loading or on last page
    if (isLoadingRef.current || currentPage >= totalPages) {
      return;
    }
    
    // Calculate if user has scrolled to bottom
    // We trigger when user is within 200px of the bottom
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    if (distanceFromBottom < 200) {
      // User is near bottom, load next page
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);
  
  /**
   * Set up infinite scroll listener
   */
  useEffect(() => {
    if (!enableInfiniteScroll) {
      return;
    }
    
    // Add scroll event listener with throttling
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) {
        return;
      }
      
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null as any;
      }, 200);
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enableInfiniteScroll, handleScroll]);
  
  /**
   * Handle Previous button click
   */
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);
  
  /**
   * Handle Next button click
   */
  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);
  
  /**
   * Handle page number button click
   */
  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);
  
  /**
   * Generate array of page numbers to display
   * Shows up to 5 page numbers with smart positioning around current page
   */
  const getPageNumbers = (): number[] => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      // Near the beginning, show first 5 pages
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      // Near the end, show last 5 pages
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle, show current page and 2 pages on each side
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };
  
  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;
  
  return (
    <nav 
      className="flex items-center justify-center space-x-1 sm:space-x-2 mt-6 sm:mt-8 px-2 sm:px-0"
      aria-label="Pagination navigation"
    >
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        className={`
          px-2 sm:px-4 py-2 
          border rounded-lg 
          text-xs sm:text-base font-medium
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isPreviousDisabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
        aria-label="Go to previous page"
        aria-disabled={isPreviousDisabled}
      >
        <span className="flex items-center">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </span>
      </button>
      
      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {/* Show first page and ellipsis if needed */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-medium
                       bg-white border border-gray-300 text-gray-700 hover:bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors duration-200"
              aria-label="Go to page 1"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-base" aria-hidden="true">
                ...
              </span>
            )}
          </>
        )}
        
        {/* Page number buttons */}
        {pageNumbers.map((pageNum) => {
          const isCurrentPage = pageNum === currentPage;
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`
                px-2 sm:px-4 py-2 rounded-lg 
                text-xs sm:text-base font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors duration-200
                ${isCurrentPage
                  ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }
              `}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
        
        {/* Show last page and ellipsis if needed */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-base" aria-hidden="true">
                ...
              </span>
            )}
            <button
              onClick={() => handlePageClick(totalPages)}
              className="px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-medium
                       bg-white border border-gray-300 text-gray-700 hover:bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors duration-200"
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`
          px-2 sm:px-4 py-2 
          border rounded-lg 
          text-xs sm:text-base font-medium
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isNextDisabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
        aria-label="Go to next page"
        aria-disabled={isNextDisabled}
      >
        <span className="flex items-center">
          <span className="hidden sm:inline">Next</span>
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
    </nav>
  );
};

export default Pagination;
