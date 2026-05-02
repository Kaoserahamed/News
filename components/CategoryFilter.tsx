import React from 'react';
import { Category, getAllCategories } from '@/lib/models/category';

/**
 * CategoryFilter component for the Automated News Aggregation Web Application
 * 
 * Displays a list of category buttons with article counts, allowing users to filter
 * articles by category. Includes an "All" button to clear the filter.
 * 
 * Validates: Requirements 7.1 (display categories), 7.2 (select category),
 *            7.3 (display filtered articles), 7.4 (display article counts),
 *            7.5 (clear category filter)
 */

interface CategoryFilterProps {
  /**
   * Callback function triggered when a category is selected or cleared
   * @param category - The selected category, or null to show all articles
   */
  onCategoryChange: (category: Category | null) => void;
  
  /**
   * Object mapping each category to its article count
   * @example { Technology: 15, Sports: 8, Business: 12 }
   */
  categoryCounts: Partial<Record<Category, number>>;
  
  /**
   * The currently selected category, or null if showing all articles
   */
  selectedCategory: Category | null;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onCategoryChange,
  categoryCounts,
  selectedCategory
}) => {
  // Get all available categories
  const categories = getAllCategories();
  
  // Calculate total article count for "All" button
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Handle category button click
  const handleCategoryClick = (category: Category | null) => {
    onCategoryChange(category);
  };
  
  // Get category-specific styling classes
  const getCategoryClasses = (category: Category, isSelected: boolean): string => {
    const classMap: Record<Category, { selected: string; unselected: string; badge: string; focus: string }> = {
      [Category.TECHNOLOGY]: {
        selected: 'bg-blue-600 text-white border-blue-600',
        unselected: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400',
        badge: isSelected ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700',
        focus: 'focus:ring-blue-500'
      },
      [Category.SPORTS]: {
        selected: 'bg-green-600 text-white border-green-600',
        unselected: 'bg-white text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400',
        badge: isSelected ? 'bg-green-700 text-white' : 'bg-green-100 text-green-700',
        focus: 'focus:ring-green-500'
      },
      [Category.BUSINESS]: {
        selected: 'bg-purple-600 text-white border-purple-600',
        unselected: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50 hover:border-purple-400',
        badge: isSelected ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-700',
        focus: 'focus:ring-purple-500'
      },
      [Category.POLITICS]: {
        selected: 'bg-red-600 text-white border-red-600',
        unselected: 'bg-white text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400',
        badge: isSelected ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700',
        focus: 'focus:ring-red-500'
      },
      [Category.ENTERTAINMENT]: {
        selected: 'bg-pink-600 text-white border-pink-600',
        unselected: 'bg-white text-pink-700 border-pink-300 hover:bg-pink-50 hover:border-pink-400',
        badge: isSelected ? 'bg-pink-700 text-white' : 'bg-pink-100 text-pink-700',
        focus: 'focus:ring-pink-500'
      },
      [Category.GENERAL]: {
        selected: 'bg-gray-600 text-white border-gray-600',
        unselected: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400',
        badge: isSelected ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700',
        focus: 'focus:ring-gray-500'
      }
    };
    
    return classMap[category][isSelected ? 'selected' : 'unselected'];
  };
  
  const getCategoryBadgeClasses = (category: Category, isSelected: boolean): string => {
    const classMap: Record<Category, { selected: string; unselected: string }> = {
      [Category.TECHNOLOGY]: {
        selected: 'bg-blue-700 text-white',
        unselected: 'bg-blue-100 text-blue-700'
      },
      [Category.SPORTS]: {
        selected: 'bg-green-700 text-white',
        unselected: 'bg-green-100 text-green-700'
      },
      [Category.BUSINESS]: {
        selected: 'bg-purple-700 text-white',
        unselected: 'bg-purple-100 text-purple-700'
      },
      [Category.POLITICS]: {
        selected: 'bg-red-700 text-white',
        unselected: 'bg-red-100 text-red-700'
      },
      [Category.ENTERTAINMENT]: {
        selected: 'bg-pink-700 text-white',
        unselected: 'bg-pink-100 text-pink-700'
      },
      [Category.GENERAL]: {
        selected: 'bg-gray-700 text-white',
        unselected: 'bg-gray-100 text-gray-700'
      }
    };
    
    return classMap[category][isSelected ? 'selected' : 'unselected'];
  };
  
  const getCategoryFocusClasses = (category: Category): string => {
    const focusMap: Record<Category, string> = {
      [Category.TECHNOLOGY]: 'focus:ring-blue-500',
      [Category.SPORTS]: 'focus:ring-green-500',
      [Category.BUSINESS]: 'focus:ring-purple-500',
      [Category.POLITICS]: 'focus:ring-red-500',
      [Category.ENTERTAINMENT]: 'focus:ring-pink-500',
      [Category.GENERAL]: 'focus:ring-gray-500'
    };
    
    return focusMap[category];
  };
  
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Filter by Category
        </h2>
        
        {/* Category buttons container - responsive grid */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* "All" button */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`
              inline-flex items-center justify-center
              px-3 sm:px-4 py-2
              border-2 rounded-lg
              text-sm sm:text-base font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              ${selectedCategory === null
                ? 'bg-gray-700 text-white border-gray-700 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
            aria-label="Show all articles"
            aria-pressed={selectedCategory === null}
          >
            <span>All</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-600 text-white">
              {totalCount}
            </span>
          </button>
          
          {/* Category buttons */}
          {categories.map((category) => {
            const count = categoryCounts[category] || 0;
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`
                  inline-flex items-center justify-center
                  px-3 sm:px-4 py-2
                  border-2 rounded-lg
                  text-sm sm:text-base font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${getCategoryClasses(category, isSelected)}
                  ${getCategoryFocusClasses(category)}
                `}
                aria-label={`Filter by ${category}`}
                aria-pressed={isSelected}
              >
                <span>{category}</span>
                <span 
                  className={`
                    ml-2 px-2 py-0.5 text-xs font-semibold rounded-full
                    ${getCategoryBadgeClasses(category, isSelected)}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Active filter indicator */}
        {selectedCategory && (
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{selectedCategory}</span> articles
            <button
              onClick={() => handleCategoryClick(null)}
              className="ml-2 text-blue-600 hover:text-blue-800 underline focus:outline-none"
              aria-label="Clear category filter"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
