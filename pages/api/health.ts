/**
 * GET /api/health endpoint
 * 
 * Provides health check information for monitoring the system.
 * Returns system status, database connectivity, and last successful update time.
 * 
 * Requirements: 12.5
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabaseService } from '../../lib/services/database';
import type { ApiResponse, HealthApiResponse, HealthStatus, ApiErrorResponse } from '../../lib/models/api';

/**
 * Handler for GET /api/health
 * 
 * Checks database connectivity and queries last successful update timestamp.
 * Returns system health status with database status and last update time.
 * 
 * Requirements: 12.5
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET requests are allowed',
      },
    };
    return res.status(405).json(errorResponse);
  }

  try {
    const currentTimestamp = new Date().toISOString();
    
    // Get database service instance
    const dbService = getDatabaseService();

    // Check database connectivity
    const isDatabaseHealthy = await dbService.isHealthy();
    
    let databaseStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
    let lastUpdateTimestamp: string | null = null;
    let systemStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';

    if (isDatabaseHealthy) {
      databaseStatus = 'connected';
      
      try {
        // Query last successful update timestamp from logs
        lastUpdateTimestamp = await getLastSuccessfulUpdate(dbService);
        
        // Determine system status based on database and last update
        if (lastUpdateTimestamp) {
          systemStatus = 'healthy';
        } else {
          // Database is connected but no updates have run yet
          systemStatus = 'degraded';
        }
      } catch (error) {
        console.error('[API /health] Error querying last update timestamp:', error);
        // Database is connected but we can't query logs
        databaseStatus = 'error';
        systemStatus = 'degraded';
      }
    } else {
      // Database is not healthy
      databaseStatus = 'disconnected';
      systemStatus = 'unhealthy';
    }

    // Build health status response
    const healthStatus: HealthStatus = {
      status: systemStatus,
      database: databaseStatus,
      lastUpdate: lastUpdateTimestamp,
      timestamp: currentTimestamp,
    };

    const successResponse: HealthApiResponse = {
      success: true,
      data: healthStatus,
    };

    // Return appropriate HTTP status code based on system health
    const httpStatus = systemStatus === 'healthy' ? 200 : systemStatus === 'degraded' ? 200 : 503;
    
    return res.status(httpStatus).json(successResponse);

  } catch (error) {
    console.error('[API /health] Error processing health check:', error);

    // Return unhealthy status on unexpected errors
    const healthStatus: HealthStatus = {
      status: 'unhealthy',
      database: 'error',
      lastUpdate: null,
      timestamp: new Date().toISOString(),
    };

    const successResponse: HealthApiResponse = {
      success: true,
      data: healthStatus,
    };

    return res.status(503).json(successResponse);
  }
}

/**
 * Query the last successful update timestamp from system logs
 * 
 * Looks for the most recent log entry with:
 * - component: 'UpdateOrchestrator'
 * - level: 'info'
 * - message containing 'completed successfully'
 * 
 * @param dbService DatabaseService instance
 * @returns ISO 8601 timestamp string or null if no successful update found
 */
async function getLastSuccessfulUpdate(dbService: any): Promise<string | null> {
  try {
    // Get the logs collection
    const logsCollection = await dbService.getCollection('logs');

    // Query for the most recent successful update cycle log
    const lastUpdateLog = await logsCollection
      .find({
        component: 'UpdateOrchestrator',
        level: 'info',
        message: { $regex: /completed successfully/i },
      })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (lastUpdateLog.length > 0) {
      const timestamp = lastUpdateLog[0].timestamp;
      // Convert to ISO 8601 string if it's a Date object
      return timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    }

    return null;
  } catch (error) {
    console.error('[API /health] Error querying logs collection:', error);
    throw error;
  }
}
