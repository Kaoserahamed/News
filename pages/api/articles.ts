/**
 * GET /api/articles endpoint
 * 
 * Returns news articles with support for pagination, filtering, and search.
 * 
 * Query Parameters:
 * - page (number, default: 1): Page number for pagination
 * - limit (number, default: 20, max: 100): Number of articles per page
 * - category (string, optional): Filter by category (Technology, Sports, Business, Politics, Entertainment, General)
 * - search (string, optional): Search term for title/summary
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabaseService } from '../../lib/services/database';
import { ArticleQuery } from '../../lib/models/api';
import { isValidCategory, Category } from '../../lib/models/category';
import type { ApiResponse, ArticlesApiResponse, ApiErrorResponse } from '../../lib/models/api';

/**
 * Handler for GET /api/articles
 * 
 * Validates query parameters, calls DatabaseService.findArticles(),
 * and returns JSON response with articles and pagination metadata.
 * 
 * Error Handling:
 * - Returns 400 for invalid parameters
 * - Returns 503 for database errors
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET requests are allowed',
      },
    };
    return res.status(405).json(errorResponse);
  }

  try {
    const requestStartTime = Date.now();
    
    // Parse and validate query parameters
    const validationResult = validateQueryParameters(req.query);
    
    if (!validationResult.valid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: validationResult.error || 'Invalid query parameters',
        },
      };
      return res.status(400).json(errorResponse);
    }

    const query: ArticleQuery = validationResult.query!;

    // Get database service instance and connect if needed
    const dbService = getDatabaseService();
    
    const connectionStartTime = Date.now();
    try {
      // Ensure connection with timeout (reduced for faster failure)
      if (!await dbService.isHealthy()) {
        await Promise.race([
          dbService.connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 4000) // Reduced from 5000ms
          )
        ]);
      }
      const connectionTime = Date.now() - connectionStartTime;
      if (connectionTime > 10) {
        console.log(`[API /articles] Connection check took ${connectionTime}ms`);
      }
    } catch (connectError) {
      console.error('[API /articles] Database connection failed:', connectError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database service is currently unavailable. Please try again later.',
        },
      };
      return res.status(503).json(errorResponse);
    }

    // Call DatabaseService.findArticles() with query parameters and timeout
    const dbQueryStartTime = Date.now();
    const result = await Promise.race([
      dbService.findArticles(query),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
    ]);
    const dbQueryTime = Date.now() - dbQueryStartTime;

    const totalTime = Date.now() - requestStartTime;
    console.log(`[API /articles] Total request time: ${totalTime}ms (DB query: ${dbQueryTime}ms)`);

    // Return successful response with articles and pagination metadata
    const successResponse: ArticlesApiResponse = {
      success: true,
      data: result,
    };

    // Add cache headers for better performance
    // Cache for 30 seconds, stale-while-revalidate for 60 seconds
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(successResponse);

  } catch (error) {
    console.error('[API /articles] Error processing request:', error);

    // Check if it's a database error
    const errorMessage = (error as Error).message || 'Unknown error';
    
    if (errorMessage.includes('database') || errorMessage.includes('MongoDB')) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database service encountered an error. Please try again later.',
        },
      };
      return res.status(503).json(errorResponse);
    }

    // Generic server error
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request.',
      },
    };
    return res.status(500).json(errorResponse);
  }
}

/**
 * Validation result type
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  query?: ArticleQuery;
}

/**
 * Validate and parse query parameters
 * 
 * Validates:
 * - page: must be a positive integer
 * - limit: must be a positive integer between 1 and 100
 * - category: must be a valid Category enum value
 * - search: any string value
 * 
 * Requirements: 5.6
 * 
 * @param query Raw query parameters from request
 * @returns ValidationResult with parsed query or error message
 */
function validateQueryParameters(query: any): ValidationResult {
  const articleQuery: ArticleQuery = {};

  // Validate page parameter
  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    
    if (isNaN(page)) {
      return {
        valid: false,
        error: 'Page parameter must be a valid number',
      };
    }
    
    if (page < 1) {
      return {
        valid: false,
        error: 'Page must be a positive integer',
      };
    }
    
    articleQuery.page = page;
  }

  // Validate limit parameter
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    
    if (isNaN(limit)) {
      return {
        valid: false,
        error: 'Limit parameter must be a valid number',
      };
    }
    
    if (limit < 1) {
      return {
        valid: false,
        error: 'Limit must be at least 1',
      };
    }
    
    if (limit > 100) {
      return {
        valid: false,
        error: 'Limit cannot exceed 100',
      };
    }
    
    articleQuery.limit = limit;
  }

  // Validate category parameter
  if (query.category !== undefined) {
    const category = query.category as string;
    
    if (!category || typeof category !== 'string') {
      return {
        valid: false,
        error: 'Category parameter must be a non-empty string',
      };
    }
    
    if (!isValidCategory(category)) {
      return {
        valid: false,
        error: `Invalid category. Must be one of: ${Object.values(Category).join(', ')}`,
      };
    }
    
    articleQuery.category = category as Category;
  }

  // Validate search parameter
  if (query.search !== undefined) {
    const search = query.search as string;
    
    if (typeof search !== 'string') {
      return {
        valid: false,
        error: 'Search parameter must be a string',
      };
    }
    
    // Allow empty search strings (will be handled by database service)
    articleQuery.searchTerm = search.trim();
  }

  return {
    valid: true,
    query: articleQuery,
  };
}
