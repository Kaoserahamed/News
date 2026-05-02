import { NewsCollectorService } from './news-collector';
import { RSSSource } from '../models/rss-source';
import { Category } from '../models/category';

// Mock rss-parser
jest.mock('rss-parser');

// Mock fs module
jest.mock('fs');

describe('NewsCollectorService', () => {
  let service: NewsCollectorService;
  let mockParser: any;
  let mockFs: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Get the mocked modules
    const Parser = require('rss-parser');
    mockFs = require('fs');
    
    // Create mock parser instance
    mockParser = {
      parseURL: jest.fn(),
    };

    // Mock the Parser constructor to return our mock instance
    Parser.mockImplementation(() => mockParser);

    // Mock fs.readFileSync to return a valid config
    const mockConfig = {
      sources: [
        {
          id: 'source1',
          name: 'Source 1',
          url: 'https://example.com/feed1.xml',
          category: Category.TECHNOLOGY,
          enabled: true,
        },
        {
          id: 'source2',
          name: 'Source 2',
          url: 'https://example.com/feed2.xml',
          category: Category.SPORTS,
          enabled: true,
        },
        {
          id: 'source3',
          name: 'Source 3',
          url: 'https://example.com/feed3.xml',
          category: Category.BUSINESS,
          enabled: false, // Disabled source
        },
      ],
    };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

    // Create service instance
    service = new NewsCollectorService();
  });

  describe('fetchSource', () => {
    const mockSource: RSSSource = {
      id: 'test-source',
      name: 'Test Source',
      url: 'https://example.com/feed.xml',
      category: Category.TECHNOLOGY,
      enabled: true,
    };

    it('should fetch and parse articles from RSS feed', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Test Article 1',
            link: 'https://example.com/article1',
            pubDate: '2024-01-15T10:00:00Z',
            contentSnippet: 'This is a summary',
            content: 'This is the full content',
          },
          {
            title: 'Test Article 2',
            link: 'https://example.com/article2',
            pubDate: '2024-01-15T11:00:00Z',
            summary: 'Another summary',
            'content:encoded': 'Another full content',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(mockParser.parseURL).toHaveBeenCalledWith(mockSource.url);
      expect(articles).toHaveLength(2);
      
      expect(articles[0]).toEqual({
        title: 'Test Article 1',
        link: 'https://example.com/article1',
        pubDate: '2024-01-15T10:00:00Z',
        summary: 'This is a summary',
        content: 'This is the full content',
        source: 'Test Source',
      });

      expect(articles[1]).toEqual({
        title: 'Test Article 2',
        link: 'https://example.com/article2',
        pubDate: '2024-01-15T11:00:00Z',
        summary: 'Another summary',
        content: 'Another full content',
        source: 'Test Source',
      });
    });

    it('should handle missing optional fields (summary, content)', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Article Without Optional Fields',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
            // No summary or content
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles).toHaveLength(1);
      expect(articles[0]).toEqual({
        title: 'Article Without Optional Fields',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        summary: undefined,
        content: undefined,
        source: 'Test Source',
      });
    });

    it('should skip items without required fields', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Valid Article',
            link: 'https://example.com/valid',
            pubDate: '2024-01-15T10:00:00Z',
          },
          {
            // Missing title
            link: 'https://example.com/no-title',
            pubDate: '2024-01-15T10:00:00Z',
          },
          {
            title: 'No Link',
            // Missing link
            pubDate: '2024-01-15T10:00:00Z',
          },
          {
            title: 'No Date',
            link: 'https://example.com/no-date',
            // Missing pubDate
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Valid Article');
    });

    it('should handle empty feed', async () => {
      // Arrange
      const mockFeed = {
        items: [],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles).toHaveLength(0);
    });

    it('should handle feed without items array', async () => {
      // Arrange
      const mockFeed = {};

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles).toHaveLength(0);
    });

    it('should throw error when fetch fails', async () => {
      // Arrange
      mockParser.parseURL.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.fetchSource(mockSource)).rejects.toThrow(
        'Failed to fetch RSS feed from Test Source: Network error'
      );
    });

    it('should timeout after 10 seconds', async () => {
      // Arrange
      mockParser.parseURL.mockImplementation(() => {
        return new Promise((resolve) => {
          // Never resolve to simulate hanging request
          setTimeout(() => resolve({ items: [] }), 15000);
        });
      });

      // Act & Assert
      await expect(service.fetchSource(mockSource)).rejects.toThrow(
        'Timeout fetching RSS feed from Test Source'
      );
    }, 12000); // Set test timeout to 12 seconds

    it('should prefer contentSnippet over summary for summary field', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Test Article',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
            contentSnippet: 'Content snippet',
            summary: 'Summary field',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles[0].summary).toBe('Content snippet');
    });

    it('should prefer content over content:encoded for content field', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Test Article',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
            content: 'Regular content',
            'content:encoded': 'Encoded content',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchSource(mockSource);

      // Assert
      expect(articles[0].content).toBe('Regular content');
    });
  });

  describe('fetchAllSources', () => {
    it('should fetch articles from all enabled sources', async () => {
      // Arrange
      const mockFeed1 = {
        items: [
          {
            title: 'Article from Source 1',
            link: 'https://example.com/article1',
            pubDate: '2024-01-15T10:00:00Z',
            contentSnippet: 'Summary 1',
          },
        ],
      };

      const mockFeed2 = {
        items: [
          {
            title: 'Article from Source 2',
            link: 'https://example.com/article2',
            pubDate: '2024-01-15T11:00:00Z',
            contentSnippet: 'Summary 2',
          },
        ],
      };

      mockParser.parseURL
        .mockResolvedValueOnce(mockFeed1)
        .mockResolvedValueOnce(mockFeed2);

      // Act
      const articles = await service.fetchAllSources();

      // Assert
      expect(mockParser.parseURL).toHaveBeenCalledTimes(2); // Only enabled sources
      expect(articles).toHaveLength(2);
      expect(articles[0].source).toBe('Source 1');
      expect(articles[1].source).toBe('Source 2');
    });

    it('should skip disabled sources', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Test Article',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Act
      const articles = await service.fetchAllSources();

      // Assert
      // Should only call parseURL for enabled sources (source1 and source2)
      expect(mockParser.parseURL).toHaveBeenCalledTimes(2);
      expect(mockParser.parseURL).toHaveBeenCalledWith('https://example.com/feed1.xml');
      expect(mockParser.parseURL).toHaveBeenCalledWith('https://example.com/feed2.xml');
      expect(mockParser.parseURL).not.toHaveBeenCalledWith('https://example.com/feed3.xml');
    });

    it('should continue with remaining sources when one source fails', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Successful Article',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
          },
        ],
      };

      // First source fails, second succeeds
      mockParser.parseURL
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockFeed);

      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const articles = await service.fetchAllSources();

      // Assert
      expect(articles).toHaveLength(1);
      expect(articles[0].source).toBe('Source 2');
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should return empty array when all sources fail', async () => {
      // Arrange
      mockParser.parseURL.mockRejectedValue(new Error('Network error'));

      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const articles = await service.fetchAllSources();

      // Assert
      expect(articles).toHaveLength(0);
      expect(mockParser.parseURL).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should combine articles from multiple sources into single array', async () => {
      // Arrange
      const mockFeed1 = {
        items: [
          {
            title: 'Article 1 from Source 1',
            link: 'https://example.com/article1',
            pubDate: '2024-01-15T10:00:00Z',
          },
          {
            title: 'Article 2 from Source 1',
            link: 'https://example.com/article2',
            pubDate: '2024-01-15T10:30:00Z',
          },
        ],
      };

      const mockFeed2 = {
        items: [
          {
            title: 'Article 1 from Source 2',
            link: 'https://example.com/article3',
            pubDate: '2024-01-15T11:00:00Z',
          },
        ],
      };

      mockParser.parseURL
        .mockResolvedValueOnce(mockFeed1)
        .mockResolvedValueOnce(mockFeed2);

      // Act
      const articles = await service.fetchAllSources();

      // Assert
      expect(articles).toHaveLength(3);
      expect(articles[0].title).toBe('Article 1 from Source 1');
      expect(articles[1].title).toBe('Article 2 from Source 1');
      expect(articles[2].title).toBe('Article 1 from Source 2');
    });

    it('should log execution timestamp and article count', async () => {
      // Arrange
      const mockFeed = {
        items: [
          {
            title: 'Test Article',
            link: 'https://example.com/article',
            pubDate: '2024-01-15T10:00:00Z',
          },
        ],
      };

      mockParser.parseURL.mockResolvedValue(mockFeed);

      // Spy on console.log to verify logging
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.fetchAllSources();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalled();
      
      // Check that logs contain expected information
      const logCalls = consoleLogSpy.mock.calls;
      const hasStartLog = logCalls.some(call => 
        JSON.stringify(call).includes('Starting fetch')
      );
      const hasCompletionLog = logCalls.some(call => 
        JSON.stringify(call).includes('Completed fetch')
      );

      expect(hasStartLog).toBe(true);
      expect(hasCompletionLog).toBe(true);

      // Cleanup
      consoleLogSpy.mockRestore();
    });

    it('should handle empty config with no sources', async () => {
      // Arrange - Create a new service with empty config
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ sources: [] }));
      const emptyService = new NewsCollectorService();

      // Act
      const articles = await emptyService.fetchAllSources();

      // Assert
      expect(articles).toHaveLength(0);
      expect(mockParser.parseURL).not.toHaveBeenCalled();
    });

    it('should process sources concurrently', async () => {
      // Arrange
      const delays: number[] = [];
      const startTime = Date.now();

      mockParser.parseURL.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            delays.push(Date.now() - startTime);
            resolve({ items: [] });
          }, 100); // Each source takes 100ms
        });
      });

      // Act
      await service.fetchAllSources();

      // Assert
      // If processed sequentially, would take 200ms+
      // If concurrent, should take ~100ms
      // Check that both sources completed around the same time (within 50ms of each other)
      expect(delays).toHaveLength(2);
      expect(Math.abs(delays[0] - delays[1])).toBeLessThan(50);
    });
  });
});
