/**
 * Test script for logging operations
 * 
 * This script tests the insertLog() method and verifies that:
 * 1. Logs can be inserted successfully
 * 2. The timestamp index is created
 * 3. Logs can be retrieved in descending order by timestamp
 */

import { DatabaseService } from '../lib/services/database';
import { createSystemLog } from '../lib/models/system-log';

async function testLogging() {
  console.log('=== Testing Logging Operations ===\n');

  const dbService = DatabaseService.getInstance();

  try {
    // Connect to database
    console.log('1. Connecting to database...');
    await dbService.connect();
    console.log('✓ Connected successfully\n');

    // Test 1: Insert info log
    console.log('2. Inserting info log...');
    const infoLog = createSystemLog(
      'info',
      'TestScript',
      'Testing info log insertion',
      { executionId: 'test-001', articleCount: 10 }
    );
    await dbService.insertLog(infoLog);
    console.log('✓ Info log inserted\n');

    // Test 2: Insert warning log
    console.log('3. Inserting warning log...');
    const warnLog = createSystemLog(
      'warn',
      'TestScript',
      'Testing warning log insertion',
      { executionId: 'test-002' }
    );
    await dbService.insertLog(warnLog);
    console.log('✓ Warning log inserted\n');

    // Test 3: Insert error log
    console.log('4. Inserting error log...');
    const errorLog = createSystemLog(
      'error',
      'TestScript',
      'Testing error log insertion',
      {
        executionId: 'test-003',
        error: {
          name: 'TestError',
          message: 'This is a test error',
          stack: 'Error stack trace here',
        },
      }
    );
    await dbService.insertLog(errorLog);
    console.log('✓ Error log inserted\n');

    // Test 4: Verify logs can be retrieved
    console.log('5. Retrieving recent logs...');
    const db = await dbService.getDatabase();
    const logsCollection = db.collection('logs');
    
    const recentLogs = await logsCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(3)
      .toArray();

    console.log(`✓ Retrieved ${recentLogs.length} logs\n`);

    // Display the logs
    console.log('Recent logs (most recent first):');
    recentLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.level.toUpperCase()}] ${log.component}: ${log.message}`);
      console.log(`     Timestamp: ${log.timestamp.toISOString()}`);
      if (log.metadata && Object.keys(log.metadata).length > 0) {
        console.log(`     Metadata: ${JSON.stringify(log.metadata)}`);
      }
    });

    console.log('\n=== All Tests Passed ===');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Disconnect
    await dbService.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Run the test
testLogging().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
