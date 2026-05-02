# SearchBar Component Usage Guide

## Overview

The `SearchBar` component provides a search input field with debounced search functionality. It implements a 300ms delay before triggering the search callback to reduce unnecessary API calls while the user is typing.

## Features

- ✅ Debounced search with 300ms delay
- ✅ Clear button to reset search
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible with proper ARIA labels
- ✅ Visual feedback with search icon
- ✅ Customizable placeholder text
- ✅ Support for initial search value

## Requirements Validated

- **Requirement 6.1**: WHEN a user submits a search query, THE Frontend_Interface SHALL send the query to the Backend_API
- **Requirement 6.5**: THE Backend_API SHALL return search results within 500 milliseconds for queries on datasets up to 10000 articles

## Basic Usage

```tsx
import SearchBar from '../components/SearchBar';

function MyComponent() {
  const handleSearchChange = (query: string) => {
    // This callback is triggered after 300ms of user inactivity
    console.log('Search query:', query);
    // Fetch articles from API with the search query
  };

  return (
    <SearchBar onSearchChange={handleSearchChange} />
  );
}
```

## Integration with App State

```tsx
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';

function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch articles when search query changes
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/articles?search=${encodeURIComponent(searchQuery)}&page=1&limit=20`
        );
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery]);

  return (
    <div>
      <SearchBar onSearchChange={setSearchQuery} />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {articles.map(article => (
            <div key={article.id}>{article.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Props

### `onSearchChange` (required)

- **Type**: `(query: string) => void`
- **Description**: Callback function triggered when the search query changes (after debounce delay)
- **Example**: `onSearchChange={(query) => console.log(query)}`

### `placeholder` (optional)

- **Type**: `string`
- **Default**: `"Search articles..."`
- **Description**: Placeholder text displayed in the search input
- **Example**: `placeholder="Search by title or keyword..."`

### `initialValue` (optional)

- **Type**: `string`
- **Default**: `""`
- **Description**: Initial search value to populate the input field
- **Example**: `initialValue="technology"`

## Debounce Behavior

The SearchBar implements a 300ms debounce delay:

1. User types in the input field
2. Input value updates immediately (visual feedback)
3. Timer starts counting down from 300ms
4. If user types again, timer resets to 300ms
5. After 300ms of inactivity, `onSearchChange` callback is triggered

This behavior:
- Reduces API calls (only triggers after user stops typing)
- Improves performance
- Provides better user experience
- Meets the 500ms response time requirement (6.5)

## Styling

The component uses Tailwind CSS classes and is fully responsive:

- **Mobile (< 640px)**: Full width with smaller text
- **Tablet (640px - 1024px)**: Medium text size
- **Desktop (> 1024px)**: Larger text size

The component includes:
- Search icon on the left
- Clear button on the right (when input has text)
- Focus ring for accessibility
- Smooth transitions

## Accessibility

The component follows accessibility best practices:

- `aria-label="Search articles"` on the input field
- `aria-label="Clear search"` on the clear button
- Proper focus management
- Keyboard navigation support
- Screen reader friendly

## Demo Page

To see the SearchBar component in action, visit the demo page:

```bash
npm run dev
# Navigate to http://localhost:3000/searchbar-demo
```

The demo page shows:
- Live search query updates
- Search history with timestamps
- Implementation notes
- Visual feedback of debounce behavior

## Testing

Unit tests are available in `components/SearchBar.test.tsx`:

```bash
npm test SearchBar.test.tsx
```

Tests cover:
- Rendering with default and custom props
- Input value updates
- Debounced callback triggering
- Clear button functionality
- Accessibility attributes

## Implementation Details

### Debounce Implementation

The debounce is implemented using React's `useEffect` hook with a cleanup function:

```tsx
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    onSearchChange(searchValue);
  }, 300);

  return () => {
    clearTimeout(debounceTimer);
  };
}, [searchValue, onSearchChange]);
```

This ensures:
- Timer is cleared if component unmounts
- Timer is reset on each keystroke
- No memory leaks

### Performance Considerations

- Uses `useCallback` for event handlers to prevent unnecessary re-renders
- Minimal re-renders (only when search value changes)
- Efficient debounce implementation
- No external dependencies required

## Common Patterns

### Combining with Category Filter

```tsx
function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const fetchArticles = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (category) params.append('category', category);
    
    const response = await fetch(`/api/articles?${params}`);
    // ... handle response
  };

  useEffect(() => {
    fetchArticles();
  }, [searchQuery, category]);

  return (
    <>
      <SearchBar onSearchChange={setSearchQuery} />
      <CategoryFilter onCategoryChange={setCategory} />
    </>
  );
}
```

### Preserving Search State in URL

```tsx
import { useRouter } from 'next/router';

function ArticlesPage() {
  const router = useRouter();
  const searchQuery = router.query.search as string || '';

  const handleSearchChange = (query: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, search: query }
    }, undefined, { shallow: true });
  };

  return (
    <SearchBar 
      onSearchChange={handleSearchChange}
      initialValue={searchQuery}
    />
  );
}
```

## Troubleshooting

### Callback not triggering

- Ensure `onSearchChange` is a stable function reference (use `useCallback` if needed)
- Check that the component is not unmounting before the 300ms delay

### Multiple API calls

- Verify debounce is working correctly
- Check that `onSearchChange` is not creating new function references on each render

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check that the component has sufficient width in its container
- Verify responsive breakpoints match your design requirements
