# Pagination Component

## Overview

The Pagination component provides navigation controls for paginated content with support for both manual pagination (Previous/Next buttons and page numbers) and automatic infinite scroll functionality.

## Features

### 1. Previous/Next Buttons
- **Previous Button**: Navigates to the previous page
  - Disabled on the first page (visual indication with gray styling)
  - Includes left arrow icon
  
- **Next Button**: Navigates to the next page
  - Disabled on the last page (visual indication with gray styling)
  - Includes right arrow icon

### 2. Page Numbers
- Displays up to 5 page numbers at a time
- Smart positioning around the current page:
  - Shows pages 1-5 when near the beginning
  - Shows last 5 pages when near the end
  - Shows current page ± 2 pages when in the middle
- Shows ellipsis (...) when there are gaps
- Always shows first and last page numbers when applicable
- Current page is highlighted with blue background

### 3. Disabled States
- Previous button is disabled on page 1
- Next button is disabled on the last page
- Disabled buttons have:
  - Gray background and text
  - Reduced opacity
  - Cursor not-allowed
  - No hover effects

### 4. Infinite Scroll
- Automatically loads the next page when user scrolls near the bottom
- Triggers when within 200px of the bottom
- Throttled to prevent excessive API calls (200ms delay)
- Respects loading state to prevent duplicate requests
- Only triggers when not on the last page
- Can be disabled via `enableInfiniteScroll` prop

### 5. App State Integration
- Updates app state via `onPageChange` callback
- Receives current page and total pages from parent
- Scrolls to top when page changes via button clicks
- Respects loading state from parent component

## Props

```typescript
interface PaginationProps {
  currentPage: number;           // Current page number (1-indexed)
  totalPages: number;            // Total number of pages available
  onPageChange: (page: number) => void;  // Callback when page changes
  enableInfiniteScroll?: boolean;  // Enable infinite scroll (default: true)
  loading?: boolean;             // Loading state (default: false)
}
```

## Usage

```tsx
import Pagination from '@/components/Pagination';

<Pagination
  currentPage={state.pagination.page}
  totalPages={state.pagination.totalPages}
  onPageChange={handlePageChange}
  loading={state.loading}
  enableInfiniteScroll={true}
/>
```

## Styling

- Consistent with other components (Header, SearchBar, CategoryFilter)
- Uses Tailwind CSS for responsive design
- Blue color scheme for active states
- Gray color scheme for disabled states
- Smooth transitions on hover and focus
- Focus rings for accessibility

## Accessibility

- Semantic `<nav>` element with `aria-label="Pagination navigation"`
- Descriptive `aria-label` on all buttons
- `aria-current="page"` on current page button
- `aria-disabled` on disabled buttons
- Keyboard navigable (all buttons are focusable)
- Focus indicators (blue ring)

## Requirements Validated

- **Requirement 5.2**: Pagination parameter support (20 articles per page)
- **Requirement 8.5**: Infinite scroll (automatically load next page when scrolling to bottom)

## Implementation Details

### Infinite Scroll Algorithm
1. Listen to window scroll events (throttled to 200ms)
2. Calculate distance from bottom: `scrollHeight - (scrollTop + clientHeight)`
3. If distance < 200px and not loading and not on last page:
   - Trigger `onPageChange(currentPage + 1)`
4. Parent component handles the actual data fetching

### Page Number Display Algorithm
- If total pages ≤ 5: Show all pages
- If current page ≤ 3: Show pages 1-5
- If current page ≥ totalPages - 2: Show last 5 pages
- Otherwise: Show current page ± 2 pages
- Add ellipsis and first/last page buttons when needed

### Performance Optimizations
- Uses `useCallback` for event handlers to prevent unnecessary re-renders
- Uses `useRef` to track loading state without causing re-renders
- Throttles scroll events to reduce CPU usage
- Cleans up event listeners on unmount

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- React Hooks
- Tailwind CSS
- Window scroll events

## Notes

- Component returns `null` if `totalPages <= 1` (no pagination needed)
- Scroll-to-top behavior only triggers on button clicks, not infinite scroll
- Infinite scroll can be disabled by setting `enableInfiniteScroll={false}`
