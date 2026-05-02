/**
 * Duplicate Detector Service
 * 
 * Identifies and prevents duplicate articles from being stored.
 * Uses URL matching and title similarity (Levenshtein distance) to detect duplicates.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import * as levenshtein from 'fast-levenshtein';
import { ProcessedArticle } from '../models/article';
import { DatabaseService } from './database';

/**
 * DuplicateDetectorService class
 * 
 * Provides methods to detect duplicate articles based on URL and title similarity.
 * Uses Levenshtein distance algorithm for title similarity calculation.
 * Integrates with DatabaseService to query only recent articles (last 7 days) for optimization.
 */
export class DuplicateDetectorService {
  // Similarity threshold for duplicate detection (90%)
  private readonly SIMILARITY_THRESHOLD = 0.9;
  
  // Number of days to look back for duplicate detection (optimization)
  private readonly RECENT_ARTICLES_DAYS = 7;
  
  private databaseService?: DatabaseService;

  /**
   * Constructor
   * 
   * @param databaseService Optional DatabaseService instance for database-backed duplicate detection
   */
  constructor(databaseService?: DatabaseService) {
    this.databaseService = databaseService;
  }

  /**
   * Get or initialize the database service
   * 
   * @returns DatabaseService instance
   */
  private getDatabaseService(): DatabaseService {
    if (!this.databaseService) {
      this.databaseService = DatabaseService.getInstance();
    }
    return this.databaseService;
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   * 
   * The Levenshtein distance measures the minimum number of single-character edits
   * (insertions, deletions, or substitutions) required to change one string into another.
   * 
   * This method normalizes the distance to a 0-1 similarity score where:
   * - 1.0 = identical strings
   * - 0.0 = completely different strings
   * 
   * Formula: similarity = 1 - (distance / maxLength)
   * 
   * Requirements: 3.3
   * 
   * @param str1 - First string to compare
   * @param str2 - Second string to compare
   * @returns Similarity score between 0 and 1 (1 = identical)
   */
  calculateSimilarity(str1: string, str2: string): number {
    // Handle edge cases
    if (!str1 && !str2) {
      return 1.0; // Both empty strings are identical
    }

    if (!str1 || !str2) {
      return 0.0; // One empty, one non-empty = completely different
    }

    // Normalize strings: convert to lowercase and trim whitespace
    const normalized1 = str1.toLowerCase().trim();
    const normalized2 = str2.toLowerCase().trim();

    // If normalized strings are identical, return 1.0
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Calculate Levenshtein distance
    const distance = levenshtein.get(normalized1, normalized2);

    // Get the length of the longer string for normalization
    const maxLength = Math.max(normalized1.length, normalized2.length);

    // Normalize to 0-1 range
    // similarity = 1 - (distance / maxLength)
    const similarity = 1 - distance / maxLength;

    // Ensure result is within [0, 1] range (handle floating point edge cases)
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Check if an article URL is a duplicate of any existing article
   * 
   * Performs case-insensitive exact URL matching.
   * 
   * Requirements: 3.1, 3.2
   * 
   * @param url - URL to check
   * @param existing - Array of existing articles to compare against
   * @returns true if URL duplicate found, false otherwise
   */
  checkURLDuplicate(url: string, existing: ProcessedArticle[]): boolean {
    if (!url) {
      return false;
    }

    // Normalize URL for comparison (lowercase, trim)
    const normalizedUrl = url.toLowerCase().trim();

    // Check if any existing article has the same URL
    return existing.some((article) => {
      const existingUrl = article.url.toLowerCase().trim();
      return existingUrl === normalizedUrl;
    });
  }

  /**
   * Check if an article title is similar to any existing article title
   * 
   * Uses Levenshtein distance to calculate title similarity.
   * Returns true if similarity exceeds 90% threshold.
   * 
   * Requirements: 3.3
   * 
   * @param title - Title to check
   * @param existing - Array of existing articles to compare against
   * @returns true if similar title found (>90% similarity), false otherwise
   */
  checkTitleSimilarity(title: string, existing: ProcessedArticle[]): boolean {
    if (!title) {
      return false;
    }

    // Check similarity against each existing article title
    for (const article of existing) {
      const similarity = this.calculateSimilarity(title, article.title);

      // If similarity exceeds threshold, it's a duplicate
      if (similarity >= this.SIMILARITY_THRESHOLD) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an article is a duplicate of any existing article
   * 
   * Checks both URL (exact match) and title similarity (>90% threshold).
   * Returns true if either check indicates a duplicate.
   * 
   * Requirements: 3.1, 3.2, 3.3, 3.4
   * 
   * @param article - Article to check
   * @param existing - Array of existing articles to compare against
   * @returns true if duplicate found, false otherwise
   */
  isDuplicate(article: ProcessedArticle, existing: ProcessedArticle[]): boolean {
    // Check URL duplicate first (faster exact match)
    if (this.checkURLDuplicate(article.url, existing)) {
      return true;
    }

    // Check title similarity (more expensive calculation)
    if (this.checkTitleSimilarity(article.title, existing)) {
      return true;
    }

    return false;
  }

  /**
   * Check if an article URL is a duplicate by querying the database
   * 
   * Performs case-insensitive exact URL matching against articles from the last 7 days.
   * This is an optimized version that queries only recent articles from the database.
   * 
   * Requirements: 3.1, 3.2, 3.4
   * 
   * @param url - URL to check
   * @returns Promise<boolean> - true if URL duplicate found, false otherwise
   */
  async checkURLDuplicateFromDB(url: string): Promise<boolean> {
    if (!url) {
      return false;
    }

    try {
      // Query only articles from the last 7 days for optimization
      const recentArticles = await this.getDatabaseService().findRecentArticles(
        this.RECENT_ARTICLES_DAYS
      );

      // Use the existing in-memory check with the recent articles
      return this.checkURLDuplicate(url, recentArticles);
    } catch (error) {
      console.error('[DuplicateDetectorService] Error checking URL duplicate from database:', error);
      // On error, return false to allow the article (fail open)
      // The database unique index will catch true duplicates
      return false;
    }
  }

  /**
   * Check if an article title is similar to any existing article by querying the database
   * 
   * Uses Levenshtein distance to calculate title similarity against articles from the last 7 days.
   * Returns true if similarity exceeds 90% threshold.
   * This is an optimized version that queries only recent articles from the database.
   * 
   * Requirements: 3.3, 3.4
   * 
   * @param title - Title to check
   * @returns Promise<boolean> - true if similar title found (>90% similarity), false otherwise
   */
  async checkTitleSimilarityFromDB(title: string): Promise<boolean> {
    if (!title) {
      return false;
    }

    try {
      // Query only articles from the last 7 days for optimization
      const recentArticles = await this.getDatabaseService().findRecentArticles(
        this.RECENT_ARTICLES_DAYS
      );

      // Use the existing in-memory check with the recent articles
      return this.checkTitleSimilarity(title, recentArticles);
    } catch (error) {
      console.error('[DuplicateDetectorService] Error checking title similarity from database:', error);
      // On error, return false to allow the article (fail open)
      return false;
    }
  }

  /**
   * Check if an article is a duplicate by querying the database
   * 
   * Checks both URL (exact match) and title similarity (>90% threshold) against
   * articles from the last 7 days. Returns true if either check indicates a duplicate.
   * This is an optimized version that queries only recent articles from the database.
   * 
   * Requirements: 3.1, 3.2, 3.3, 3.4
   * 
   * @param article - Article to check
   * @returns Promise<boolean> - true if duplicate found, false otherwise
   */
  async isDuplicateFromDB(article: ProcessedArticle): Promise<boolean> {
    try {
      // Query only articles from the last 7 days for optimization
      const recentArticles = await this.getDatabaseService().findRecentArticles(
        this.RECENT_ARTICLES_DAYS
      );

      // Use the existing in-memory check with the recent articles
      return this.isDuplicate(article, recentArticles);
    } catch (error) {
      console.error('[DuplicateDetectorService] Error checking duplicate from database:', error);
      // On error, return false to allow the article (fail open)
      // The database unique index will catch URL duplicates
      return false;
    }
  }
}
