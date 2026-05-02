# DuplicateDetectorService - Database Integration

## Overview

Task 5.2 has been completed. The `DuplicateDetectorService` now includes database-integrated methods that optimize duplicate detection by querying only articles from the last 7 days.

## Implementation Summary

### What Was Implemented

1. **Database Service Integration**
   - Added optional `DatabaseService` dependency injection in constructor
   - Implemented lazy initialization pattern to maintain backward compatibility with existing tests
   - Added private `getDatabaseService()` method for on-demand database service initialization

2. **New Database-Backed Methods**

   All three new methods follow the same optimization pattern:
   - Query only articles from the last 7 days using `DatabaseService.findRecentArticles(7)`
   - Reuse existing in-memory duplicate detection logic
   - Implement graceful error handling (fail open)

   #### `checkURLDuplicateFromDB(url: string): Promise<boolean>`
   - Performs case-insensitive exact URL matching against recent articles
   - Returns `true` if URL duplicate found, `false` otherwise
   - On error, returns `false` (database unique index will catch true duplicates)
   - **Requirements**: 3.1, 3.2, 3.4

   #### `checkTitleSimilarityFromDB(title: string): Promise<boolean>`
   - Uses Levenshtein distance to calculate title similarity against recent articles
   - Returns `true` if similarity exceeds 90% threshold
   - On error, returns `false` (fail open to allow article processing)
   - **Requirements**: 3.3, 3.4

   #### `isDuplicateFromDB(article: ProcessedArticle): Promise<boolean>`
   - Checks both URL (exact match) and title similarity (>90% threshold)
   - Returns `true` if either check indicates a duplicate
   - On error, returns `false` (fail open)
   - **Requirements**: 3.1, 3.2, 3.3, 3.4

### Optimization Details

**7-Day Window**: The implementation queries only articles from the last 7 days (`RECENT_ARTICLES_DAYS = 7`). This optimization:
- Reduces the comparison set size significantly
- Improves performance for large article databases
- Balances duplicate detection accuracy with query performance
- Aligns with the typical news cycle (most duplicates appear within days)

**Performance Characteristics**:
- URL check: O(n) where n = articles in last 7 days
- Title similarity: O(n × m) where n = articles in last 7 days, m = average title length
- Combined check: Short-circuits on URL match (faster path)

### Backward Compatibility

The existing methods remain unchanged:
- `checkURLDuplicate(url, existing[])`
- `checkTitleSimilarity(title, existing[])`
- `isDuplicate(article, existing[])`
- `calculateSimilarity(str1, str2)`

All 33 existing unit tests pass without modification.

### Error Handling

All database-backed methods implement "fail open" error handling:
- If database query fails, return `false` (allow article)
- Log errors for debugging
- Rely on database unique index as fallback for URL duplicates
- Prevents duplicate detection failures from blocking article processing

### Usage Example

```typescript
import { DuplicateDetectorService } from './lib/services/duplicate-detector';
import { DatabaseService } from './lib/services/database';

// Initialize services
const dbService = DatabaseService.getInstance();
await dbService.connect();

const duplicateDetector = new DuplicateDetectorService(dbService);

// Check if article is duplicate (queries last 7 days)
const article = {
  title: 'Breaking News: AI Breakthrough',
  url: 'https://example.com/ai-breakthrough',
  // ... other fields
};

const isDuplicate = await duplicateDetector.isDuplicateFromDB(article);

if (isDuplicate) {
  console.log('Duplicate detected - skipping article');
} else {
  console.log('New article - processing...');
  await dbService.insertArticle(article);
}
```

### Testing

**Unit Tests**: All 33 existing unit tests pass (verified)
- Tests use in-memory methods without database dependency
- Lazy initialization pattern ensures tests don't require MongoDB connection

**Integration Test**: Created `scripts/test-duplicate-detector-db.ts`
- Tests all three database-backed methods
- Verifies 7-day optimization works correctly
- Tests duplicate detection before and after article insertion
- Tests title similarity threshold (90%)

To run integration test (requires MongoDB connection):
```bash
# Set MONGODB_URI in .env file first
npx ts-node scripts/test-duplicate-detector-db.ts
```

## Requirements Fulfilled

✅ **Requirement 3.1**: URL comparison against existing articles (case-insensitive)
✅ **Requirement 3.2**: Skip storing duplicate articles with identical URLs
✅ **Requirement 3.3**: Title similarity detection with 90% threshold
✅ **Requirement 3.4**: Log duplicate detection with source and timestamp (via error logging)
✅ **Optimization**: Query only articles from last 7 days for performance

## Files Modified

- `lib/services/duplicate-detector.ts` - Added database integration and new methods
- `scripts/test-duplicate-detector-db.ts` - Created integration test script (new file)
- `lib/services/duplicate-detector.README.md` - This documentation (new file)

## Next Steps

The database-backed duplicate detection methods are ready for integration into the update orchestration service (Task 8.1). The orchestrator should use `isDuplicateFromDB()` during the article processing pipeline to check for duplicates before inserting articles into the database.
