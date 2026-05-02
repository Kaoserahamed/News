/**
 * Manual test script for UpdateOrchestratorService
 * 
 * This script tests the complete update cycle orchestration.
 * Run with: npx ts-node scripts/test-update-orchestrator.ts
 */

import { UpdateOrchestratorService } from '../lib/services/update-orchestrator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testUpdateOrchestrator() {
  console.log('=== Testing UpdateOrchestratorService ===\n');

  try {
    // Create orchestrator instance
    const orchestrator = new UpdateOrchestratorService();

    console.log('Starting update cycle...\n');

    // Execute update cycle
    const result = await orchestrator.executeUpdateCycle();

    console.log('\n=== Update Cycle Completed ===');
    console.log('Execution ID:', result.executionId);
    console.log('Articles Processed:', result.articlesProcessed);
    console.log('Articles Stored:', result.articlesStored);
    console.log('Duplicates Skipped:', result.duplicatesSkipped);
    console.log('Duration:', result.duration, 'ms');
    console.log('Timestamp:', result.timestamp.toISOString());

    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testUpdateOrchestrator();
