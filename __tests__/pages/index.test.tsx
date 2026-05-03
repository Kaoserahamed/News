import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';
import { ArticlesApiResponse } from '@/lib/models/api';
import { Category } from '@/lib/models/category';

// Mock the components
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('@/components/SearchBar', () => {
  return function MockSearchBar({ onSearchChange }: any) {
    return (
      <div data-testid="search-bar">
        <input
          data-testid="search-input"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    );
  };
});

jest.mock('@/components/CategoryFilter', () => {
  return function MockCategoryFilter({ onCategoryChange }: any) {
    return (
      <div data-testid="category-filter">
        <button data-testid="category-all" onClick={() => onCategoryChange(null)}>All</button>
        <button data-testid="category-technology" onClick={() => onCategoryChange(Category.TECHNOLOGY)}>Technology</button>
        <button data-testid="category-sports" onClick={() => onCategoryChange(Category.SPORTS)}>Sports</button>
      </div>
    );
  };
});

jest.mock('@/components/ArticleList', () => {
  return function MockArticleList({ articles }: any) {
    return (
      <div data-testid="article-list">
        {articles.map((article: any) => (
          <div key={article.id} data-testid={`article-${article.id}`}>
            {article.title}
          </div>
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
        <span data-testid="current-page">{currentPage}</span>
        <button 
          data-testid="next-page" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
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
          <div>Error Loading Articles</div>
          <div>{message}</div>
          <button data-testid="retry-button" onClick={onRetry}>Retry</button>
        </div>
      );
    },
    detectErrorType: jest.fn(() => 'network'),
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock window.scrollTo to avoid jsdom warnings
global.scrollTo = jest.fn();

describe('Home Page - Frontend to Backend API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the main page structure', async () => {
      const mockResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [
            {
              id: '1',
              title: 'Test Article',
              summary: 'Test summary',
              content: 'Test content',
              url: 'https://example.com',
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

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<Home />);

      // Check that main components are rendered
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();

      // Wait for articles to load
      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Home />);

      expect(screen.getByText('Loading articles...')).toBeInTheDocument();
    });

    it('displays error state when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Articles')).toBeInTheDocument();
      });
    });

    it('displays empty state when no articles are found', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No articles found')).toBeInTheDocument();
      });
    });
  });

  describe('API Endpoint Integration - Requirements 5.1, 5.2, 5.3, 5.4', () => {
    it('calls /api/articles endpoint with default pagination parameters', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/articles?page=1&limit=20'),
          expect.objectContaining({
            signal: expect.any(AbortSignal),
          })
        );
      });
    });

    it('includes timeout mechanism in API calls', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(fetchCall[1]).toHaveProperty('signal');
        expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal);
      });
    });
  });

  describe('Search Query Parameter Passing - Requirements 6.1, 7.2', () => {
    it('passes search query parameter to API when search term is entered', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Clear previous calls
      jest.clearAllMocks();

      // Simulate search input
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'technology' } });

      // Wait for debounced search to trigger
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=technology'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    it('resets to page 1 when search query changes', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Enter search term
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });

    it('URL encodes search query parameters correctly', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Enter search term with special characters
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test & query' } });

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const url = fetchCall[0];
        // URLSearchParams should encode special characters
        expect(url).toContain('search=test+%26+query');
      }, { timeout: 1000 });
    });
  });

  describe('Category Filter Parameter Passing - Requirements 5.3, 7.2', () => {
    it('passes category parameter to API when category is selected', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Click Technology category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=Technology'),
          expect.any(Object)
        );
      });
    });

    it('removes category parameter when "All" is selected', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Select a category first
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=Technology'),
          expect.any(Object)
        );
      });

      jest.clearAllMocks();

      // Click "All" to clear filter
      const allButton = screen.getByTestId('category-all');
      fireEvent.click(allButton);

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const url = fetchCall[0];
        expect(url).not.toContain('category=');
      });
    });

    it('resets to page 1 when category filter changes', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Select category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Pagination Parameter Passing - Requirements 5.2', () => {
    it('passes page parameter to API when page changes', async () => {
      const mockResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [
            {
              id: '1',
              title: 'Test Article',
              summary: 'Test summary',
              content: 'Test content',
              url: 'https://example.com',
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
            total: 50,
            totalPages: 3,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      jest.clearAllMocks();

      // Click next page
      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    it('maintains limit parameter across page changes', async () => {
      const mockResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [
            {
              id: '1',
              title: 'Test Article',
              summary: 'Test summary',
              content: 'Test content',
              url: 'https://example.com',
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
            total: 50,
            totalPages: 3,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      jest.clearAllMocks();

      // Click next page
      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=20'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Combined Filter Parameters - Requirements 5.3, 5.4', () => {
    it('passes both search and category parameters together', async () => {
      const mockResponse: ArticlesApiResponse = {
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
        json: async () => mockResponse,
      });

      render(<Home />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Select category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=Technology'),
          expect.any(Object)
        );
      });

      jest.clearAllMocks();

      // Enter search term
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'AI' } });

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const url = fetchCall[0];
        expect(url).toContain('category=Technology');
        expect(url).toContain('search=AI');
      }, { timeout: 1000 });
    });

    it('passes search, category, and pagination parameters together', async () => {
      const mockResponse: ArticlesApiResponse = {
        success: true,
        data: {
          articles: [
            {
              id: '1',
              title: 'Test Article',
              summary: 'Test summary',
              content: 'Test content',
              url: 'https://example.com',
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
            total: 50,
            totalPages: 3,
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<Home />);

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByTestId('article-list')).toBeInTheDocument();
      });

      // Select category
      const techButton = screen.getByTestId('category-technology');
      fireEvent.click(techButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category=Technology'),
          expect.any(Object)
        );
      });

      // Enter search term
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'AI' } });

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls.find(call => 
          call[0].includes('search=AI')
        );
        expect(fetchCall).toBeDefined();
      }, { timeout: 1000 });

      jest.clearAllMocks();

      // Wait for pagination to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      // Change page
      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const url = fetchCall[0];
        expect(url).toContain('page=2');
        expect(url).toContain('category=Technology');
        expect(url).toContain('search=AI');
        expect(url).toContain('limit=20');
      });
    });
  });

  describe('Error Handling - Requirements 10.1, 10.2', () => {
    it('handles 503 service unavailable error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Service temporarily unavailable. Please try again later.',
          },
        }),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/Service temporarily unavailable/i)).toBeInTheDocument();
      });
    });

    it('handles 400 bad request error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
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
        expect(screen.getByText(/Invalid request parameters/i)).toBeInTheDocument();
      });
    });

    it('handles timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const error = new Error('Timeout');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/Request timed out/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('provides retry functionality on error', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
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
          }),
        });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });
});
