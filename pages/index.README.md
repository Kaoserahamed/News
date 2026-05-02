# Main Page Implementation

## Overview

The main page (`/pages/index.tsx`) is the primary entry point for the Automated News Aggregation Web Application. It integrates all frontend components and manages the application state for articles, loading states, errors, pagination, and filters.

## Features Implemented

### 1. State Management
- **Articles**: Array of fetched articles
- **Loading**: Boolean flag for loading state
- **Error**: Error message string (null when no error)
- **Pagination**: Current page, total pages, total articles, and limit
- **Filters**: Category filter and search term
- **Category Counts**: Article counts per category for the filter component

### 2. API Integration
- Fetches articles from `/api/articles` endpoint
- Supports query parameters:
  - `page`: Current page number
  - `limit`: Articles per page (default: 20)
  - `category`: Filter by category (optional)
  - `search`: Search term for title/summary (optional)
- Implements 10-second timeout for API requests
- Handles error responses (400, 503, timeout)

### 3. Component Integration
- **Header**: Application logo and title
- **SearchBar**: Debounced search input (300ms delay)
- **CategoryFilter**: Category buttons with article counts
- **Article Display**: Temporary grid layout (will be replaced with ArticleList component)
- **Pagination**: Previous/Next buttons with page numbers

### 4. Responsive Design
- Uses Tailwind CSS for responsive layouts
- Mobile-first approach with breakpoints:
  - Mobile: Single column (< 768px)
  - Tablet: Two columns (768px - 1023px)
  - Desktop: Three columns (≥ 1024px)

### 5. User Experience Features
- **Loading State**: Animated spinner with message
- **Error State**: Error message with retry button
- **Empty State**: Message when no articles found, with clear filters button
- **Smooth Scrolling**: Scrolls to top when page changes
- **Article Count Display**: Shows current range and total articles

### 6. Error Handling
- Network errors: Connection failure message
- Timeout errors: Request timeout message
- Server errors: Service unavailable message (503)
- Invalid parameters: Displays error message from API (400)
- Retry functionality: Allows users to retry failed requests

## Requirements Validated

- **Requirement 8.1**: Responsive UI that renders correctly on screen widths from 320px to 2560px
- **Requirement 8.4**: Page loads and displays initial articles within 2 seconds on standard broadband connection

## State Flow

1. **Initial Load**:
   - Component mounts
   - `fetchArticles()` is called via `useEffect`
   - `fetchCategoryCounts()` is called via `useEffect`
   - Loading state is displayed
   - Articles are fetched and displayed

2. **Search**:
   - User types in SearchBar
   - After 300ms debounce, `handleSearchChange()` is called
   - Search term is updated in state
   - Page is reset to 1
   - `fetchArticles()` is triggered via `useEffect`

3. **Category Filter**:
   - User clicks category button
   - `handleCategoryChange()` is called
   - Category is updated in state
   - Page is reset to 1
   - `fetchArticles()` is triggered via `useEffect`

4. **Pagination**:
   - User clicks page button
   - `handlePageChange()` is called
   - Page number is updated in state
   - `fetchArticles()` is triggered via `useEffect`
   - Page scrolls to top

## Testing

Unit tests are provided in `pages/index.test.tsx`:
- ✅ Renders main page structure
- ✅ Displays loading state initially
- ✅ Displays error state when fetch fails
- ✅ Displays empty state when no articles found
- ✅ Fetches articles with correct query parameters

## Future Enhancements

The following components will be added in subsequent tasks:
- **ArticleList**: Dedicated component for rendering article cards
- **ArticleCard**: Individual article display with category-specific styling
- **Pagination**: Dedicated pagination component with infinite scroll
- **ErrorBoundary**: React error boundary for catching component errors

## Dependencies

- React 18
- Next.js 14
- Tailwind CSS
- TypeScript

## Notes

- The current implementation includes a temporary article display grid that will be replaced with dedicated ArticleList and ArticleCard components in tasks 12.2 and 12.3
- Category counts are fetched separately and may not reflect the current filter state (this is intentional to show total counts per category)
- The pagination component is inline and will be extracted to a separate component in task 13.1
