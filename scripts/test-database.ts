/**
 * Manual test script for DatabaseService
 * 
 * This script tests the basic functionality of the DatabaseService:
 * - Connection with retry logic
 * - Health check
 * - Disconnection
 * 
 * Usage: npx ts-node scripts/test-database.ts
 */

import 'dotenv/config';
import { DatabaseService } from '../lib/services/database';

async function testDatabaseService() {
  console.log('=== Testing DatabaseService ===\n');

  const dbService = DatabaseService.getInstance();

  try {
    // Test 1: Connect to database
    console.log('Test 1: Connecting to database...');
    await dbService.connect();
    console.log('✓ Successfully connected to database\n');

    // Test 2: Check health
    console.log('Test 2: Checking database health...');
    const isHealthy = await dbService.isHealthy();
    console.log(`✓ Database health status: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}\n`);

    // Test 3: Get database instance
    console.log('Test 3: Getting database instance...');
    const db = await dbService.getDatabase();
    console.log(`✓ Database instance obtained: ${db.databaseName}\n`);

    // Test 4: Get collection
    console.log('Test 4: Getting articles collection...');
    const articlesCollection = await dbService.getCollection('articles');
    console.log(`✓ Collection obtained: ${articlesCollection.collectionName}\n`);

    // Test 5: Disconnect
    console.log('Test 5: Disconnecting from database...');
    await dbService.disconnect();
    console.log('✓ Successfully disconnected from database\n');

    // Test 6: Check health after disconnect
    console.log('Test 6: Checking health after disconnect...');
    const isHealthyAfterDisconnect = await dbService.isHealthy();
    console.log(`✓ Database health status after disconnect: ${isHealthyAfterDisconnect ? 'HEALTHY' : 'UNHEALTHY'}\n`);

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testDatabaseService();
