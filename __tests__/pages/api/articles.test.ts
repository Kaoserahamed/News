/**
 * Tests for GET /api/articles endpoint
 * 
 * Tests validation, error handling, and successful responses
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/articles';
import { getDatabaseService } from '../../../lib/services/database';
import { Category } from '../../../lib/models/category';
import { ArticleResult } from '../../../lib/models/api';
import { Article } from '../../../lib/models/article';

// Mock the database service
jest.mock('../../../lib/services/database');

describe('GET /api/articles', () => {
  let mockRequest: Partial<NextApiRequest>;
  let mockResponse: Partial<NextApiResponse>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockDbService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    // Setup mock database service
    mockDbService = {
      isHealthy: jest.fn().mockResolvedValue(true),
      connect: jest.fn().mockResolvedValue(undefined),
      findArticles: jest.fn(),
    };

    (getDatabaseService as jest.Mock).mockReturnValue(mockDbService);
  });

  describe('Method validation', () => {
    it('should return 405 for non-GET requests', async () => {
      mockRequest = {
        method: 'POST',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(405);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET requests are allowed',
        },
      });
    });
  });

  describe('Query parameter validation', () => {
    it('should return 400 for invalid page parameter (non-numeric)', async () => {
      mockRequest = {
        method: 'GET',
        query: { page: 'invalid' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Page parameter must be a valid number',
        },
      });
    });

    it('should return 400 for invalid page parameter (negative)', async () => {
      mockRequest = {
        method: 'GET',
        query: { page: '-1' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Page must be a positive integer',
        },
      });
    });

    it('should return 400 for invalid page parameter (zero)', async () => {
      mockRequest = {
        method: 'GET',
        query: { page: '0' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Page must be a positive integer',
        },
      });
    });

    it('should return 400 for invalid limit parameter (non-numeric)', async () => {
      mockRequest = {
        method: 'GET',
        query: { limit: 'invalid' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Limit parameter must be a valid number',
        },
      });
    });

    it('should return 400 for invalid limit parameter (less than 1)', async () => {
      mockRequest = {
        method: 'GET',
        query: { limit: '0' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Limit must be at least 1',
        },
      });
    });

    it('should return 400 for invalid limit parameter (exceeds 100)', async () => {
      mockRequest = {
        method: 'GET',
        query: { limit: '101' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Limit cannot exceed 100',
        },
      });
    });

    it('should return 400 for invalid category', async () => {
      mockRequest = {
        method: 'GET',
        query: { category: 'InvalidCategory' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: expect.stringContaining('Invalid category'),
        },
      });
    });

    it('should accept valid category values', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { category: 'Technology' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        category: Category.TECHNOLOGY,
      });
    });
  });

  describe('Successful responses', () => {
    it('should return articles with default pagination', async () => {
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Test Article 1',
          summary: 'Summary 1',
          content: 'Content 1',
          url: 'https://example.com/1',
          source: 'Test Source',
          category: Category.TECHNOLOGY,
          publishedAt: new Date('2024-01-15T10:00:00Z'),
          processedAt: new Date('2024-01-15T10:05:00Z'),
          createdAt: new Date('2024-01-15T10:05:00Z'),
        },
      ];

      const mockResult: ArticleResult = {
        articles: mockArticles,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(mockDbService.findArticles).toHaveBeenCalledWith({});
    });

    it('should pass page and limit parameters to database service', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { page: '2', limit: '10' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
    });

    it('should pass category filter to database service', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { category: 'Sports' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        category: Category.SPORTS,
      });
    });

    it('should pass search term to database service', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { search: 'test query' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        searchTerm: 'test query',
      });
    });

    it('should handle all query parameters together', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 3, limit: 50, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: {
          page: '3',
          limit: '50',
          category: 'Business',
          search: 'market trends',
        },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        page: 3,
        limit: 50,
        category: Category.BUSINESS,
        searchTerm: 'market trends',
      });
    });
  });

  describe('Error handling', () => {
    it('should return 503 when database is unhealthy and connection fails', async () => {
      mockDbService.isHealthy.mockResolvedValue(false);
      mockDbService.connect.mockRejectedValue(new Error('Connection failed'));

      mockRequest = {
        method: 'GET',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database service is currently unavailable. Please try again later.',
        },
      });
    });

    it('should attempt to connect when database is unhealthy', async () => {
      mockDbService.isHealthy.mockResolvedValue(false);
      mockDbService.connect.mockResolvedValue(undefined);
      
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockDbService.connect).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('should return 503 for database errors during query', async () => {
      mockDbService.findArticles.mockRejectedValue(new Error('MongoDB connection error'));

      mockRequest = {
        method: 'GET',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database service encountered an error. Please try again later.',
        },
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockDbService.findArticles.mockRejectedValue(new Error('Unexpected error'));

      mockRequest = {
        method: 'GET',
        query: {},
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing your request.',
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search string', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { search: '' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        searchTerm: '',
      });
    });

    it('should handle maximum valid limit (100)', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { limit: '100' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        limit: 100,
      });
    });

    it('should handle large page numbers', async () => {
      const mockResult: ArticleResult = {
        articles: [],
        pagination: { page: 9999, limit: 20, total: 0, totalPages: 0 },
      };
      mockDbService.findArticles.mockResolvedValue(mockResult);

      mockRequest = {
        method: 'GET',
        query: { page: '9999' },
      };

      await handler(mockRequest as NextApiRequest, mockResponse as NextApiResponse);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockDbService.findArticles).toHaveBeenCalledWith({
        page: 9999,
      });
    });
  });
});
