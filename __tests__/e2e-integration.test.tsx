/**
 * End-to-End Integration Tests
 * Task 15.4: Write end-to-end integration tests
 * 
 * Tests:
 * - Complete user flow: load page → search → filter → paginate
 * - Update cycle → database storage → API retrieval → frontend display
 * - Error scenarios: database down, RSS feed unavailable, invalid queries
 * 
 * Requirements: 1.1, 5.1, 6.1, 7.2, 10.1
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../pages/index';
import { Category } from '@/lib/models/category';
import { ArticlesApiResponse } from '@/lib/models/api';

// Mock fetch globally
global.fetch = jest.fn();
global.scrollTo = jest.fn();

// Mock components to simplify testing
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">News Aggregator</div>;
  };
});

jest.mock('@/components/SearchBar', () => {
  return function MockSearchBar({ onSearchChange }: any) {
    return (
      <input
        data-testid="search-input"
        placeholder="Search articles..."
        onChange={(e) => onSearchChange(e.target.value)}
      />
    );
  };
});

jest.mock('@/components/CategoryFilter', () => {
  return function MockCategoryFilter({ selectedCategory, onCategoryChange }: any) {
    const categories = [
      { value: null, label: 'All' },
      { value: Category.TECHNOLOGY, label: 'Technology' },
      { value: Category.SPORTS, label: 'Sports' },
      { value: Category.BUSINESS, label: 'Business' },
    ];
    
    return (
      <div data-testid="category-filter">
        {categories.map((cat) => (
          <button
            key={cat.label}
            data-testid={`category-${cat.label.toLowerCase()}`}
            onClick={() => onCategoryChange(cat.value)}
            className={selectedCategory === cat.value ? 'active' : ''}
          >
            {cat.label}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/ArticleList', () => {
  return function MockArticleList({ articles, loading }: any) {
    if (loading) {
      return <div data-testid="loading">Loading articles...</div>;
    }
    
    if (articles.length === 0) {
      return <div data-testid="no-articles">No articles found</div>;
    }
    
    return (
      <div data-testid="article-list">
        {articles.map((article: any) => (
          <article key={article.id} data-testid={`article-${article.id}`}>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <span data-testid={`article-category-${article.id}`}>{article.category}</span>
          </article>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/Pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }: any) {
    return (
      <div data-testid="pagination">
        <button
          data-testid="prev-page"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span data-testid="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          data-testid="next-page"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    );
  };
});

jest.mock('@/components/ErrorMessage', () => {
  return {
    __esModule: true,
    default: function MockErrorMessage({ message, onRetry }: any) {
      return (
        <div data-testid="error-message">
          <p>{message}</p>
          <button data-testid="retry-button" onClick={onRetry}>
            Retry
          </button>
        </div>
      );
    },
    detectErrorType: jest.fn(() => 'network'),
  };
});

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Flow: Load → Search → Filter → Paginate', () => {
    /**
     * Requirement 1.1: Automated News Collection
     * Requirement 5.1: News Retrieval API
     * Requirement 6.1: Search Functionality
     * Requirement 7.2: Category-Based Filtering
     */
    it('should handle complete user journey from page load to filtered search with pagination', async () => {
      // Step 1: Initial page load
      const initialArticles = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Article ${i + 1}`,
        summary: `Summary for article ${i + 1}`,
        content: 'Content',
        url: `https://example.com/${i + 1}`,
        source: 'Test Source',
        category: i % 2 === 0 ? Category.TECHNOLOGY : Category.SPORTS,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      }));

      const initialResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: initialArticles,
          pagination: {
            page: 1,
            limit: 20,
            total: 100,
            totalPages: 5,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => initialResponse,
      });

      render(<Home />);

      // Verify initial load
      await waitFor(() => {
        expect(screen.getByText('Article 1')).toBeInTheDocument();
      });

      expect(screen.getByTestId('article-list')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();

      // Step 2: Apply category filter
      const techArticles = Array.from({ length: 20 }, (_, i) => ({
        id: `tech-${i + 1}`,
        title: `Tech Article ${i + 1}`,
        summary: `Tech summary ${i + 1}`,
        content: 'Content',
        url: `https://example.com/tech/${i + 1}`,
        source: 'Tech Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      }));

      const filteredResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: techArticles,
          pagination: {
            page: 1,
            limit: 20,
            total: 40,
            totalPages: 2,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => filteredResponse,
      });

      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(screen.getByText('Tech Article 1')).toBeInTheDocument();
      });

      // Verify category filter was applied
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=Technology'),
        expect.any(Object)
      );

      // Step 3: Apply search query
      const searchResults = Array.from({ length: 5 }, (_, i) => ({
        id: `search-${i + 1}`,
        title: `AI Technology Article ${i + 1}`,
        summary: `AI and machine learning summary ${i + 1}`,
        content: 'Content',
        url: `https://example.com/ai/${i + 1}`,
        source: 'AI Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      }));

      const searchResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: searchResults,
          pagination: {
            page: 1,
            limit: 20,
            total: 5,
            totalPages: 1,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => searchResponse,
      });

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'AI' } });

      await waitFor(() => {
        expect(screen.getByText('AI Technology Article 1')).toBeInTheDocument();
      }, { timeout: 1500 });

      // Verify search and category filter were both applied
      const lastFetchCall = (global.fetch as jest.Mock).mock.calls[
        (global.fetch as jest.Mock).mock.calls.length - 1
      ];
      expect(lastFetchCall[0]).toContain('search=AI');
      expect(lastFetchCall[0]).toContain('category=Technology');

      // Step 4: Navigate to next page (if applicable)
      // Since search results only have 1 page, let's test pagination with filtered results
      const page2Articles = Array.from({ length: 20 }, (_, i) => ({
        id: `tech-page2-${i + 1}`,
        title: `Tech Article Page 2 - ${i + 1}`,
        summary: `Tech summary page 2 - ${i + 1}`,
        content: 'Content',
        url: `https://example.com/tech/page2/${i + 1}`,
        source: 'Tech Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      }));

      // Clear search to get back to filtered results with multiple pages
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => filteredResponse,
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      }, { timeout: 1500 });

      // Now navigate to page 2
      const page2Response: ArticlesApiResponse = {
        success: true,
        data: {
          articles: page2Articles,
          pagination: {
            page: 2,
            limit: 20,
            total: 40,
            totalPages: 2,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => page2Response,
      });

      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Tech Article Page 2 - 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

      // Verify pagination parameter was passed
      const paginationFetchCall = (global.fetch as jest.Mock).mock.calls[
        (global.fetch as jest.Mock).mock.calls.length - 1
      ];
      expect(paginationFetchCall[0]).toContain('page=2');
      expect(paginationFetchCall[0]).toContain('category=Technology');
    });
  });

  describe('Update Cycle → Database → API → Frontend Flow', () => {
    /**
     * Requirement 1.1: Automated News Collection
     * Requirement 5.1: News Retrieval API
     * 
     * This test simulates the complete data flow:
     * 1. Update cycle fetches and stores articles
     * 2. API retrieves articles from database
     * 3. Frontend displays the articles
     */
    it('should display articles that were fetched and stored by update cycle', async () => {
      // Simulate articles that were recently added by the update cycle
      const recentArticles = [
        {
          id: 'recent-1',
          title: 'Breaking: New Technology Breakthrough',
          summary: 'Scientists announce major discovery in quantum computing',
          content: 'Full article content...',
          url: 'https://techcrunch.com/quantum-breakthrough',
          source: 'TechCrunch',
          category: Category.TECHNOLOGY,
          publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          processedAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
          createdAt: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          id: 'recent-2',
          title: 'Sports Update: Championship Finals',
          summary: 'Exciting match ends in dramatic fashion',
          content: 'Full article content...',
          url: 'https://espn.com/championship-finals',
          source: 'ESPN',
          category: Category.SPORTS,
          publishedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          processedAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
          createdAt: new Date(Date.now() - 1000 * 60 * 40),
        },
      ];

      const response: ArticlesApiResponse = {
        success: true,
        data: {
          articles: recentArticles,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      render(<Home />);

      // Verify articles are displayed
      await waitFor(() => {
        expect(screen.getByText('Breaking: New Technology Breakthrough')).toBeInTheDocument();
        expect(screen.getByText('Sports Update: Championship Finals')).toBeInTheDocument();
      });

      // Verify article metadata is displayed
      expect(screen.getByText(/Scientists announce major discovery/)).toBeInTheDocument();
      expect(screen.getByText(/Exciting match ends in dramatic fashion/)).toBeInTheDocument();

      // Verify categories are displayed
      const article1Category = screen.getByTestId('article-category-recent-1');
      const article2Category = screen.getByTestId('article-category-recent-2');
      expect(article1Category).toHaveTextContent('Technology');
      expect(article2Category).toHaveTextContent('Sports');
    });

    it('should handle empty database (no articles collected yet)', async () => {
      const emptyResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => emptyResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No articles found')).toBeInTheDocument();
      });

      expect(screen.getByText('No articles are available at the moment')).toBeInTheDocument();
    });
  });

  describe('Error Scenarios', () => {
    /**
     * Requirement 10.1: Error Handling and User Feedback
     * 
     * Tests various error conditions:
     * - Database unavailable
     * - RSS feed failures (simulated via API errors)
     * - Invalid queries
     */

    it('should handle database unavailable error (503)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Database service is currently unavailable. Please try again later.',
          },
        }),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Service temporarily unavailable/)).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should handle RSS feed unavailable (simulated as empty results)', async () => {
      // When RSS feeds fail, the update cycle continues but stores fewer articles
      // This results in potentially empty or reduced results
      const response: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => response,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No articles found')).toBeInTheDocument();
      });
    });

    it('should handle invalid query parameters (400)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Invalid request parameters',
          },
        }),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Invalid request parameters/)).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      // First call fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Second call succeeds
      const successResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [
            {
              id: '1',
              title: 'Test Article',
              summary: 'Test summary',
              content: 'Content',
              url: 'https://example.com/1',
              source: 'Test Source',
              category: Category.TECHNOLOGY,
              publishedAt: new Date(),
              processedAt: new Date(),
              createdAt: new Date(),
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => successResponse,
      });

      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle database error during query (503)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database service encountered an error. Please try again later.',
          },
        }),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Service temporarily unavailable/)).toBeInTheDocument();
    });

    it('should handle unexpected server errors (500)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred while processing your request.',
          },
        }),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Failed to fetch articles/)).toBeInTheDocument();
    });
  });

  describe('Integration: Search and Filter Combinations', () => {
    /**
     * Requirement 6.1: Search Functionality
     * Requirement 7.2: Category-Based Filtering
     */

    it('should maintain search query when changing categories', async () => {
      const initialResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => initialResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Enter search term
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'technology' } });

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toContain('search=technology');
      }, { timeout: 1500 });

      jest.clearAllMocks();

      // Change category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toContain('search=technology');
        expect(lastCall[0]).toContain('category=Technology');
      });
    });

    it('should clear filters when selecting "All" category', async () => {
      const initialResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => initialResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Select a category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toContain('category=Technology');
      });

      jest.clearAllMocks();

      // Select "All" to clear filter
      const allButton = screen.getByTestId('category-all');
      fireEvent.click(allButton);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).not.toContain('category=');
      });
    });
  });
});
