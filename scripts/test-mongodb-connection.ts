/**
 * Test MongoDB Atlas Connection
 * 
 * This script tests the MongoDB connection using the MONGODB_URI environment variable.
 * Use this to verify your connection string is correct before deploying to Vercel.
 * 
 * Usage:
 *   npm run test:mongodb-connection
 * 
 * Requirements: 4.1 (Data Storage and Persistence)
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import { getDatabaseService } from '../lib/services/database';

async function testMongoDBConnection() {
  console.log('='.repeat(60));
  console.log('MongoDB Atlas Connection Test');
  console.log('='.repeat(60));
  console.log();

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not set');
    console.log();
    console.log('Please set MONGODB_URI in your .env file:');
    console.log('  MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>');
    console.log();
    process.exit(1);
  }

  console.log('✓ MONGODB_URI environment variable is set');
  
  // Mask the connection string for security (show only the cluster address)
  const maskedUri = process.env.MONGODB_URI.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    'mongodb+srv://***:***@'
  );
  console.log(`  Connection string: ${maskedUri}`);
  console.log();

  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    
    const dbService = getDatabaseService();
    
    // Test connection health
    const isHealthy = await dbService.isHealthy();
    
    if (!isHealthy) {
      console.error('❌ ERROR: Database connection is not healthy');
      console.log();
      console.log('Possible issues:');
      console.log('  1. Incorrect username or password in connection string');
      console.log('  2. Network access not configured in MongoDB Atlas');
      console.log('  3. Database cluster is not running');
      console.log('  4. Invalid cluster address');
      console.log();
      console.log('Troubleshooting steps:');
      console.log('  1. Verify credentials in MongoDB Atlas → Database Access');
      console.log('  2. Add 0.0.0.0/0 to Network Access (for Vercel deployment)');
      console.log('  3. Check cluster status in MongoDB Atlas dashboard');
      console.log();
      process.exit(1);
    }

    console.log('✓ Successfully connected to MongoDB Atlas');
    console.log();

    // Test database operations
    console.log('Testing database operations...');
    
    // Test 1: Check if collections exist
    console.log('  - Checking collections...');
    const articlesCollection = await dbService.getCollection('articles');
    const logsCollection = await dbService.getCollection('logs');
    console.log('    ✓ Articles collection accessible');
    console.log('    ✓ Logs collection accessible');
    
    // Test 2: Count documents
    const articleCount = await articlesCollection.countDocuments();
    const logCount = await logsCollection.countDocuments();
    console.log(`    ✓ Articles in database: ${articleCount}`);
    console.log(`    ✓ Logs in database: ${logCount}`);
    
    // Test 3: Test write operation (insert and delete a test document)
    console.log('  - Testing write operations...');
    const testDoc = {
      _test: true,
      timestamp: new Date(),
      message: 'Connection test document',
    };
    
    const insertResult = await logsCollection.insertOne(testDoc);
    console.log('    ✓ Write operation successful');
    
    // Clean up test document
    await logsCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('    ✓ Delete operation successful');
    
    console.log();
    console.log('='.repeat(60));
    console.log('✅ All tests passed! MongoDB connection is working correctly.');
    console.log('='.repeat(60));
    console.log();
    console.log('Your application is ready to deploy to Vercel.');
    console.log();
    console.log('Next steps:');
    console.log('  1. Set MONGODB_URI in Vercel environment variables');
    console.log('  2. Generate and set CRON_SECRET in Vercel environment variables');
    console.log('  3. Deploy to Vercel');
    console.log('  4. Test /api/health endpoint');
    console.log('  5. Manually trigger /api/cron/update endpoint');
    console.log();
    console.log('See DEPLOYMENT_CONFIGURATION.md for detailed instructions.');
    console.log();

    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR: Failed to connect to MongoDB Atlas');
    console.log();
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      // Provide specific guidance based on error type
      if (error.message.includes('authentication failed')) {
        console.log();
        console.log('Authentication failed. Please check:');
        console.log('  1. Username and password are correct');
        console.log('  2. User has read/write permissions in MongoDB Atlas');
        console.log('  3. Password special characters are URL-encoded');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log();
        console.log('Network error. Please check:');
        console.log('  1. Cluster address is correct');
        console.log('  2. Internet connection is working');
        console.log('  3. Firewall is not blocking MongoDB connections');
      } else if (error.message.includes('timeout')) {
        console.log();
        console.log('Connection timeout. Please check:');
        console.log('  1. Network access is configured in MongoDB Atlas');
        console.log('  2. Add 0.0.0.0/0 to IP Access List for Vercel');
        console.log('  3. Cluster is running and accessible');
      }
    } else {
      console.error('Error:', error);
    }
    
    console.log();
    console.log('For more help, see:');
    console.log('  - DEPLOYMENT_CONFIGURATION.md (Troubleshooting section)');
    console.log('  - MongoDB Atlas documentation: https://www.mongodb.com/docs/atlas/');
    console.log();
    
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection();
