# Cron API Endpoints

This directory contains API endpoints designed to be triggered by Vercel cron jobs.

## POST /api/cron/update

Triggers the automated news update cycle. This endpoint is called by Vercel cron jobs every hour.

### Configuration

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule**: `0 * * * *` (every hour at minute 0)

### Authentication

The endpoint requires authentication using the `CRON_SECRET` environment variable.

**Request Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

Vercel automatically includes this header when calling cron endpoints.

### Environment Variables

Required environment variables:

- `CRON_SECRET`: Secret key for authenticating cron requests
- `MONGODB_URI`: MongoDB connection string (used by UpdateOrchestratorService)

### Request

**Method:** POST  
**URL:** `/api/cron/update`  
**Headers:**
- `Authorization: Bearer <CRON_SECRET>`

**Body:** None

### Response

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "articlesProcessed": 45,
    "articlesStored": 32,
    "duplicatesSkipped": 13,
    "duration": 12500,
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

**405 Method Not Allowed:**
```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Only POST requests are allowed"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing authorization header"
  }
}
```

**409 Conflict (Concurrent Execution):**
```json
{
  "success": false,
  "error": {
    "code": "CONCURRENT_EXECUTION",
    "message": "Update cycle is already running. Please try again later."
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "UPDATE_CYCLE_FAILED",
    "message": "Failed to execute update cycle. Please check server logs for details.",
    "details": "Error message (only in development mode)"
  }
}
```

### Logging

The endpoint logs all requests with:
- Timestamp (ISO 8601 format)
- Endpoint path
- Response status code
- Request duration
- Execution metrics (for successful requests)

**Example log output:**

```
[2024-01-15T10:00:00.123Z] POST /api/cron/update - Request received
[2024-01-15T10:00:12.456Z] POST /api/cron/update - Status: 200 - Duration: 12333ms - Articles: 32/45 stored, 13 duplicates skipped
```

### Testing

**Unit Tests:**

Run the test suite:
```bash
npm test -- pages/api/cron/update.test.ts
```

**Manual Testing:**

Test the update cycle logic:
```bash
npx ts-node scripts/test-cron-endpoint.ts
```

**Local API Testing:**

Start the development server:
```bash
npm run dev
```

Make a POST request with authentication:
```bash
curl -X POST http://localhost:3000/api/cron/update \
  -H "Authorization: Bearer your-secret-key-here"
```

### Requirements

This endpoint implements the following requirements:

- **11.1**: Execute the Update_Cycle every 1 hour
- **11.5**: Execute Update_Cycles using the Vercel cron job infrastructure
- **12.4**: Log all incoming requests with timestamp, endpoint, and response status code

### Related Services

- `UpdateOrchestratorService` (`lib/services/update-orchestrator.ts`): Orchestrates the update cycle
- `NewsCollectorService` (`lib/services/news-collector.ts`): Fetches articles from RSS feeds
- `ContentProcessorService` (`lib/services/content-processor.ts`): Processes and normalizes articles
- `DuplicateDetectorService` (`lib/services/duplicate-detector.ts`): Detects duplicate articles
- `DatabaseService` (`lib/services/database.ts`): Manages database operations

### Deployment

1. Set the `CRON_SECRET` environment variable in Vercel dashboard
2. Deploy the application to Vercel
3. Vercel will automatically schedule the cron job based on `vercel.json`
4. Monitor logs in Vercel dashboard to verify execution

### Troubleshooting

**Cron job not running:**
- Verify `vercel.json` is in the project root
- Check that the `CRON_SECRET` environment variable is set in Vercel
- Review Vercel logs for any errors

**401 Unauthorized errors:**
- Verify `CRON_SECRET` matches between Vercel environment variables and local `.env`
- Check that the Authorization header is being sent correctly

**409 Concurrent Execution errors:**
- Update cycle is taking longer than 1 hour
- Consider optimizing the update cycle or adjusting the cron schedule

**500 Internal Server Error:**
- Check MongoDB connection (`MONGODB_URI` environment variable)
- Review server logs for detailed error messages
- Verify all required services are properly configured
