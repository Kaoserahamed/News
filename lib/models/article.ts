import { Category } from './category';

/**
 * RawArticle represents an article as fetched from an RSS feed
 * before any processing or normalization
 */
export interface RawArticle {
  title: string;
  summary?: string;
  content?: string;
  link: string;
  pubDate: string;
  source: string;
}

/**
 * ProcessedArticle represents an article after content processing,
 * normalization, and categorization
 */
export interface ProcessedArticle {
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: Date;
  processedAt: Date;
}

/**
 * Article represents the complete article data model as stored in the database
 * Includes MongoDB ObjectId and creation timestamp
 */
export interface Article extends ProcessedArticle {
  id: string;           // MongoDB ObjectId as string
  createdAt: Date;      // When stored in database
}

/**
 * Validation rules for Article fields
 */
export const ArticleValidation = {
  MAX_TITLE_LENGTH: 500,
  MAX_SUMMARY_LENGTH: 300,
  MIN_TITLE_LENGTH: 1,
  MIN_SUMMARY_LENGTH: 1,
} as const;
