import { Category } from './category';

/**
 * RSSSource represents a single RSS feed source configuration
 */
export interface RSSSource {
  id: string;           // Unique identifier for the source
  name: string;         // Display name of the source
  url: string;          // RSS feed URL
  category: Category;   // Default category for articles from this source
  enabled: boolean;     // Whether to fetch from this source
}

/**
 * RSSSourceConfig represents the complete configuration
 * containing all RSS feed sources
 */
export interface RSSSourceConfig {
  sources: RSSSource[];
}

/**
 * Validation helper to check if an RSS source is valid
 */
export function isValidRSSSource(source: any): source is RSSSource {
  return (
    typeof source === 'object' &&
    source !== null &&
    typeof source.id === 'string' &&
    source.id.length > 0 &&
    typeof source.name === 'string' &&
    source.name.length > 0 &&
    typeof source.url === 'string' &&
    source.url.length > 0 &&
    typeof source.category === 'string' &&
    typeof source.enabled === 'boolean'
  );
}
