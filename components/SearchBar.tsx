import React, { useState, useEffect, useCallback } from 'react';

/**
 * SearchBar component for the Automated News Aggregation Web Application
 * 
 * Provides a search input field with debounced search functionality.
 * Implements a 300ms delay before triggering the search callback to reduce
 * unnecessary API calls while the user is typing.
 * 
 * Validates: Requirements 6.1 (search query submission), 6.5 (search performance)
 */

interface SearchBarProps {
  /**
   * Callback function triggered when the search query changes (after debounce delay)
   * @param query - The search query string
   */
  onSearchChange: (query: string) => void;
  
  /**
   * Optional placeholder text for the search input
   * @default "Search articles..."
   */
  placeholder?: string;
  
  /**
   * Optional initial search value
   * @default ""
   */
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  placeholder = "সংবাদ খুঁজুন...",
  initialValue = ""
}) => {
  // Local state for the input value (updates immediately on user input)
  const [searchValue, setSearchValue] = useState<string>(initialValue);

  // Debounced search effect - triggers onSearchChange after 300ms of inactivity
  useEffect(() => {
    // Set up a timer to trigger the search after 300ms
    const debounceTimer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    // Cleanup function: clear the timer if the user types again before 300ms
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchValue, onSearchChange]);

  // Handle input change - updates local state immediately
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  // Handle clear button click
  const handleClear = useCallback(() => {
    setSearchValue('');
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     text-sm sm:text-base
                     placeholder-gray-400
                     transition-colors duration-200"
          aria-label="Search articles"
        />

        {/* Clear Button (only shown when there's text) */}
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center 
                       text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Optional: Search hint text */}
      <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
        শিরোনাম বা সারাংশ দ্বারা অনুসন্ধান করুন
      </p>
    </div>
  );
};

export default SearchBar;
