import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from './SearchBar';

/**
 * Unit tests for SearchBar component
 * 
 * Tests:
 * - Rendering with default props
 * - Rendering with custom props
 * - Immediate input value updates
 * - Debounced search callback (300ms delay)
 * - Clear button functionality
 * - Accessibility attributes
 */

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders with default placeholder', () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const mockOnSearchChange = jest.fn();
    render(
      <SearchBar 
        onSearchChange={mockOnSearchChange} 
        placeholder="Custom placeholder"
      />
    );
    
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    const mockOnSearchChange = jest.fn();
    render(
      <SearchBar 
        onSearchChange={mockOnSearchChange} 
        initialValue="test query"
      />
    );
    
    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('updates input value immediately on user input', () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    fireEvent.change(input, { target: { value: 'technology' } });
    
    expect(input).toHaveValue('technology');
  });

  it('calls onSearchChange after 300ms debounce delay', async () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    
    // Type in the input
    fireEvent.change(input, { target: { value: 'sports' } });
    
    // Should not be called immediately
    expect(mockOnSearchChange).not.toHaveBeenCalled();
    
    // Fast-forward time by 300ms
    jest.advanceTimersByTime(300);
    
    // Should be called after debounce delay
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('sports');
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    });
  });

  it('resets debounce timer on rapid typing', async () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    
    // Type first character
    fireEvent.change(input, { target: { value: 't' } });
    jest.advanceTimersByTime(100);
    
    // Type second character before 300ms
    fireEvent.change(input, { target: { value: 'te' } });
    jest.advanceTimersByTime(100);
    
    // Type third character before 300ms
    fireEvent.change(input, { target: { value: 'tec' } });
    jest.advanceTimersByTime(100);
    
    // Should not be called yet (only 300ms total, but timer resets each time)
    expect(mockOnSearchChange).not.toHaveBeenCalled();
    
    // Wait another 300ms from last input
    jest.advanceTimersByTime(300);
    
    // Should be called once with final value
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('tec');
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    });
  });

  it('shows clear button when input has value', () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    
    // Clear button should not be visible initially
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
    
    // Type in the input
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Clear button should now be visible
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    
    // Type in the input
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input).toHaveValue('test query');
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    
    // Input should be cleared
    expect(input).toHaveValue('');
    
    // Wait for debounce
    jest.advanceTimersByTime(300);
    
    // Should call onSearchChange with empty string
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });

  it('has proper accessibility attributes', () => {
    const mockOnSearchChange = jest.fn();
    render(<SearchBar onSearchChange={mockOnSearchChange} />);
    
    const input = screen.getByRole('textbox', { name: /search articles/i });
    expect(input).toHaveAttribute('aria-label', 'Search articles');
    
    // Type to show clear button
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
  });

  it('calls onSearchChange with initial value on mount', async () => {
    const mockOnSearchChange = jest.fn();
    render(
      <SearchBar 
        onSearchChange={mockOnSearchChange} 
        initialValue="initial search"
      />
    );
    
    // Fast-forward time by 300ms
    jest.advanceTimersByTime(300);
    
    // Should be called with initial value after debounce
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('initial search');
    });
  });
});
