import { Article } from './article';
import { Category } from './category';

/**
 * ArticleQuery represents query parameters for fetching articles
 */
export interface ArticleQuery {
  page?: number;                          // Page number (1-indexed)
  limit?: number;                         // Number of articles per page
  category?: Category;                    // Filter by category
  searchTerm?: string;                    // Search term for title/summary
  sortBy?: 'publishedAt' | 'processedAt'; // Sort field
  sortOrder?: 'asc' | 'desc';             // Sort direction
}

/**
 * PaginationMetadata contains pagination information
 */
export interface PaginationMetadata {
  page: number;                           // Current page number
  limit: number;                          // Articles per page
  total: number;                          // Total number of articles
  totalPages: number;                     // Total number of pages
}

/**
 * ArticleResult represents the result of an article query
 * with pagination metadata
 */
export interface ArticleResult {
  articles: Article[];
  pagination: PaginationMetadata;
}

/**
 * Generic API response wrapper for successful responses
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  code: string;                           // Error code (e.g., "INVALID_PARAMETER")
  message: string;                        // Human-readable error message
  details?: any;                          // Optional additional error details
}

/**
 * Generic API response wrapper for error responses
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Response type for GET /api/articles endpoint
 */
export interface ArticlesApiResponse extends ApiSuccessResponse<ArticleResult> {
  success: true;
  data: ArticleResult;
}

/**
 * UpdateCycleMetrics represents metrics from an update cycle execution
 */
export interface UpdateCycleMetrics {
  articlesProcessed: number;              // Total articles fetched and processed
  articlesStored: number;                 // Articles successfully stored
  duplicatesSkipped: number;              // Duplicate articles skipped
  duration: number;                       // Duration in milliseconds
  timestamp: string;                      // ISO 8601 timestamp
}

/**
 * Response type for POST /api/cron/update endpoint
 */
export interface UpdateApiResponse extends ApiSuccessResponse<UpdateCycleMetrics> {
  success: true;
  data: UpdateCycleMetrics;
}

/**
 * HealthStatus represents the system health check response
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected' | 'error';
  lastUpdate: string | null;              // ISO 8601 timestamp of last update
  timestamp: string;                      // ISO 8601 timestamp of health check
}

/**
 * Response type for GET /api/health endpoint
 */
export interface HealthApiResponse extends ApiSuccessResponse<HealthStatus> {
  success: true;
  data: HealthStatus;
}

/**
 * Default query parameters
 */
export const DEFAULT_QUERY_PARAMS = {
  page: 1,
  limit: 20,
  sortBy: 'publishedAt' as const,
  sortOrder: 'desc' as const,
} as const;

/**
 * Query parameter limits
 */
export const QUERY_LIMITS = {
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  MIN_PAGE: 1,
} as const;
