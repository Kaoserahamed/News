# Health Check Endpoint

## Overview

The `/api/health` endpoint provides system health monitoring information for the News Aggregator application. It checks database connectivity and reports the last successful update cycle timestamp.

**Requirement:** 12.5 - THE News_Aggregator SHALL provide a health check endpoint that returns system status and last successful update time

## Endpoint Details

- **URL:** `/api/health`
- **Method:** `GET`
- **Authentication:** None (public endpoint)

## Response Format

### Success Response (200 OK or 503 Service Unavailable)

```json
{
  "success": true,
  "data": {
    "status": "healthy" | "degraded" | "unhealthy",
    "database": "connected" | "disconnected" | "error",
    "lastUpdate": "2024-01-15T10:00:00.000Z" | null,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response Fields

- **status**: Overall system health status
  - `healthy`: Database is connected and update cycles are running successfully
  - `degraded`: Database is connected but no updates have run, or logs cannot be queried
  - `unhealthy`: Database is disconnected or experiencing errors

- **database**: Database connectivity status
  - `connected`: Database is healthy and responsive
  - `disconnected`: Database connection failed
  - `error`: Database is connected but queries are failing

- **lastUpdate**: ISO 8601 timestamp of the last successful update cycle, or `null` if no updates have run

- **timestamp**: ISO 8601 timestamp of when the health check was performed

### HTTP Status Codes

- **200 OK**: System is healthy or degraded (still operational)
- **503 Service Unavailable**: System is unhealthy (database unavailable)
- **405 Method Not Allowed**: Request method is not GET

## System Status Logic

The endpoint determines system status based on the following logic:

1. **Healthy**: Database is connected AND at least one successful update cycle has completed
2. **Degraded**: Database is connected BUT either:
   - No successful update cycles have been recorded
   - Logs collection cannot be queried
3. **Unhealthy**: Database is disconnected or health check fails

## Usage Examples

### Using curl

```bash
# Check system health
curl http://localhost:3000/api/health

# Pretty print JSON response
curl http://localhost:3000/api/health | jq
```

### Using JavaScript/TypeScript

```typescript
async function checkSystemHealth() {
  const response = await fetch('/api/health');
  const data = await response.json();
  
  if (data.success) {
    console.log('System Status:', data.data.status);
    console.log('Database:', data.data.database);
    console.log('Last Update:', data.data.lastUpdate);
  }
}
```

### Monitoring Integration

The health endpoint can be integrated with monitoring tools:

```bash
# Uptime monitoring (check every 5 minutes)
*/5 * * * * curl -f http://your-domain.com/api/health || alert-team

# Prometheus monitoring
curl http://your-domain.com/api/health | jq -r '.data.status'
```

## Implementation Details

### Database Health Check

The endpoint uses `DatabaseService.isHealthy()` to verify database connectivity by:
1. Checking if the MongoDB client and database instances exist
2. Performing a ping operation to verify the database is responsive

### Last Update Timestamp

The endpoint queries the `logs` collection for the most recent log entry with:
- `component`: "UpdateOrchestrator"
- `level`: "info"
- `message`: Contains "completed successfully" (case-insensitive)

The query is sorted by `timestamp` in descending order and limited to 1 result.

### Error Handling

- Database connection failures are caught and result in "unhealthy" status
- Log query failures are caught and result in "degraded" status with database "error"
- Unexpected errors are caught and result in "unhealthy" status with 503 response

## Testing

### Unit Tests

Run the unit tests with:

```bash
npm test pages/api/health.test.ts
```

The test suite covers:
- Method validation (GET only)
- Healthy system scenarios
- Degraded system scenarios
- Unhealthy system scenarios
- Timestamp parsing (Date objects and ISO strings)
- Log query filters and sorting

### Manual Testing

Use the test script to verify the endpoint with a real database:

```bash
npx tsx scripts/test-health-endpoint.ts
```

This script:
1. Tests database connectivity
2. Checks for last successful update
3. Simulates the health endpoint response
4. Displays recent logs from the database

## Monitoring Recommendations

1. **Uptime Monitoring**: Check the endpoint every 1-5 minutes
2. **Alert Thresholds**:
   - Alert if status is "unhealthy" for more than 5 minutes
   - Warning if status is "degraded" for more than 30 minutes
   - Alert if `lastUpdate` is older than 2 hours (updates run hourly)
3. **Dashboard Metrics**:
   - System status over time
   - Database connectivity percentage
   - Time since last successful update

## Related Files

- Implementation: `pages/api/health.ts`
- Tests: `pages/api/health.test.ts`
- Test Script: `scripts/test-health-endpoint.ts`
- Database Service: `lib/services/database.ts`
- API Models: `lib/models/api.ts`
