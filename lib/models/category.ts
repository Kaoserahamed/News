/**
 * Category enum for news articles
 * Represents the different categories that articles can be classified into
 */
export enum Category {
  TECHNOLOGY = 'Technology',
  SPORTS = 'Sports',
  BUSINESS = 'Business',
  POLITICS = 'Politics',
  ENTERTAINMENT = 'Entertainment',
  GENERAL = 'General'
}

/**
 * Type guard to check if a string is a valid Category
 */
export function isValidCategory(value: string): value is Category {
  return Object.values(Category).includes(value as Category);
}

/**
 * Get all available categories as an array
 */
export function getAllCategories(): Category[] {
  return Object.values(Category);
}
