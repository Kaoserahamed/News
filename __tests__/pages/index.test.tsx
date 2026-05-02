import { render, screen, waitFor } from '@testing-library/react';
import Home from './index';
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
        <button onClick={() => onCategoryChange(null)}>All</button>
        <button onClick={() => onCategoryChange('Technology')}>Technology</button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('fetches articles with correct query parameters', async () => {
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
        expect.any(Object)
      );
    });
  });
});
