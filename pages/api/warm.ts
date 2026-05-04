/**
 * GET /api/warm endpoint
 * 
 * Warms up the database connection to prevent cold starts.
 * Should be called periodically (e.g., every 5 minutes via cron).
 * 
 * This endpoint:
 * 1. Establishes database connection
 * 2. Performs a lightweight query
 * 3. Keeps connection in cache for subsequent requests
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabaseService } from '../../lib/services/database';

interface WarmResponse {
  success: boolean;
  message: string;
  timestamp: string;
  connectionCached: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WarmResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Only GET requests are allowed',
      timestamp: new Date().toISOString(),
      connectionCached: false,
    });
  }

  try {
    const startTime = Date.now();
    
    // Get database service instance
    const dbService = getDatabaseService();
    
    // Check if connection is already cached
    const wasCached = await dbService.isHealthy();
    
    // Ensure connection is established
    if (!wasCached) {
      await dbService.connect();
    }
    
    // Perform a lightweight query to keep connection active
    // Just count documents (uses metadata, very fast)
    const db = await dbService.getDatabase();
    const articlesCollection = db.collection('articles');
    await articlesCollection.estimatedDocumentCount();
    
    const duration = Date.now() - startTime;
    
    console.log(`[API /warm] Connection warmed in ${duration}ms (cached: ${wasCached})`);
    
    return res.status(200).json({
      success: true,
      message: `Connection warmed successfully in ${duration}ms`,
      timestamp: new Date().toISOString(),
      connectionCached: wasCached,
    });
  } catch (error) {
    console.error('[API /warm] Error warming connection:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to warm connection',
      timestamp: new Date().toISOString(),
      connectionCached: false,
    });
  }
}
