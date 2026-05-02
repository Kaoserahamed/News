/**
 * Manual test script for POST /api/cron/update endpoint
 * 
 * This script simulates a cron job request to test the endpoint.
 * Run with: npx ts-node scripts/test-cron-endpoint.ts
 */

import { UpdateOrchestratorService } from '../lib/services/update-orchestrator';

async function testCronEndpoint() {
  console.log('=== Testing Cron Update Endpoint Logic ===\n');

  try {
    console.log('Creating UpdateOrchestratorService instance...');
    const orchestrator = new UpdateOrchestratorService();

    console.log('Executing update cycle...\n');
    const result = await orchestrator.executeUpdateCycle();

    console.log('\n=== Update Cycle Result ===');
    console.log(`Execution ID: ${result.executionId}`);
    console.log(`Articles Processed: ${result.articlesProcessed}`);
    console.log(`Articles Stored: ${result.articlesStored}`);
    console.log(`Duplicates Skipped: ${result.duplicatesSkipped}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Timestamp: ${result.timestamp.toISOString()}`);

    console.log('\n=== API Response Format ===');
    const apiResponse = {
      success: true,
      data: {
        articlesProcessed: result.articlesProcessed,
        articlesStored: result.articlesStored,
        duplicatesSkipped: result.duplicatesSkipped,
        duration: result.duration,
        timestamp: result.timestamp.toISOString(),
      },
    };
    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testCronEndpoint();
