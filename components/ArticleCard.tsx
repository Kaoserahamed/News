import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '@/lib/models/article';
import { Category } from '@/lib/models/category';

/**
 * ArticleCard component for the Automated News Aggregation Web Application
 * 
 * Displays a single article with title, summary, source, publication date (relative format),
 * and category. The title is clickable and opens the original article in a new tab.
 * Applies category-specific styling and implements responsive layout.
 * 
 * Validates: Requirements 8.1 (responsive design), 8.2 (single column on mobile),
 *            8.3 (grid on desktop), 9.1 (display article details), 9.2 (clickable title),
 *            9.3 (relative date format), 9.4 (display source), 9.5 (category styling)
 */

interface ArticleCardProps {
  /**
   * The article to display
   * Note: title and summary can be React nodes to support highlighted text
   */
  article: Article | (Omit<Article, 'title' | 'summary'> & { title: React.ReactNode; summary: React.ReactNode });
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Format the publication date as relative time (e.g., "2 hours ago")
  const relativeDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
  
  // Extract plain text for aria-label (in case title/summary are React nodes)
  const plainTitle = typeof article.title === 'string' ? article.title : article.url;
  
  // Get category-specific styling classes
  const getCategoryClasses = (category: Category): { border: string; badge: string; hover: string } => {
    const classMap: Record<Category, { border: string; badge: string; hover: string }> = {
      [Category.TECHNOLOGY]: {
        border: 'border-l-blue-500',
        badge: 'bg-blue-100 text-blue-700',
        hover: 'hover:border-l-blue-600'
      },
      [Category.SPORTS]: {
        border: 'border-l-green-500',
        badge: 'bg-green-100 text-green-700',
        hover: 'hover:border-l-green-600'
      },
      [Category.BUSINESS]: {
        border: 'border-l-purple-500',
        badge: 'bg-purple-100 text-purple-700',
        hover: 'hover:border-l-purple-600'
      },
      [Category.POLITICS]: {
        border: 'border-l-red-500',
        badge: 'bg-red-100 text-red-700',
        hover: 'hover:border-l-red-600'
      },
      [Category.ENTERTAINMENT]: {
        border: 'border-l-pink-500',
        badge: 'bg-pink-100 text-pink-700',
        hover: 'hover:border-l-pink-600'
      },
      [Category.GENERAL]: {
        border: 'border-l-gray-500',
        badge: 'bg-gray-100 text-gray-700',
        hover: 'hover:border-l-gray-600'
      }
    };
    
    return classMap[category];
  };
  
  const categoryStyles = getCategoryClasses(article.category);
  
  return (
    <article
      className={`
        bg-white rounded-lg shadow-md border-l-4 ${categoryStyles.border}
        ${categoryStyles.hover}
        transition-all duration-200 hover:shadow-lg
        p-4 sm:p-5 md:p-6
        flex flex-col h-full
      `}
      aria-label={`Article: ${plainTitle}`}
    >
      {/* Category Badge */}
      <div className="mb-3">
        <span
          className={`
            inline-block px-2 py-1 text-xs font-semibold rounded-full
            ${categoryStyles.badge}
          `}
          aria-label={`Category: ${article.category}`}
        >
          {article.category}
        </span>
      </div>
      
      {/* Article Title - Clickable */}
      <h2 className="mb-3">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 
                     transition-colors duration-200 line-clamp-2"
          aria-label={`Read full article: ${plainTitle}`}
        >
          {article.title}
        </a>
      </h2>
      
      {/* Article Summary */}
      <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-3 flex-grow">
        {article.summary}
      </p>
      
      {/* Article Metadata - Source and Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
                      gap-2 sm:gap-4 pt-3 border-t border-gray-200 mt-auto">
        {/* Source */}
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium truncate" title={article.source}>
            {article.source}
          </span>
        </div>
        
        {/* Publication Date (Relative) */}
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <time
            dateTime={new Date(article.publishedAt).toISOString()}
            title={new Date(article.publishedAt).toLocaleString()}
          >
            {relativeDate}
          </time>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
