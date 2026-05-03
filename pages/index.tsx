import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ErrorMessage, { detectErrorType } from '@/components/ErrorMessage';
import { Category } from '@/lib/models/category';
import { Article } from '@/lib/models/article';
import { ArticlesApiResponse, ApiErrorResponse } from '@/lib/models/api';

// Lazy load heavy components for better initial load
const ArticleList = dynamic(() => import('@/components/ArticleList'), {
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600">সংবাদ লোড হচ্ছে...</p>
    </div>
  ),
  ssr: false, // Don't render on server for faster initial load
});

const Pagination = dynamic(() => import('@/components/Pagination'), {
  ssr: false,
});

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
  };
  categoryCounts: Partial<Record<Category, number>>;
}

export default function Home() {
  // Ref to track if category counts have been fetched
  const categoryCountsFetched = useRef(false);

  // Application state
  const [state, setState] = useState<AppState>({
    articles: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      limit: 30, // Increased from 20 for better UX
    },
    filters: {
      category: null,
    },
    categoryCounts: {},
  });

  /**
   * Fetch category counts for all categories (unfiltered)
   * This ensures category filter buttons always show total counts
   */
  const fetchCategoryCounts = useCallback(async () => {
    try {
      // Fetch articles without filters (use max limit of 100)
      // This gives us a representative sample for category counts
      const response = await fetch('/api/articles?limit=100');
      
      if (!response.ok) {
        console.warn('[fetchCategoryCounts] Failed to fetch category counts');
        return {};
      }

      const data: ArticlesApiResponse = await response.json();
      
      if (!data.success) {
        return {};
      }

      // Calculate counts from the sample
      // Note: These are approximate counts based on the first 100 articles
      const counts: Partial<Record<Category, number>> = {};
      data.data.articles.forEach(article => {
        counts[article.category] = (counts[article.category] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.warn('[fetchCategoryCounts] Error fetching category counts:', error);
      return {};
    }
  }, []);

  /**
   * Fetch articles from the API based on current filters and pagination
   * Optimized with shorter timeout and better error handling
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

      // Fetch articles with 5-second timeout (reduced from 10s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const startTime = performance.now();
      const response = await fetch(`/api/articles?${params.toString()}`, {
        signal: controller.signal,
        // Add cache hint for faster subsequent requests
        cache: 'default',
      });

      clearTimeout(timeoutId);
      const fetchTime = performance.now() - startTime;
      console.log(`[Performance] API fetch time: ${fetchTime.toFixed(2)}ms`);

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

      // Fetch category counts separately if not already loaded
      // This ensures category buttons always show total counts regardless of filters
      let counts = state.categoryCounts;
      if (!categoryCountsFetched.current) {
        counts = await fetchCategoryCounts();
        categoryCountsFetched.current = true;
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
        categoryCounts: counts,
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
  }, [state.pagination.page, state.pagination.limit, state.filters.category, fetchCategoryCounts]);

  /**
   * Handle category filter change
   * Update state immediately for responsive UI
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

  // Memoize computed values
  const hasArticles = useMemo(() => state.articles.length > 0, [state.articles.length]);
  const hasFilters = useMemo(() => 
    Boolean(state.filters.category),
    [state.filters.category]
  );

  // Fetch articles on mount and when filters/pagination change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <>
      <Head>
        <title>বাংলাদেশ সংবাদ - আপনার দৈনিক সংবাদ, এক জায়গায়</title>
        <meta name="description" content="স্বয়ংক্রিয় সংবাদ সংগ্রহ ওয়েব অ্যাপ্লিকেশন - একাধিক উৎস থেকে সংবাদ নিবন্ধ ব্রাউজ, অনুসন্ধান এবং ফিল্টার করুন" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preconnect to API for faster requests */}
        <link rel="preconnect" href="/api" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Static content loads immediately */}
        <Header />
        <CategoryFilter
          onCategoryChange={handleCategoryChange}
          categoryCounts={state.categoryCounts}
          selectedCategory={state.filters.category}
        />

        {/* Dynamic content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {state.loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-base sm:text-lg">সংবাদ লোড হচ্ছে...</p>
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
          {!state.loading && !state.error && !hasArticles && (
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
              <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">কোনো সংবাদ পাওয়া যায়নি</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {hasFilters
                  ? 'আপনার অনুসন্ধান বা ফিল্টার মানদণ্ড সামঞ্জস্য করার চেষ্টা করুন'
                  : 'এই মুহূর্তে কোনো সংবাদ উপলব্ধ নেই'}
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      filters: { category: null },
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
          {!state.loading && !state.error && hasArticles && (
            <div>
              <div className="mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                দেখানো হচ্ছে {((state.pagination.page - 1) * state.pagination.limit) + 1} - {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} এর মধ্যে {state.pagination.total} টি সংবাদ
              </div>
              
              <ArticleList
                articles={state.articles}
                loading={state.loading}
              />

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
