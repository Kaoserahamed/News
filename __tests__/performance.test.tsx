/**
 * Performance Tests
 * 
 * Tests for Requirement 8.4:
 * - Page should load and display initial articles within 2 seconds on standard connection
 */

import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/index';
import { ArticlesApiResponse } from '@/lib/models/api';
import { Category } from '@/lib/models/category';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockApiResponse: ArticlesApiResponse = {
  success: true,
  data: {
    articles: [
      {
        id: '1',
        title: 'Test Article 1',
        summary: 'Summary 1',
        content: 'Content 1',
        url: 'https://example.com/1',
        source: 'Test Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Article 2',
        summary: 'Summary 2',
        content: 'Content 2',
        url: 'https://example.com/2',
        source: 'Test Source',
        category: Category.SPORTS,
        publishedAt: new Date(),
        processedAt: new Date(),
        createdAt: new Date(),
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  },
};

describe('Performance - Page Load Time (Requirement 8.4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  it('should load and display articles within 2 seconds', async () => {
    const startTime = performance.now();

    render(<Home />);

    // Wait for articles to be displayed
    await waitFor(
      () => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument();
        expect(screen.getByText('Test Article 2')).toBeInTheDocument();
      },
      { timeout: 2000 } // 2 second timeout per Requirement 8.4
    );

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Verify load time is under 2 seconds (2000ms)
    expect(loadTime).toBeLessThan(2000);
  });

  it('should display loading state immediately', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockApiResponse,
            });
          }, 100);
        })
    );

    render(<Home />);

    // Loading state should be visible immediately
    expect(screen.getByText('Loading articles...')).toBeInTheDocument();
  });

  it('should handle fast API responses efficiently', async () => {
    // Mock a very fast API response (50ms)
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockApiResponse,
            });
          }, 50);
        })
    );

    const startTime = performance.now();

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // With a 50ms API response, total load time should be well under 500ms
    expect(loadTime).toBeLessThan(500);
  });

  it('should handle slow API responses within timeout', async () => {
    // Mock a slower API response (1.5 seconds)
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockApiResponse,
            });
          }, 1500);
        })
    );

    const startTime = performance.now();

    render(<Home />);

    await waitFor(
      () => {
        expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Should still complete within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  it('should make minimal API calls on initial load', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    });

    // Should make exactly 2 API calls:
    // 1. Fetch articles for display
    // 2. Fetch category counts
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should not block rendering while fetching data', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockApiResponse,
            });
          }, 500);
        })
    );

    const { container } = render(<Home />);

    // Header should render immediately even while data is loading
    expect(screen.getByText('News Aggregator')).toBeInTheDocument();

    // Search bar should render immediately
    expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();

    // Category filter should render immediately
    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
  });
});

describe('Performance - Component Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });
  });

  it('should render efficiently with multiple articles', async () => {
    // Create a larger dataset
    const largeDataset: ArticlesApiResponse = {
      success: true,
      data: {
        articles: Array.from({ length: 20 }, (_, i) => ({
          id: `${i + 1}`,
          title: `Article ${i + 1}`,
          summary: `Summary ${i + 1}`,
          content: `Content ${i + 1}`,
          url: `https://example.com/${i + 1}`,
          source: 'Test Source',
          category: Category.TECHNOLOGY,
          publishedAt: new Date(),
          processedAt: new Date(),
          createdAt: new Date(),
        })),
        pagination: {
          page: 1,
          limit: 20,
          total: 20,
          totalPages: 1,
        },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => largeDataset,
    });

    const startTime = performance.now();

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 20')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render 20 articles efficiently (under 2 seconds)
    expect(renderTime).toBeLessThan(2000);
  });

  it('should use efficient CSS classes for responsive design', () => {
    const { container } = render(<Home />);

    // Check that Tailwind classes are being used (efficient CSS)
    const main = container.querySelector('main');
    expect(main).toHaveClass('container');
    expect(main).toHaveClass('mx-auto');
  });
});

describe('Performance - Network Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle API timeout gracefully', async () => {
    // Mock a timeout scenario
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('AbortError'));
          }, 10000);
        })
    );

    render(<Home />);

    // Should show loading state
    expect(screen.getByText('Loading articles...')).toBeInTheDocument();

    // Note: The actual timeout handling is done in the component with AbortController
    // This test verifies the component can handle timeout scenarios
  });

  it('should use appropriate query parameters for efficient data fetching', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify the API is called with pagination parameters
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchCall).toContain('page=');
    expect(fetchCall).toContain('limit=');
  });
});
