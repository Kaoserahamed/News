/**
 * Responsive Design Tests
 * 
 * Tests for Requirements 8.1, 8.2, 8.3:
 * - 8.1: Render correctly on screen widths from 320px to 2560px
 * - 8.2: Single column layout on mobile (width < 768px)
 * - 8.3: Multi-column grid layout on desktop (width >= 1024px)
 */

import { render, screen } from '@testing-library/react';
import ArticleList from '@/components/ArticleList';
import ArticleCard from '@/components/ArticleCard';
import { Category } from '@/lib/models/category';
import { Article } from '@/lib/models/article';

// Mock article data
const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  summary: 'This is a test article summary',
  content: 'Full content',
  url: 'https://example.com/article',
  source: 'Test Source',
  category: Category.TECHNOLOGY,
  publishedAt: new Date(),
  processedAt: new Date(),
  createdAt: new Date(),
};

const mockArticles: Article[] = [
  { ...mockArticle, id: '1', title: 'Article 1' },
  { ...mockArticle, id: '2', title: 'Article 2' },
  { ...mockArticle, id: '3', title: 'Article 3' },
];

describe('Responsive Design - ArticleList', () => {
  it('should have responsive grid classes for mobile, tablet, and desktop', () => {
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    expect(gridContainer).toBeInTheDocument();

    // Check for responsive grid classes
    // grid-cols-1: Mobile (default, < 768px) - Requirement 8.2
    // md:grid-cols-2: Tablet (768px - 1023px)
    // lg:grid-cols-3: Desktop (>= 1024px) - Requirement 8.3
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1'); // Mobile: single column
    expect(gridContainer).toHaveClass('md:grid-cols-2'); // Tablet: two columns
    expect(gridContainer).toHaveClass('lg:grid-cols-3'); // Desktop: three columns
  });

  it('should render all articles in the grid', () => {
    render(<ArticleList articles={mockArticles} loading={false} />);

    expect(screen.getByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Article 2')).toBeInTheDocument();
    expect(screen.getByText('Article 3')).toBeInTheDocument();
  });
});

describe('Responsive Design - ArticleCard', () => {
  it('should have responsive padding classes', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);

    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();

    // Check for responsive padding: p-4 sm:p-5 md:p-6
    expect(article).toHaveClass('p-4'); // Base padding
    expect(article).toHaveClass('sm:p-5'); // Small screens
    expect(article).toHaveClass('md:p-6'); // Medium screens and up
  });

  it('should have responsive text sizing', () => {
    render(<ArticleCard article={mockArticle} />);

    const titleLink = screen.getByRole('link', { name: /Read full article/i });
    
    // Check for responsive text classes: text-lg sm:text-xl
    expect(titleLink).toHaveClass('text-lg'); // Base size
    expect(titleLink).toHaveClass('sm:text-xl'); // Small screens and up
  });

  it('should have responsive metadata layout', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);

    // Find the metadata container (contains source and date)
    const metadataContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(metadataContainer).toBeInTheDocument();

    // Check for responsive flex direction
    expect(metadataContainer).toHaveClass('flex-col'); // Mobile: vertical stack
    expect(metadataContainer).toHaveClass('sm:flex-row'); // Small screens: horizontal
  });
});

describe('Responsive Design - Breakpoint Coverage', () => {
  it('should support minimum width of 320px (Requirement 8.1)', () => {
    // This test verifies that components use relative units and don't have fixed widths
    // that would break at 320px
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    
    // Grid should use grid-cols-1 by default (mobile-first)
    expect(gridContainer).toHaveClass('grid-cols-1');
    
    // Gap should be responsive: gap-4 sm:gap-6
    expect(gridContainer).toHaveClass('gap-4');
    expect(gridContainer).toHaveClass('sm:gap-6');
  });

  it('should support maximum width of 2560px (Requirement 8.1)', () => {
    // Components should use container classes and max-width constraints
    // to ensure proper layout at very large screen sizes
    
    // ArticleList uses a grid that will scale appropriately
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    
    // At desktop sizes (lg:), should show 3 columns
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
    
    // This ensures content doesn't stretch infinitely on large screens
  });
});

describe('Responsive Design - Layout Behavior', () => {
  it('should display single column on mobile (< 768px) - Requirement 8.2', () => {
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    
    // Default (mobile) should be single column
    expect(gridContainer).toHaveClass('grid-cols-1');
  });

  it('should display multi-column grid on desktop (>= 1024px) - Requirement 8.3', () => {
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    
    // Desktop (lg:) should be three columns
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
  });

  it('should have responsive gap spacing', () => {
    const { container } = render(
      <ArticleList articles={mockArticles} loading={false} />
    );

    const gridContainer = container.querySelector('[role="feed"]');
    
    // Gap should be smaller on mobile, larger on desktop
    expect(gridContainer).toHaveClass('gap-4'); // Mobile: 1rem (16px)
    expect(gridContainer).toHaveClass('sm:gap-6'); // Desktop: 1.5rem (24px)
  });
});

describe('Responsive Design - Component Flexibility', () => {
  it('should use flexible width classes', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);

    const article = container.querySelector('article');
    
    // Should use flex layout for internal structure
    expect(article).toHaveClass('flex');
    expect(article).toHaveClass('flex-col');
    expect(article).toHaveClass('h-full');
  });

  it('should handle text overflow responsively', () => {
    render(<ArticleCard article={mockArticle} />);

    const titleLink = screen.getByRole('link', { name: /Read full article/i });
    
    // Should use line-clamp for text truncation
    expect(titleLink).toHaveClass('line-clamp-2');
  });

  it('should have responsive icon sizes', () => {
    const { container } = render(<ArticleCard article={mockArticle} />);

    // Find SVG icons in the metadata section
    const icons = container.querySelectorAll('svg');
    
    // Icons should have consistent sizing
    icons.forEach(icon => {
      expect(icon).toHaveClass('w-4');
      expect(icon).toHaveClass('h-4');
    });
  });
});
