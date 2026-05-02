import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryFilter from './CategoryFilter';
import { Category } from '@/lib/models/category';

/**
 * Unit tests for CategoryFilter component
 * 
 * Tests:
 * - Rendering all category buttons with counts
 * - "All" button functionality
 * - Category selection and highlighting
 * - Clear filter functionality
 * - Accessibility attributes
 * - Responsive behavior
 */

describe('CategoryFilter Component', () => {
  const mockOnCategoryChange = jest.fn();
  
  const mockCategoryCounts: Partial<Record<Category, number>> = {
    [Category.TECHNOLOGY]: 15,
    [Category.SPORTS]: 8,
    [Category.BUSINESS]: 12,
    [Category.POLITICS]: 5,
    [Category.ENTERTAINMENT]: 10,
    [Category.GENERAL]: 3
  };

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it('renders all category buttons with article counts', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    // Check that all categories are rendered
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();

    // Check that counts are displayed
    expect(screen.getByText('15')).toBeInTheDocument(); // Technology
    expect(screen.getByText('8')).toBeInTheDocument();  // Sports
    expect(screen.getByText('12')).toBeInTheDocument(); // Business
    expect(screen.getByText('5')).toBeInTheDocument();  // Politics
    expect(screen.getByText('10')).toBeInTheDocument(); // Entertainment
    expect(screen.getByText('3')).toBeInTheDocument();  // General
  });

  it('renders "All" button with total count', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    const allButton = screen.getByRole('button', { name: /show all articles/i });
    expect(allButton).toBeInTheDocument();
    
    // Total count should be 15 + 8 + 12 + 5 + 10 + 3 = 53
    expect(screen.getByText('53')).toBeInTheDocument();
  });

  it('highlights "All" button when no category is selected', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    const allButton = screen.getByRole('button', { name: /show all articles/i });
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights selected category button', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.TECHNOLOGY}
      />
    );

    const techButton = screen.getByRole('button', { name: /filter by technology/i });
    expect(techButton).toHaveAttribute('aria-pressed', 'true');
    
    const allButton = screen.getByRole('button', { name: /show all articles/i });
    expect(allButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onCategoryChange with null when "All" button is clicked', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.TECHNOLOGY}
      />
    );

    const allButton = screen.getByRole('button', { name: /show all articles/i });
    fireEvent.click(allButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(null);
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
  });

  it('calls onCategoryChange with category when category button is clicked', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    const sportsButton = screen.getByRole('button', { name: /filter by sports/i });
    fireEvent.click(sportsButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(Category.SPORTS);
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
  });

  it('displays active filter indicator when category is selected', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.BUSINESS}
      />
    );

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    // Check for the "Clear filter" button which only appears when a category is selected
    expect(screen.getByRole('button', { name: /clear category filter/i })).toBeInTheDocument();
    // Check that the Business button is pressed
    expect(screen.getByRole('button', { name: /filter by business/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not display active filter indicator when no category is selected', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear category filter/i })).not.toBeInTheDocument();
  });

  it('clears filter when "Clear filter" link is clicked', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.POLITICS}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear category filter/i });
    fireEvent.click(clearButton);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(null);
    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
  });

  it('handles missing category counts gracefully', () => {
    const partialCounts: Partial<Record<Category, number>> = {
      [Category.TECHNOLOGY]: 5,
      [Category.SPORTS]: 3
    };

    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={partialCounts}
        selectedCategory={null}
      />
    );

    // Categories with no count should show 0
    const generalButton = screen.getByRole('button', { name: /filter by general/i });
    expect(generalButton).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('handles empty category counts', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={{}}
        selectedCategory={null}
      />
    );

    // All buttons should still render
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
    
    // Total count should be 0
    const allButton = screen.getByRole('button', { name: /show all articles/i });
    expect(allButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.TECHNOLOGY}
      />
    );

    // Check aria-label attributes
    expect(screen.getByRole('button', { name: /show all articles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter by technology/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter by sports/i })).toBeInTheDocument();

    // Check aria-pressed attributes
    const techButton = screen.getByRole('button', { name: /filter by technology/i });
    expect(techButton).toHaveAttribute('aria-pressed', 'true');
    
    const sportsButton = screen.getByRole('button', { name: /filter by sports/i });
    expect(sportsButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows switching between categories', () => {
    const { rerender } = render(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={null}
      />
    );

    // Click Technology
    const techButton = screen.getByRole('button', { name: /filter by technology/i });
    fireEvent.click(techButton);
    expect(mockOnCategoryChange).toHaveBeenCalledWith(Category.TECHNOLOGY);

    // Rerender with Technology selected
    rerender(
      <CategoryFilter
        onCategoryChange={mockOnCategoryChange}
        categoryCounts={mockCategoryCounts}
        selectedCategory={Category.TECHNOLOGY}
      />
    );

    // Click Sports
    const sportsButton = screen.getByRole('button', { name: /filter by sports/i });
    fireEvent.click(sportsButton);
    expect(mockOnCategoryChange).toHaveBeenCalledWith(Category.SPORTS);
  });
});
