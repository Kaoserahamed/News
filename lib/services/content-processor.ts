import { RawArticle, ProcessedArticle, ArticleValidation } from '../models/article';
import { Category } from '../models/category';
import { categorizeArticle } from '../utils/categorization';

/**
 * ContentProcessorService handles cleaning, normalizing, and processing
 * raw news articles into structured, consistent format
 */
export class ContentProcessorService {
  /**
   * Clean HTML tags from text using regex
   * Removes all HTML tags and decodes common HTML entities
   * 
   * @param html - Text potentially containing HTML tags
   * @returns Plain text with HTML removed
   */
  cleanHTML(html: string): string {
    if (!html) {
      return '';
    }

    // Remove HTML tags
    let cleaned = html.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '...',
    };

    for (const [entity, char] of Object.entries(entities)) {
      cleaned = cleaned.replace(new RegExp(entity, 'g'), char);
    }

    // Decode numeric HTML entities (e.g., &#8217;)
    cleaned = cleaned.replace(/&#(\d+);/g, (_match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    // Decode hex HTML entities (e.g., &#x2019;)
    cleaned = cleaned.replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return cleaned;
  }

  /**
   * Normalize whitespace in text
   * Replaces multiple spaces, tabs, and newlines with single space
   * Trims leading and trailing whitespace
   * 
   * @param text - Text with potentially irregular whitespace
   * @returns Text with normalized whitespace
   */
  normalizeWhitespace(text: string): string {
    if (!text) {
      return '';
    }

    // Replace multiple whitespace characters (spaces, tabs, newlines) with single space
    let normalized = text.replace(/\s+/g, ' ');

    // Trim leading and trailing whitespace
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * Truncate text at word boundaries to specified maximum length
   * Preserves complete words and adds ellipsis if truncated
   * 
   * @param text - Text to truncate
   * @param maxLength - Maximum length (default: 300 characters)
   * @returns Truncated text with ellipsis if needed
   */
  truncateSummary(text: string, maxLength: number = ArticleValidation.MAX_SUMMARY_LENGTH): string {
    if (!text) {
      return '';
    }

    // If text is already within limit, return as-is
    if (text.length <= maxLength) {
      return text;
    }

    // Find the last space before maxLength to truncate at word boundary
    // Reserve 3 characters for ellipsis
    const truncateAt = maxLength - 3;
    let lastSpace = text.lastIndexOf(' ', truncateAt);

    // If no space found (single long word), truncate at maxLength
    if (lastSpace === -1) {
      lastSpace = truncateAt;
    }

    // Truncate and add ellipsis
    return text.substring(0, lastSpace).trim() + '...';
  }

  /**
   * Parse date string to Date object
   * Handles various date formats including ISO 8601, RFC 2822, and common formats
   * 
   * @param dateString - Date string in various formats
   * @returns Date object, or current date if parsing fails
   */
  parseDate(dateString: string): Date {
    if (!dateString) {
      return new Date();
    }

    // Try parsing as-is (handles ISO 8601, RFC 2822, and many common formats)
    const parsed = new Date(dateString);

    // Check if date is valid
    if (!isNaN(parsed.getTime())) {
      // Ensure date is not in the future
      const now = new Date();
      if (parsed > now) {
        return now;
      }
      return parsed;
    }

    // If parsing failed, return current date as fallback
    return new Date();
  }

  /**
   * Categorize article based on content analysis
   * Delegates to the categorization utility function
   * 
   * @param article - Raw article to categorize
   * @returns Category enum value
   */
  categorizeArticle(article: RawArticle): Category {
    return categorizeArticle(article);
  }

  /**
   * Process a raw article into a structured, normalized format
   * Orchestrates all processing steps: cleaning, normalization, categorization
   * 
   * @param raw - Raw article from RSS feed
   * @returns Processed article ready for storage
   */
  processArticle(raw: RawArticle): ProcessedArticle {
    // Clean and normalize title
    const title = this.normalizeWhitespace(
      this.cleanHTML(raw.title || '')
    );

    // Clean and normalize summary
    // Use summary if available, otherwise use content, otherwise empty string
    const rawSummary = raw.summary || raw.content || '';
    const cleanedSummary = this.cleanHTML(rawSummary);
    const normalizedSummary = this.normalizeWhitespace(cleanedSummary);
    const summary = this.truncateSummary(normalizedSummary);

    // Clean and normalize content
    const content = this.normalizeWhitespace(
      this.cleanHTML(raw.content || raw.summary || '')
    );

    // Parse publication date
    const publishedAt = this.parseDate(raw.pubDate);

    // Categorize article
    const category = this.categorizeArticle(raw);

    // Create processed article
    const processed: ProcessedArticle = {
      title,
      summary,
      content,
      url: raw.link,
      source: raw.source,
      category,
      publishedAt,
      processedAt: new Date(),
    };

    return processed;
  }
}
