import React from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '@/lib/models/article';

/**
 * ArticleList component for the Automated News Aggregation Web Application
 * 
 * Renders an array of ArticleCard components with support for loading states,
 * empty states, and search term highlighting in titles and summaries.
 * 
 * Validates: Requirements 6.3 (highlight search terms), 6.4 (no articles message),
 *            9.1 (display article details)
 */

interface ArticleListProps {
  /**
   * Array of articles to display
   */
  articles: Article[];
  
  /**
   * Loading state - shows spinner when true
   */
  loading: boolean;
  
  /**
   * Optional search term to highlight in titles and summaries
   */
  searchTerm?: string;
}

/**
 * Highlights search terms in text by wrapping them in a <mark> element
 * Case-insensitive matching
 */
const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !searchTerm.trim()) {
    return text;
  }

  // Escape special regex characters in search term
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  // Split text by search term matches
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        if (part.toLowerCase() === searchTerm.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

const ArticleList: React.FC<ArticleListProps> = ({ articles, loading, searchTerm }) => {
  // Loading state - show spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" aria-hidden="true"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading articles...</p>
      </div>
    );
  }

  // Empty state - no articles found
  if (articles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16" role="status" aria-live="polite">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">No articles found</h3>
        <p className="mt-2 text-gray-600">
          {searchTerm
            ? 'Try adjusting your search criteria'
            : 'No articles are available at the moment'}
        </p>
      </div>
    );
  }

  // Articles display - render grid of ArticleCard components
  // Responsive layout:
  // - Mobile (< 768px): Single column (Requirement 8.2)
  // - Tablet (768px - 1023px): Two columns
  // - Desktop (>= 1024px): Three columns (Requirement 8.3)
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      role="feed"
      aria-busy={loading}
      aria-label="News articles"
    >
      {articles.map((article) => {
        // Create a modified article with highlighted text if search term exists
        const displayArticle = searchTerm
          ? {
              ...article,
              title: highlightText(article.title, searchTerm) as any,
              summary: highlightText(article.summary, searchTerm) as any,
            }
          : article;

        return <ArticleCard key={article.id} article={displayArticle} />;
      })}
    </div>
  );
};

export default ArticleList;
