# Services

This directory contains the core business logic services for the News Aggregator application.

## DatabaseService

The `DatabaseService` class manages MongoDB connections and provides database operations.

### Features

- **Singleton Pattern**: Ensures a single connection pool across the application
- **Connection Pooling**: Efficient resource management with configurable pool size
- **Retry Logic**: Automatic retry with exponential backoff (1s, 2s, 4s)
- **Health Checks**: Monitor database connectivity status
- **Error Handling**: Comprehensive error handling and logging

### Usage

```typescript
import { getDatabaseService } from './services/database';

// Get singleton instance
const dbService = getDatabaseService();

// Connect to database
await dbService.connect();

// Check health
const isHealthy = await dbService.isHealthy();

// Get database instance
const db = await dbService.getDatabase();

// Get a collection
const articlesCollection = await dbService.getCollection('articles');

// Disconnect
await dbService.disconnect();
```

### Configuration

The service requires the following environment variable:

- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/database`)

### Connection Pooling

The service uses the following connection pool settings:

- **maxPoolSize**: 10 connections
- **minPoolSize**: 2 connections
- **maxIdleTimeMS**: 30 seconds
- **serverSelectionTimeoutMS**: 5 seconds
- **socketTimeoutMS**: 45 seconds

### Retry Logic

When a connection fails, the service will retry up to 3 times with exponential backoff:

1. First retry: 1 second delay
2. Second retry: 2 seconds delay
3. Third retry: 4 seconds delay

If all retries fail, an error is thrown.

### Requirements

- **Requirement 4.1**: Store articles with all metadata fields
- **Requirement 4.5**: Retry database operations up to 3 times with exponential backoff

### Testing

To manually test the database service:

```bash
# Make sure MONGODB_URI is set in .env
npx ts-node scripts/test-database.ts
```

## Future Services

The following services will be implemented in subsequent tasks:

- **NewsCollectorService**: Fetch news from RSS feeds
- **ContentProcessorService**: Clean and normalize article content
- **DuplicateDetectorService**: Detect duplicate articles
- **UpdateOrchestratorService**: Coordinate update cycles
