/**
 * POST /api/cron/update endpoint
 * 
 * Triggers the automated news update cycle.
 * This endpoint is called by Vercel cron jobs every hour.
 * 
 * Security:
 * - Verifies Vercel cron secret from request headers
 * - Only accepts POST requests
 * 
 * Requirements: 11.1, 11.5, 12.4
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { UpdateOrchestratorService } from '../../../lib/services/update-orchestrator';
import type { ApiResponse, UpdateApiResponse, ApiErrorResponse, UpdateCycleMetrics } from '../../../lib/models/api';

/**
 * Handler for POST /api/cron/update
 * 
 * Verifies cron secret, executes update cycle, and returns execution metrics.
 * Logs all requests with response status.
 * 
 * Requirements: 11.1, 11.5, 12.4
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const requestStartTime = Date.now();
  const requestTimestamp = new Date().toISOString();

  // Log incoming request (Requirement: 12.4)
  console.log(`[${requestTimestamp}] POST /api/cron/update - Request received`);

  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are allowed',
      },
    };

    // Log request with response status (Requirement: 12.4)
    const requestDuration = Date.now() - requestStartTime;
    console.log(
      `[${new Date().toISOString()}] POST /api/cron/update - Status: 405 - Duration: ${requestDuration}ms`
    );

    return res.status(405).json(errorResponse);
  }

  try {
    // Verify Vercel cron secret from request headers
    // Vercel sends the secret in the 'authorization' header as 'Bearer <secret>'
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[API /cron/update] CRON_SECRET environment variable is not configured');
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'SERVER_CONFIGURATION_ERROR',
          message: 'Cron secret is not configured on the server',
        },
      };

      // Log request with response status (Requirement: 12.4)
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        `[${new Date().toISOString()}] POST /api/cron/update - Status: 500 - Duration: ${requestDuration}ms - Error: CRON_SECRET not configured`
      );

      return res.status(500).json(errorResponse);
    }

    // Verify authorization header
    if (!authHeader) {
      console.warn('[API /cron/update] Missing authorization header');
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization header',
        },
      };

      // Log request with response status (Requirement: 12.4)
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        `[${new Date().toISOString()}] POST /api/cron/update - Status: 401 - Duration: ${requestDuration}ms - Error: Missing auth header`
      );

      return res.status(401).json(errorResponse);
    }

    // Extract token from 'Bearer <token>' format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verify the token matches the configured secret
    if (token !== cronSecret) {
      console.warn('[API /cron/update] Invalid cron secret provided');
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization credentials',
        },
      };

      // Log request with response status (Requirement: 12.4)
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        `[${new Date().toISOString()}] POST /api/cron/update - Status: 401 - Duration: ${requestDuration}ms - Error: Invalid secret`
      );

      return res.status(401).json(errorResponse);
    }

    // Authorization successful, execute update cycle
    console.log('[API /cron/update] Authorization successful, starting update cycle');

    // Create UpdateOrchestratorService instance and execute update cycle
    const orchestrator = new UpdateOrchestratorService();
    const result = await orchestrator.executeUpdateCycle();

    // Convert result to API response format
    const metrics: UpdateCycleMetrics = {
      articlesProcessed: result.articlesProcessed,
      articlesStored: result.articlesStored,
      duplicatesSkipped: result.duplicatesSkipped,
      duration: result.duration,
      timestamp: result.timestamp.toISOString(),
    };

    const successResponse: UpdateApiResponse = {
      success: true,
      data: metrics,
    };

    // Log request with response status and metrics (Requirement: 12.4)
    const requestDuration = Date.now() - requestStartTime;
    console.log(
      `[${new Date().toISOString()}] POST /api/cron/update - Status: 200 - Duration: ${requestDuration}ms - ` +
      `Articles: ${metrics.articlesStored}/${metrics.articlesProcessed} stored, ${metrics.duplicatesSkipped} duplicates skipped`
    );

    return res.status(200).json(successResponse);

  } catch (error) {
    console.error('[API /cron/update] Error executing update cycle:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's a concurrent execution error
    if (errorMessage.includes('Previous cycle is still running')) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'CONCURRENT_EXECUTION',
          message: 'Update cycle is already running. Please try again later.',
        },
      };

      // Log request with response status (Requirement: 12.4)
      const requestDuration = Date.now() - requestStartTime;
      console.log(
        `[${new Date().toISOString()}] POST /api/cron/update - Status: 409 - Duration: ${requestDuration}ms - Error: Concurrent execution`
      );

      return res.status(409).json(errorResponse);
    }

    // Generic error response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'UPDATE_CYCLE_FAILED',
        message: 'Failed to execute update cycle. Please check server logs for details.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
    };

    // Log request with response status (Requirement: 12.4)
    const requestDuration = Date.now() - requestStartTime;
    console.log(
      `[${new Date().toISOString()}] POST /api/cron/update - Status: 500 - Duration: ${requestDuration}ms - Error: ${errorMessage}`
    );

    return res.status(500).json(errorResponse);
  }
}
