# Implementation Plan: Automated News Aggregation Web Application

## Overview

This implementation plan breaks down the Automated News Aggregation Web Application into discrete, incremental coding tasks. The system will be built using Next.js 14, TypeScript, MongoDB Atlas, and deployed on Vercel with cron job automation. The implementation follows a bottom-up approach, starting with core services, then API routes, and finally the frontend interface.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Next.js 14 project with TypeScript and Tailwind CSS
  - Install required dependencies: `mongodb`, `rss-parser`, `date-fns`, `fast-levenshtein`
  - Create directory structure: `/lib/services`, `/lib/models`, `/lib/utils`, `/pages/api`
  - Set up environment variables template (`.env.example`) for MongoDB connection and Vercel cron secret
  - Configure TypeScript with strict mode and path aliases
  - _Requirements: 4.1, 11.5_

- [x] 2. Define TypeScript interfaces and data models
  - Create `/lib/models/article.ts` with `Article`, `RawArticle`, `ProcessedArticle` interfaces
  - Create `/lib/models/category.ts` with `Category` enum
  - Create `/lib/models/rss-source.ts` with `RSSSource` and `RSSSourceConfig` interfaces
  - Create `/lib/models/system-log.ts` with `SystemLog` interface
  - Create `/lib/models/api.ts` with `ArticleQuery`, `ArticleResult`, and API response interfaces
  - _Requirements: 2.5, 4.1, 4.2, 4.3_

- [ ] 3. Implement Database Service
  - [x] 3.1 Create MongoDB connection and basic operations
    - Create `/lib/services/database.ts` with `DatabaseService` class
    - Implement `connect()` and `disconnect()` methods with connection pooling
    - Implement `isHealthy()` method to check database connectivity
    - Add connection error handling and retry logic
    - _Requirements: 4.1, 4.5_
  
  - [x] 3.2 Implement article database operations
    - Implement `insertArticle()` with retry logic (exponential backoff: 1s, 2s, 4s)
    - Implement `findArticles()` with pagination, filtering, and search support
    - Implement `findRecentArticles()` to query articles from last N days
    - Create MongoDB indexes: `publishedAt` (desc), `category`, `url` (unique), text indexes on `title` and `summary`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 3.3 Implement logging operations
    - Implement `insertLog()` method for system logs
    - Create index on `logs.timestamp` (descending)
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ]* 3.4 Write unit tests for Database Service
    - Test connection handling and retry logic
    - Test article insertion with duplicate URL handling
    - Test query operations with various filters
    - Test pagination logic
    - _Requirements: 4.1, 4.5, 5.2_

- [ ] 4. Implement Content Processor Service
  - [x] 4.1 Create content processing utilities
    - Create `/lib/services/content-processor.ts` with `ContentProcessorService` class
    - Implement `cleanHTML()` function to strip HTML tags using regex
    - Implement `normalizeWhitespace()` function to normalize spaces and line breaks
    - Implement `truncateSummary()` function to truncate at word boundaries (max 300 chars)
    - Implement `parseDate()` function to parse various date formats to ISO 8601
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 4.2 Implement article categorization
    - Create `/lib/utils/categorization.ts` with keyword lists for each category
    - Implement `categorizeArticle()` function using keyword matching
    - Default to 'General' category if no keywords match
    - _Requirements: 2.5_
  
  - [x] 4.3 Implement main article processing function
    - Implement `processArticle()` method that orchestrates all processing steps
    - Handle missing or invalid fields gracefully
    - Add timestamp for `processedAt` field
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 4.4 Write unit tests for Content Processor
    - Test HTML cleaning with various HTML inputs
    - Test whitespace normalization edge cases
    - Test summary truncation at word boundaries
    - Test date parsing with multiple formats
    - Test categorization with different keyword combinations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Implement Duplicate Detector Service
  - [x] 5.1 Create similarity calculation utilities
    - Create `/lib/services/duplicate-detector.ts` with `DuplicateDetectorService` class
    - Implement `calculateSimilarity()` using Levenshtein distance algorithm
    - Normalize similarity score to 0-1 range (1 = identical)
    - _Requirements: 3.3_
  
  - [x] 5.2 Implement duplicate detection methods
    - Implement `checkURLDuplicate()` for exact URL matching (case-insensitive)
    - Implement `checkTitleSimilarity()` with 90% threshold
    - Implement `isDuplicate()` that checks both URL and title similarity
    - Optimize by querying only articles from last 7 days
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 5.3 Write unit tests for Duplicate Detector
    - Test similarity calculation with various string pairs
    - Test URL duplicate detection (case variations)
    - Test title similarity with threshold edge cases
    - Test combined duplicate detection logic
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Implement News Collector Service
  - [x] 6.1 Create RSS source configuration
    - Create `/config/rss-sources.json` with at least 5 RSS feed sources
    - Include sources for Technology, Sports, Business, Politics, Entertainment categories
    - Add enabled/disabled flag for each source
    - _Requirements: 1.4_
  
  - [x] 6.2 Implement RSS feed fetching
    - Create `/lib/services/news-collector.ts` with `NewsCollectorService` class
    - Implement `fetchSource()` method using `rss-parser` library
    - Add 10-second timeout per source
    - Extract title, summary, content, link, pubDate, and source from RSS items
    - Handle missing optional fields (summary, content)
    - _Requirements: 1.1, 1.2_
  
  - [x] 6.3 Implement multi-source fetching with error handling
    - Implement `fetchAllSources()` method that processes all enabled sources
    - Log errors for failed sources but continue with remaining sources
    - Return combined array of articles from all successful sources
    - Log execution timestamp and article count
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  
  - [ ]* 6.4 Write unit tests for News Collector
    - Mock RSS parser responses
    - Test single source fetching with valid RSS
    - Test error handling for network failures
    - Test timeout handling
    - Test multi-source aggregation
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Checkpoint - Ensure core services are working
  - Run all unit tests and verify they pass
  - Test database connection with MongoDB Atlas
  - Verify RSS feed parsing with real sources
  - Ask the user if questions arise

- [ ] 8. Implement Update Orchestration Service
  - [x] 8.1 Create update orchestration logic
    - Create `/lib/services/update-orchestrator.ts` with `UpdateOrchestratorService` class
    - Implement `executeUpdateCycle()` method that coordinates all services
    - Flow: Fetch articles → Process articles → Check duplicates → Store in database
    - Track metrics: articles processed, stored, duplicates skipped, duration
    - _Requirements: 1.1, 1.5, 11.1, 11.2, 11.3_
  
  - [x] 8.2 Add comprehensive logging
    - Log update cycle start with execution ID and timestamp
    - Log each processing step (fetch, process, duplicate check, store)
    - Log update cycle completion with metrics
    - Log all errors with component name and stack trace
    - _Requirements: 11.2, 11.3, 12.1, 12.2_
  
  - [x] 8.3 Implement concurrent execution prevention
    - Add lock mechanism to prevent overlapping update cycles
    - Skip new cycle if previous cycle is still running
    - Log warning when cycle is skipped
    - _Requirements: 11.4_
  
  - [ ]* 8.4 Write integration tests for update orchestration
    - Test full update cycle with mocked RSS feeds
    - Test duplicate detection during update
    - Test error handling and partial failures
    - Test concurrent execution prevention
    - _Requirements: 1.1, 1.5, 11.4_

- [ ] 9. Implement Backend API Routes
  - [x] 9.1 Create GET /api/articles endpoint
    - Create `/pages/api/articles.ts` API route
    - Parse and validate query parameters: page, limit, category, search
    - Call `DatabaseService.findArticles()` with query parameters
    - Return JSON response with articles and pagination metadata
    - Handle errors: return 400 for invalid params, 503 for database errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 9.2 Create POST /api/cron/update endpoint
    - Create `/pages/api/cron/update.ts` API route
    - Verify Vercel cron secret from request headers
    - Call `UpdateOrchestratorService.executeUpdateCycle()`
    - Return JSON response with execution metrics
    - Log all requests with response status
    - _Requirements: 11.1, 11.5, 12.4_
  
  - [x] 9.3 Create GET /api/health endpoint
    - Create `/pages/api/health.ts` API route
    - Check database connectivity using `DatabaseService.isHealthy()`
    - Query last successful update timestamp from logs
    - Return system status, database status, and last update time
    - _Requirements: 12.5_
  
  - [ ]* 9.4 Write API endpoint tests
    - Test /api/articles with various query parameters
    - Test /api/articles error responses (400, 503)
    - Test /api/cron/update with valid and invalid secrets
    - Test /api/health response format
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 12.5_

- [-] 10. Configure Vercel Cron Job
  - Create `vercel.json` with cron job configuration
  - Set cron schedule to run every hour: `0 * * * *`
  - Configure cron job to call `/api/cron/update` endpoint
  - Add environment variable for cron secret
  - _Requirements: 11.1, 11.5_

- [ ] 11. Implement Frontend Components - Layout and Structure
  - [~] 11.1 Create main page layout
    - Create `/pages/index.tsx` with main app structure
    - Set up React state management for articles, loading, error, pagination, filters
    - Implement `useEffect` hook to fetch articles on mount and filter changes
    - Add Tailwind CSS configuration for responsive design
    - _Requirements: 8.1, 8.4_
  
  - [x] 11.2 Create Header component
    - Create `/components/Header.tsx` with logo and title
    - Style with Tailwind CSS for responsive layout
    - _Requirements: 8.1_
  
  - [x] 11.3 Create SearchBar component
    - Create `/components/SearchBar.tsx` with input field
    - Implement debounced search (300ms delay)
    - Update app state on search query change
    - _Requirements: 6.1, 6.5_

- [ ] 12. Implement Frontend Components - Filtering and Display
  - [~] 12.1 Create CategoryFilter component
    - Create `/components/CategoryFilter.tsx` with category buttons
    - Display all available categories with article counts
    - Highlight selected category
    - Add "All" button to clear filter
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [~] 12.2 Create ArticleCard component
    - Create `/components/ArticleCard.tsx` to display single article
    - Show title, summary, source, publication date (relative format), and category
    - Make title clickable to open original URL in new tab
    - Apply category-specific styling/colors
    - Implement responsive layout (single column on mobile, grid on desktop)
    - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [~] 12.3 Create ArticleList component
    - Create `/components/ArticleList.tsx` to render array of ArticleCard components
    - Show loading spinner during API calls
    - Display "No articles found" message when results are empty
    - Highlight search terms in titles and summaries
    - _Requirements: 6.3, 6.4, 9.1_

- [ ] 13. Implement Frontend Components - Pagination and Error Handling
  - [~] 13.1 Create Pagination component
    - Create `/components/Pagination.tsx` with Previous/Next buttons and page numbers
    - Disable Previous on first page, Next on last page
    - Update app state on page change
    - Implement infinite scroll: detect scroll to bottom and load next page
    - _Requirements: 5.2, 8.5_
  
  - [~] 13.2 Create ErrorBoundary and error handling
    - Create `/components/ErrorMessage.tsx` to display error messages
    - Show specific messages for connection failures, timeouts, and server errors
    - Add retry button that re-triggers the failed API call
    - Implement 10-second timeout for API requests
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [~] 13.3 Implement responsive design breakpoints
    - Test and adjust layouts for mobile (320px-767px): single column
    - Test and adjust layouts for tablet (768px-1023px): two columns
    - Test and adjust layouts for desktop (1024px+): multi-column grid
    - Ensure page loads within 2 seconds on standard connection
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [~] 14. Checkpoint - Test frontend integration
  - Run Next.js development server and verify UI renders correctly
  - Test search functionality with various queries
  - Test category filtering with all categories
  - Test pagination and infinite scroll
  - Test responsive design on different screen sizes
  - Test error handling by simulating API failures
  - Ask the user if questions arise

- [ ] 15. Integration and End-to-End Wiring
  - [~] 15.1 Connect frontend to backend API
    - Verify all API endpoints are correctly called from frontend
    - Test search query parameter passing
    - Test category filter parameter passing
    - Test pagination parameter passing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 7.2_
  
  - [~] 15.2 Test complete update cycle
    - Manually trigger `/api/cron/update` endpoint
    - Verify articles are fetched, processed, and stored
    - Check database for stored articles with correct structure
    - Verify duplicates are detected and skipped
    - Check logs for execution metrics
    - _Requirements: 1.1, 1.5, 3.1, 3.2, 3.3, 11.1, 11.2, 11.3, 12.1_
  
  - [~] 15.3 Configure environment variables for deployment
    - Set MongoDB Atlas connection string in Vercel environment variables
    - Set Vercel cron secret
    - Configure RSS source URLs (if using environment variables)
    - Test connection to MongoDB Atlas from Vercel
    - _Requirements: 4.1, 11.5_
  
  - [ ]* 15.4 Write end-to-end integration tests
    - Test complete user flow: load page → search → filter → paginate
    - Test update cycle → database storage → API retrieval → frontend display
    - Test error scenarios: database down, RSS feed unavailable, invalid queries
    - _Requirements: 1.1, 5.1, 6.1, 7.2, 10.1_

- [ ] 16. Final testing and deployment preparation
  - [~] 16.1 Verify all requirements are met
    - Review requirements document and check each acceptance criterion
    - Test automated news collection (hourly updates)
    - Test content processing and normalization
    - Test duplicate detection
    - Test search and filtering functionality
    - Test responsive UI on multiple devices
    - Test error handling and logging
    - _Requirements: All_
  
  - [~] 16.2 Prepare deployment documentation
    - Document environment variables required
    - Document RSS source configuration format
    - Document MongoDB Atlas setup steps
    - Document Vercel deployment steps
    - Create README.md with setup instructions
    - _Requirements: 1.4, 4.1, 11.5_
  
  - [~] 16.3 Deploy to Vercel
    - Push code to Git repository
    - Connect repository to Vercel
    - Configure environment variables in Vercel dashboard
    - Deploy application
    - Verify cron job is scheduled and running
    - Test deployed application with real RSS feeds
    - _Requirements: 11.1, 11.5_

- [~] 17. Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all integration tests and verify they pass
  - Verify deployed application is functioning correctly
  - Check logs for any errors or warnings
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a bottom-up approach: services → API → frontend
- TypeScript is used throughout for type safety
- All dates are handled in ISO 8601 format
- MongoDB indexes are created to optimize query performance
- Error handling and logging are implemented at every layer
- The system is designed for deployment on Vercel with MongoDB Atlas
