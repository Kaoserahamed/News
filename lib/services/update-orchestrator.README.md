# Update Orchestrator Service

## Overview

The `UpdateOrchestratorService` is the central coordination service that orchestrates the complete news update cycle. It coordinates all core services (NewsCollector, ContentProcessor, DuplicateDetector, Database) to fetch, process, deduplicate, and store news articles.

## Purpose

This service implements the main business logic flow for automated news collection:

1. **Fetch** articles from all configured RSS sources
2. **Process** each article (clean HTML, normalize text, categorize)
3. **Check** for duplicates against existing articles
4. **Store** non-duplicate articles in the database
5. **Track** and log execution metrics

## Architecture

```
UpdateOrchestratorService
├── NewsCollectorService      (Fetches RSS feeds)
├── ContentProcessorService   (Cleans and normalizes content)
├── DuplicateDetectorService  (Detects duplicate articles)
└── DatabaseService           (Stores articles and logs)
```

## Key Features

### 1. Complete Orchestration
- Coordinates all services in the correct sequence
- Handles the complete update cycle from start to finish
- Returns comprehensive execution metrics

### 2. Robust Error Handling
- Continues processing even if individual articles fail
- Logs all errors with full context
- Distinguishes between processing errors and storage errors
- Handles database duplicate errors gracefully

### 3. Comprehensive Logging
- Logs update cycle start with execution ID
- Logs each major step (fetch, process, duplicate check, store)
- Logs completion with full metrics
- Stores logs in database for monitoring

### 4. Metrics Tracking
- Articles processed (total fetched)
- Articles stored (successfully saved)
- Duplicates skipped (detected duplicates)
- Duration (execution time in milliseconds)
- Execution ID (unique identifier for each cycle)

## Usage

```typescript
import { UpdateOrchestratorService } from './lib/services/update-orchestrator';

// Create orchestrator instance
const orchestrator = new UpdateOrchestratorService();

// Execute update cycle
const result = await orchestrator.executeUpdateCycle();

console.log('Articles Processed:', result.articlesProcessed);
console.log('Articles Stored:', result.articlesStored);
console.log('Duplicates Skipped:', result.duplicatesSkipped);
console.log('Duration:', result.duration, 'ms');
```

## Return Value

The `executeUpdateCycle()` method returns an `UpdateCycleResult` object:

```typescript
interface UpdateCycleResult {
  articlesProcessed: number;    // Total articles fetched and processed
  articlesStored: number;        // Articles successfully stored in database
  duplicatesSkipped: number;     // Articles skipped due to duplicate detection
  duration: number;              // Execution time in milliseconds
  timestamp: Date;               // When the update cycle completed
  executionId: string;           // Unique identifier for this execution
}
```

## Error Handling

### Processing Errors
If an individual article fails to process:
- Error is logged with article details
- Processing continues with remaining articles
- Article is not included in processed count

### Storage Errors
If an article fails to store:
- Error is logged with article details
- Storage continues with remaining articles
- Article is not included in stored count

### Duplicate Detection
Duplicates are detected in two ways:
1. **Pre-check**: DuplicateDetectorService checks before insertion
2. **Database constraint**: MongoDB unique index on URL field

Both methods increment the `duplicatesSkipped` counter.

### Critical Errors
If a critical error occurs (e.g., database connection failure):
- Error is logged to console and database
- Error is re-thrown to caller
- Partial metrics are included in error log

## Testing

A manual test script is provided:

```bash
npx ts-node scripts/test-update-orchestrator.ts
```

This script:
- Creates an orchestrator instance
- Executes a complete update cycle
- Displays execution metrics
- Verifies the orchestration logic works correctly

## Requirements Satisfied

- **1.1**: Automated news collection from RSS feeds
- **1.5**: Logs execution timestamp and article count
- **11.1**: Executes update cycle
- **11.2**: Logs update cycle start with execution ID
- **11.3**: Logs completion with metrics

## Integration

This service is used by:
- `/pages/api/cron/update.ts` - Vercel cron job endpoint
- Manual update triggers
- Testing and development scripts

## Dependencies

- `NewsCollectorService` - Fetches articles from RSS sources
- `ContentProcessorService` - Processes and normalizes articles
- `DuplicateDetectorService` - Detects duplicate articles
- `DatabaseService` - Stores articles and logs in MongoDB

## Future Enhancements

Potential improvements for future iterations:
- Concurrent processing of articles (currently sequential)
- Configurable batch sizes for database operations
- Progress callbacks for long-running updates
- Retry logic for transient failures
- Performance metrics (articles per second, etc.)
