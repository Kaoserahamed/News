import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';
import ErrorMessage, { detectErrorType } from '@/components/ErrorMessage';
import { Category } from '@/lib/models/category';
import { Article } from '@/lib/models/article';
import { ArticlesApiResponse, ApiErrorResponse } from '@/lib/models/api';

/**
 * Main page component for the Automated News Aggregation Web Application
 * 
 * Manages application state for articles, loading, errors, pagination, and filters.
 * Fetches articles from the /api/articles endpoint based on current filters and pagination.
 * 
 * Validates: Requirements 8.1 (responsive UI), 8.4 (page load performance)
 */

interface AppState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  filters: {
    category: Category | null;
    searchTerm: string;
  };
  categoryCounts: Partial<Record<Category, number>>;
}

export default function Home() {
  // Application state
  const [state, setState] = useState<AppState>({
    articles: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      limit: 20,
    },
    filters: {
      category: null,
      searchTerm: '',
    },
    categoryCounts: {},
  });

  /**
   * Fetch articles from the API based on current filters and pagination
   */
  const fetchArticles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString(),
      });

      if (state.filters.category) {
        params.append('category', state.filters.category);
      }

      if (state.filters.searchTerm) {
        params.append('search', state.filters.searchTerm);
      }

      // Fetch articles with 10-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/articles?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        } else if (response.status === 400) {
          const errorData: ApiErrorResponse = await response.json();
          throw new Error(errorData.error.message || 'Invalid request parameters');
        } else {
          throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
      }

      const data: ArticlesApiResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch articles');
      }

      setState(prev => ({
        ...prev,
        articles: data.data.articles,
        pagination: {
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages,
          total: data.data.pagination.total,
          limit: data.data.pagination.limit,
        },
        loading: false,
        error: null,
      }));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Request timed out. Please check your connection and try again.',
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'An unexpected error occurred. Please try again.',
        }));
      }
    }
  }, [state.pagination.page, state.pagination.limit, state.filters.category, state.filters.searchTerm]);

  /**
   * Fetch category counts for the filter component
   */
  const fetchCategoryCounts = useCallback(async () => {
    try {
      // Fetch all articles without filters to get category counts
      // Note: API limit is capped at 100, so we'll fetch multiple pages if needed
      const response = await fetch('/api/articles?limit=100');
      
      if (!response.ok) {
        return; // Silently fail - category counts are not critical
      }

      const data: ArticlesApiResponse = await response.json();

      if (data.success) {
        // Calculate category counts
        const counts: Partial<Record<Category, number>> = {};
        data.data.articles.forEach(article => {
          counts[article.category] = (counts[article.category] || 0) + 1;
        });

        setState(prev => ({
          ...prev,
          categoryCounts: counts,
        }));
      }
    } catch (error) {
      // Silently fail - category counts are not critical
      console.error('Failed to fetch category counts:', error);
    }
  }, []);

  /**
   * Handle search query change
   */
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        searchTerm: query,
      },
      pagination: {
        ...prev.pagination,
        page: 1, // Reset to first page on search
      },
    }));
  }, []);

  /**
   * Handle category filter change
   */
  const handleCategoryChange = useCallback((category: Category | null) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        category,
      },
      pagination: {
        ...prev.pagination,
        page: 1, // Reset to first page on filter change
      },
    }));
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: newPage,
      },
    }));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Handle retry button click
   */
  const handleRetry = useCallback(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Fetch articles on mount and when filters/pagination change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Fetch category counts on mount
  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  return (
    <>
      <Head>
        <title>বাংলাদেশ সংবাদ - আপনার দৈনিক সংবাদ, এক জায়গায়</title>
        <meta name="description" content="স্বয়ংক্রিয় সংবাদ সংগ্রহ ওয়েব অ্যাপ্লিকেশন - একাধিক উৎস থেকে সংবাদ নিবন্ধ ব্রাউজ, অনুসন্ধান এবং ফিল্টার করুন" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {/* Search Bar */}
        <SearchBar 
          onSearchChange={handleSearchChange}
          initialValue={state.filters.searchTerm}
        />

        {/* Category Filter */}
        <CategoryFilter
          onCategoryChange={handleCategoryChange}
          categoryCounts={state.categoryCounts}
          selectedCategory={state.filters.category}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {state.loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 text-base sm:text-lg">সংবাদ লোড হচ্ছে...</p>
            </div>
          )}

          {/* Error State */}
          {state.error && !state.loading && (
            <ErrorMessage
              message={state.error}
              type={detectErrorType(state.error)}
              onRetry={handleRetry}
            />
          )}

          {/* Empty State */}
          {!state.loading && !state.error && state.articles.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12 sm:py-16">
              <svg
                className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">কোনো সংবাদ পাওয়া যায়নি</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {state.filters.searchTerm || state.filters.category
                  ? 'আপনার অনুসন্ধান বা ফিল্টার মানদণ্ড সামঞ্জস্য করার চেষ্টা করুন'
                  : 'এই মুহূর্তে কোনো সংবাদ উপলব্ধ নেই'}
              </p>
              {(state.filters.searchTerm || state.filters.category) && (
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      filters: { category: null, searchTerm: '' },
                      pagination: { ...prev.pagination, page: 1 },
                    }));
                  }}
                  className="mt-4 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  ফিল্টার সাফ করুন
                </button>
              )}
            </div>
          )}

          {/* Articles List */}
          {!state.loading && !state.error && state.articles.length > 0 && (
            <div>
              <div className="mb-6 text-sm sm:text-base text-gray-600">
                দেখানো হচ্ছে {((state.pagination.page - 1) * state.pagination.limit) + 1} - {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} এর মধ্যে {state.pagination.total} টি সংবাদ
              </div>
              
              {/* ArticleList component with search term highlighting */}
              <ArticleList
                articles={state.articles}
                loading={state.loading}
                searchTerm={state.filters.searchTerm}
              />

              {/* Pagination */}
              <Pagination
                currentPage={state.pagination.page}
                totalPages={state.pagination.totalPages}
                onPageChange={handlePageChange}
                loading={state.loading}
                enableInfiniteScroll={true}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
