import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleCard from './ArticleCard';
import { Article } from '@/lib/models/article';
import { Category } from '@/lib/models/category';

/**
 * Unit tests for ArticleCard component
 * 
 * Validates: Requirements 8.1 (responsive design), 8.2 (single column on mobile),
 *            8.3 (grid on desktop), 9.1 (display article details), 9.2 (clickable title),
 *            9.3 (relative date format), 9.4 (display source), 9.5 (category styling)
 * 
 * Tests:
 * - Rendering article with all required fields
 * - Clickable title with correct URL and target
 * - Relative date formatting
 * - Category-specific styling for all categories
 * - Responsive layout classes
 * - Accessibility attributes
 */

describe('ArticleCard Component', () => {
  const mockArticle: Article = {
    id: '507f1f77bcf86cd799439011',
    title: 'Breaking: New Technology Breakthrough',
    summary: 'Scientists have discovered a revolutionary new approach to quantum computing that could change everything.',
    content: 'Full article content here...',
    url: 'https://example.com/article/123',
    source: 'TechCrunch',
    category: Category.TECHNOLOGY,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    processedAt: new Date('2024-01-15T10:05:00Z'),
    createdAt: new Date('2024-01-15T10:05:00Z')
  };

  it('renders article with all required fields', () => {
    render(<ArticleCard article={mockArticle} />);

    // Check title
    expect(screen.getByText('Breaking: New Technology Breakthrough')).toBeInTheDocument();

    // Check summary
    expect(screen.getByText(/Scientists have discovered a revolutionary new approach/)).toBeInTheDocument();

    // Check source
    expect(screen.getByText('TechCrunch')).toBeInTheDocument();

    // Check category badge
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders clickable title that opens in new tab', () => {
    render(<ArticleCard article={mockArticle} />);

    const titleLink = screen.getByRole('link', { name: /read full article/i });
    
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', 'https://example.com/article/123');
    expect(titleLink).toHaveAttribute('target', '_blank');
    expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays publication date in relative format', () => {
    // Create an article published 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentArticle: Article = {
      ...mockArticle,
      publishedAt: twoHoursAgo
    };

    render(<ArticleCard article={recentArticle} />);

    // Check for relative time format (e.g., "2 hours ago")
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('displays absolute date in title attribute for accessibility', () => {
    render(<ArticleCard article={mockArticle} />);

    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toHaveAttribute('title');
    expect(timeElement).toHaveAttribute('dateTime');
  });

  it('applies Technology category styling', () => {
    const techArticle: Article = {
      ...mockArticle,
      category: Category.TECHNOLOGY
    };

    const { container } = render(<ArticleCard article={techArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-blue-500');
    
    const badge = screen.getByText('Technology');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('applies Sports category styling', () => {
    const sportsArticle: Article = {
      ...mockArticle,
      category: Category.SPORTS,
      title: 'Championship Game Results'
    };

    const { container } = render(<ArticleCard article={sportsArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-green-500');
    
    const badge = screen.getByText('Sports');
    expect(badge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('applies Business category styling', () => {
    const businessArticle: Article = {
      ...mockArticle,
      category: Category.BUSINESS,
      title: 'Market Analysis Report'
    };

    const { container } = render(<ArticleCard article={businessArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-purple-500');
    
    const badge = screen.getByText('Business');
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
  });

  it('applies Politics category styling', () => {
    const politicsArticle: Article = {
      ...mockArticle,
      category: Category.POLITICS,
      title: 'Election Update'
    };

    const { container } = render(<ArticleCard article={politicsArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-red-500');
    
    const badge = screen.getByText('Politics');
    expect(badge).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('applies Entertainment category styling', () => {
    const entertainmentArticle: Article = {
      ...mockArticle,
      category: Category.ENTERTAINMENT,
      title: 'Movie Review'
    };

    const { container } = render(<ArticleCard article={entertainmentArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-pink-500');
    
    const badge = screen.getByText('Entertainment');
    expect(badge).toHaveClass('bg-pink-100', 'text-pink-700');
  });

  it('applies General category styling', () => {
    const generalArticle: Article = {
      ...mockArticle,
      category: Category.GENERAL,
      title: 'General News'
    };

    const { container } = render(<ArticleCard article={generalArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('border-l-gray-500');
    
    const badge = screen.getByText('General');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('has responsive padding classes', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const article = container.querySelector('article');
    
    // Check for responsive padding (p-4 sm:p-5 md:p-6)
    expect(article).toHaveClass('p-4', 'sm:p-5', 'md:p-6');
  });

  it('has responsive text sizing', () => {
    render(<ArticleCard article={mockArticle} />);
    
    const titleLink = screen.getByRole('link', { name: /read full article/i });
    expect(titleLink).toHaveClass('text-lg', 'sm:text-xl');
    
    const summary = screen.getByText(/Scientists have discovered/);
    expect(summary).toHaveClass('text-sm', 'sm:text-base');
  });

  it('has proper accessibility attributes', () => {
    render(<ArticleCard article={mockArticle} />);

    // Check article element has aria-label (use exact match to avoid ambiguity)
    const article = screen.getByLabelText('Article: Breaking: New Technology Breakthrough');
    expect(article).toBeInTheDocument();
    expect(article.tagName).toBe('ARTICLE');

    // Check category badge has aria-label
    const categoryBadge = screen.getByLabelText(/category: technology/i);
    expect(categoryBadge).toBeInTheDocument();

    // Check title link has aria-label
    const titleLink = screen.getByRole('link', { name: /read full article/i });
    expect(titleLink).toBeInTheDocument();
  });

  it('truncates long titles with line-clamp', () => {
    const longTitleArticle: Article = {
      ...mockArticle,
      title: 'This is an extremely long title that should be truncated after two lines to prevent the card from becoming too tall and breaking the layout'
    };

    render(<ArticleCard article={longTitleArticle} />);
    
    const titleLink = screen.getByRole('link', { name: /read full article/i });
    expect(titleLink).toHaveClass('line-clamp-2');
  });

  it('truncates long summaries with line-clamp', () => {
    const longSummaryArticle: Article = {
      ...mockArticle,
      summary: 'This is an extremely long summary that should be truncated after three lines to prevent the card from becoming too tall. It contains a lot of text that would normally overflow the card boundaries and make the layout look inconsistent across different articles.'
    };

    const { container } = render(<ArticleCard article={longSummaryArticle} />);
    
    const summary = container.querySelector('.line-clamp-3');
    expect(summary).toBeInTheDocument();
  });

  it('displays source with icon', () => {
    render(<ArticleCard article={mockArticle} />);

    const source = screen.getByText('TechCrunch');
    expect(source).toBeInTheDocument();
    expect(source).toHaveClass('font-medium', 'truncate');
    expect(source).toHaveAttribute('title', 'TechCrunch');
  });

  it('has hover effects', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const article = container.querySelector('article');
    
    expect(article).toHaveClass('hover:shadow-lg', 'hover:border-l-blue-600');
    expect(article).toHaveClass('transition-all', 'duration-200');
  });

  it('uses flexbox for responsive metadata layout', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    
    // Find the metadata container (has both source and date)
    const metadataContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(metadataContainer).toBeInTheDocument();
    expect(metadataContainer).toHaveClass('sm:items-center', 'sm:justify-between');
  });

  it('handles articles with very recent publication dates', () => {
    const justNow = new Date(Date.now() - 30000); // 30 seconds ago
    const recentArticle: Article = {
      ...mockArticle,
      publishedAt: justNow
    };

    render(<ArticleCard article={recentArticle} />);

    // Should show "less than a minute ago" or similar
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('handles articles with old publication dates', () => {
    const longAgo = new Date('2023-01-01T00:00:00Z');
    const oldArticle: Article = {
      ...mockArticle,
      publishedAt: longAgo
    };

    render(<ArticleCard article={oldArticle} />);

    // Should show relative date like "over 1 year ago"
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('renders with proper semantic HTML structure', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);

    // Should use <article> element
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();

    // Should use <h2> for title
    const heading = container.querySelector('h2');
    expect(heading).toBeInTheDocument();

    // Should use <time> element for date
    const time = container.querySelector('time');
    expect(time).toBeInTheDocument();
  });
});
