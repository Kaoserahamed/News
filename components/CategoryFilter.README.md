# CategoryFilter Component

## Overview

The `CategoryFilter` component provides a user interface for filtering news articles by category. It displays all available categories as interactive buttons with article counts, allows users to select a category to filter articles, and includes an "All" button to clear the filter and show all articles.

## Features

- **Category Buttons**: Displays all available categories (Technology, Sports, Business, Politics, Entertainment, General)
- **Article Counts**: Shows the number of articles available in each category
- **Visual Feedback**: Highlights the currently selected category
- **"All" Button**: Clears the filter to show all articles with total count
- **Active Filter Indicator**: Shows which category is currently selected with a clear filter option
- **Responsive Design**: Adapts to different screen sizes with flexible button layout
- **Accessibility**: Full keyboard navigation and screen reader support
- **Category-Specific Styling**: Each category has its own color scheme

## Requirements Validation

This component validates the following requirements:

- **Requirement 7.1**: Display a list of available Categories
- **Requirement 7.2**: Request filtered articles when a user selects a Category
- **Requirement 7.3**: Display only articles belonging to the selected Category
- **Requirement 7.4**: Display the count of articles available in each Category
- **Requirement 7.5**: Display all articles when a user clears the category filter

## Props

### `onCategoryChange`
- **Type**: `(category: Category | null) => void`
- **Required**: Yes
- **Description**: Callback function triggered when a category is selected or cleared. Receives the selected `Category` enum value, or `null` to show all articles.

### `categoryCounts`
- **Type**: `Partial<Record<Category, number>>`
- **Required**: Yes
- **Description**: Object mapping each category to its article count. Categories with no count will display 0.
- **Example**: 
  ```typescript
  {
    Technology: 15,
    Sports: 8,
    Business: 12,
    Politics: 5,
    Entertainment: 10,
    General: 3
  }
  ```

### `selectedCategory`
- **Type**: `Category | null`
- **Required**: Yes
- **Description**: The currently selected category, or `null` if showing all articles. This prop controls which button is highlighted.

## Usage Example

### Basic Usage

```tsx
import React, { useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import { Category } from '@/lib/models/category';

function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const categoryCounts = {
    [Category.TECHNOLOGY]: 15,
    [Category.SPORTS]: 8,
    [Category.BUSINESS]: 12,
    [Category.POLITICS]: 5,
    [Category.ENTERTAINMENT]: 10,
    [Category.GENERAL]: 3
  };

  const handleCategoryChange = (category: Category | null) => {
    setSelectedCategory(category);
    // Fetch filtered articles from API
    fetchArticles(category);
  };

  return (
    <div>
      <CategoryFilter
        onCategoryChange={handleCategoryChange}
        categoryCounts={categoryCounts}
        selectedCategory={selectedCategory}
      />
      {/* Article list component */}
    </div>
  );
}
```

### Integration with API

```tsx
import React, { useState, useEffect } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import { Category } from '@/lib/models/category';

function NewsApp() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  // Fetch articles when category changes
  useEffect(() => {
    const fetchArticles = async () => {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      setArticles(data.articles);
    };

    fetchArticles();
  }, [selectedCategory]);

  // Fetch category counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const response = await fetch('/api/categories/counts');
      const data = await response.json();
      setCategoryCounts(data.counts);
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <CategoryFilter
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
        selectedCategory={selectedCategory}
      />
      {/* Render articles */}
    </div>
  );
}
```

### With Empty Counts

```tsx
<CategoryFilter
  onCategoryChange={handleCategoryChange}
  categoryCounts={{}}
  selectedCategory={null}
/>
```

## Styling

The component uses Tailwind CSS for styling with the following features:

### Category Colors

Each category has a distinct color scheme:
- **Technology**: Blue
- **Sports**: Green
- **Business**: Purple
- **Politics**: Red
- **Entertainment**: Pink
- **General**: Gray

### Responsive Breakpoints

- **Mobile (< 640px)**: Smaller buttons with reduced padding
- **Tablet (640px - 1024px)**: Medium-sized buttons
- **Desktop (≥ 1024px)**: Full-sized buttons with optimal spacing

### Button States

- **Default**: White background with category-colored border and text
- **Hover**: Light category-colored background
- **Selected**: Solid category-colored background with white text
- **Focus**: Ring outline for keyboard navigation

## Accessibility

The component follows WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: All buttons are keyboard accessible
- **ARIA Labels**: Each button has descriptive `aria-label` attributes
- **ARIA Pressed**: Selected buttons have `aria-pressed="true"`
- **Focus Indicators**: Visible focus rings for keyboard users
- **Semantic HTML**: Uses proper button elements
- **Screen Reader Support**: Clear labels and state announcements

## Component Behavior

### Selecting a Category

1. User clicks a category button
2. `onCategoryChange` is called with the selected `Category` enum value
3. The button is highlighted with the category's color
4. An active filter indicator appears below the buttons
5. Parent component fetches and displays filtered articles

### Clearing the Filter

Users can clear the filter in two ways:

1. **Click "All" button**: Calls `onCategoryChange(null)`
2. **Click "Clear filter" link**: Appears when a category is selected, calls `onCategoryChange(null)`

### Article Count Display

- Each category button shows its article count in a badge
- The "All" button shows the total count across all categories
- Categories with 0 articles still display the button with count "0"
- Missing categories in `categoryCounts` default to 0

## Testing

### Running Tests

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Run tests
npm test CategoryFilter.test.tsx
```

The test suite includes:
- 13 comprehensive test cases covering:
  - Rendering all categories with counts
  - "All" button functionality
  - Category selection and highlighting
  - Clear filter functionality
  - Accessibility attributes
  - Edge cases (empty counts, missing categories)

### Test Coverage

- ✅ Renders all category buttons with article counts
- ✅ Renders "All" button with total count
- ✅ Highlights "All" button when no category is selected
- ✅ Highlights selected category button
- ✅ Calls onCategoryChange with null when "All" is clicked
- ✅ Calls onCategoryChange with category when category is clicked
- ✅ Displays active filter indicator when category is selected
- ✅ Hides active filter indicator when no category is selected
- ✅ Clears filter when "Clear filter" link is clicked
- ✅ Handles missing category counts gracefully
- ✅ Handles empty category counts
- ✅ Has proper accessibility attributes
- ✅ Allows switching between categories

## Performance Considerations

- **Memoization**: Consider wrapping the component with `React.memo()` if parent re-renders frequently
- **Callback Stability**: Ensure `onCategoryChange` is stable (use `useCallback` in parent)
- **Count Updates**: Update `categoryCounts` only when article data changes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- **SearchBar**: Provides search functionality for articles
- **ArticleList**: Displays filtered articles
- **Pagination**: Handles paginated article display

## Category Enum

The component uses the `Category` enum from `@/lib/models/category`:

```typescript
export enum Category {
  TECHNOLOGY = 'Technology',
  SPORTS = 'Sports',
  BUSINESS = 'Business',
  POLITICS = 'Politics',
  ENTERTAINMENT = 'Entertainment',
  GENERAL = 'General'
}
```

## Future Enhancements

Potential improvements for future versions:

- Add category icons for visual distinction
- Support for custom category colors via props
- Animated transitions between category selections
- Collapsible category list on mobile devices
- Category search/filter for large category lists
- Keyboard shortcuts for quick category switching
