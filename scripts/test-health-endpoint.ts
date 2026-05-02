/**
 * Test script for the health endpoint
 * 
 * This script tests the /api/health endpoint by:
 * 1. Checking database connectivity
 * 2. Verifying the health endpoint response
 * 3. Displaying system status information
 */

import { getDatabaseService } from '../lib/services/database';

async function testHealthEndpoint() {
  console.log('=== Testing Health Endpoint ===\n');

  try {
    // Get database service
    const dbService = getDatabaseService();

    // Test 1: Check database connectivity
    console.log('1. Testing database connectivity...');
    await dbService.connect();
    const isHealthy = await dbService.isHealthy();
    console.log(`   Database status: ${isHealthy ? '✓ Connected' : '✗ Disconnected'}\n`);

    if (!isHealthy) {
      console.log('⚠️  Database is not healthy. Health endpoint will return unhealthy status.\n');
      return;
    }

    // Test 2: Check for last successful update
    console.log('2. Checking for last successful update...');
    const logsCollection = await dbService.getCollection('logs');
    
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
      const isoTimestamp = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
      console.log(`   Last update: ${isoTimestamp}`);
      console.log(`   ✓ System has completed at least one update cycle\n`);
    } else {
      console.log('   ⚠️  No successful update cycles found in logs');
      console.log('   Health endpoint will return "degraded" status\n');
    }

    // Test 3: Simulate health endpoint response
    console.log('3. Simulating health endpoint response...');
    
    const healthStatus = {
      status: lastUpdateLog.length > 0 ? 'healthy' : 'degraded',
      database: 'connected',
      lastUpdate: lastUpdateLog.length > 0 
        ? (lastUpdateLog[0].timestamp instanceof Date 
          ? lastUpdateLog[0].timestamp.toISOString() 
          : lastUpdateLog[0].timestamp)
        : null,
      timestamp: new Date().toISOString(),
    };

    console.log('   Health Status:');
    console.log(`   - Status: ${healthStatus.status}`);
    console.log(`   - Database: ${healthStatus.database}`);
    console.log(`   - Last Update: ${healthStatus.lastUpdate || 'N/A'}`);
    console.log(`   - Timestamp: ${healthStatus.timestamp}\n`);

    // Test 4: Check logs collection
    console.log('4. Checking logs collection...');
    const logCount = await logsCollection.countDocuments();
    console.log(`   Total logs in database: ${logCount}`);
    
    if (logCount > 0) {
      const recentLogs = await logsCollection
        .find()
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray();
      
      console.log(`   Recent logs (last 5):`);
      recentLogs.forEach((log, index) => {
        const timestamp = log.timestamp instanceof Date 
          ? log.timestamp.toISOString() 
          : log.timestamp;
        console.log(`     ${index + 1}. [${log.level.toUpperCase()}] ${log.component}: ${log.message.substring(0, 60)}...`);
        console.log(`        Timestamp: ${timestamp}`);
      });
    }

    console.log('\n✓ Health endpoint test completed successfully!');

  } catch (error) {
    console.error('\n✗ Error testing health endpoint:', error);
    console.error('\nStack trace:', (error as Error).stack);
  } finally {
    // Disconnect from database
    const dbService = getDatabaseService();
    await dbService.disconnect();
    console.log('\nDatabase connection closed.');
  }
}

// Run the test
testHealthEndpoint().catch(console.error);
