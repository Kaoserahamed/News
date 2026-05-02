/**
 * Test script for DuplicateDetectorService database integration
 * 
 * This script tests the new database-backed duplicate detection methods:
 * - checkURLDuplicateFromDB()
 * - checkTitleSimilarityFromDB()
 * - isDuplicateFromDB()
 * 
 * These methods query only articles from the last 7 days for optimization.
 */

import { DuplicateDetectorService } from '../lib/services/duplicate-detector';
import { DatabaseService } from '../lib/services/database';
import { ProcessedArticle } from '../lib/models/article';
import { Category } from '../lib/models/category';

async function testDuplicateDetectorDB() {
  console.log('=== Testing DuplicateDetectorService Database Integration ===\n');

  const dbService = DatabaseService.getInstance();
  const duplicateDetector = new DuplicateDetectorService(dbService);

  try {
    // Connect to database
    console.log('1. Connecting to database...');
    await dbService.connect();
    console.log('✓ Connected to database\n');

    // Test article
    const testArticle: ProcessedArticle = {
      title: 'Test Article for Duplicate Detection',
      summary: 'This is a test article to verify duplicate detection works with database',
      content: 'Full content of the test article',
      url: 'https://example.com/test-duplicate-detection-' + Date.now(),
      source: 'Test Source',
      category: Category.TECHNOLOGY,
      publishedAt: new Date(),
      processedAt: new Date(),
    };

    // Test 1: Check URL duplicate (should be false for new article)
    console.log('2. Testing checkURLDuplicateFromDB() with new URL...');
    const urlDuplicate1 = await duplicateDetector.checkURLDuplicateFromDB(testArticle.url);
    console.log(`   Result: ${urlDuplicate1}`);
    console.log(`   ${urlDuplicate1 ? '✗ FAIL' : '✓ PASS'} - New URL should not be a duplicate\n`);

    // Test 2: Check title similarity (should be false for new title)
    console.log('3. Testing checkTitleSimilarityFromDB() with new title...');
    const titleSimilar1 = await duplicateDetector.checkTitleSimilarityFromDB(testArticle.title);
    console.log(`   Result: ${titleSimilar1}`);
    console.log(`   ${titleSimilar1 ? '✗ FAIL' : '✓ PASS'} - New title should not be similar\n`);

    // Test 3: Check if article is duplicate (should be false)
    console.log('4. Testing isDuplicateFromDB() with new article...');
    const isDuplicate1 = await duplicateDetector.isDuplicateFromDB(testArticle);
    console.log(`   Result: ${isDuplicate1}`);
    console.log(`   ${isDuplicate1 ? '✗ FAIL' : '✓ PASS'} - New article should not be a duplicate\n`);

    // Insert the test article
    console.log('5. Inserting test article into database...');
    const articleId = await dbService.insertArticle(testArticle);
    console.log(`✓ Article inserted with ID: ${articleId}\n`);

    // Test 4: Check URL duplicate (should be true now)
    console.log('6. Testing checkURLDuplicateFromDB() with existing URL...');
    const urlDuplicate2 = await duplicateDetector.checkURLDuplicateFromDB(testArticle.url);
    console.log(`   Result: ${urlDuplicate2}`);
    console.log(`   ${urlDuplicate2 ? '✓ PASS' : '✗ FAIL'} - Existing URL should be detected as duplicate\n`);

    // Test 5: Check title similarity (should be true now)
    console.log('7. Testing checkTitleSimilarityFromDB() with existing title...');
    const titleSimilar2 = await duplicateDetector.checkTitleSimilarityFromDB(testArticle.title);
    console.log(`   Result: ${titleSimilar2}`);
    console.log(`   ${titleSimilar2 ? '✓ PASS' : '✗ FAIL'} - Existing title should be detected as similar\n`);

    // Test 6: Check if article is duplicate (should be true now)
    console.log('8. Testing isDuplicateFromDB() with existing article...');
    const isDuplicate2 = await duplicateDetector.isDuplicateFromDB(testArticle);
    console.log(`   Result: ${isDuplicate2}`);
    console.log(`   ${isDuplicate2 ? '✓ PASS' : '✗ FAIL'} - Existing article should be detected as duplicate\n`);

    // Test 7: Check with slightly different title (>90% similar)
    console.log('9. Testing checkTitleSimilarityFromDB() with similar title...');
    const similarTitle = testArticle.title + '!'; // Add one character
    const titleSimilar3 = await duplicateDetector.checkTitleSimilarityFromDB(similarTitle);
    console.log(`   Original: "${testArticle.title}"`);
    console.log(`   Similar:  "${similarTitle}"`);
    console.log(`   Result: ${titleSimilar3}`);
    console.log(`   ${titleSimilar3 ? '✓ PASS' : '✗ FAIL'} - Similar title should be detected (>90% threshold)\n`);

    // Test 8: Check with different URL but similar title
    console.log('10. Testing isDuplicateFromDB() with different URL but similar title...');
    const articleWithSimilarTitle: ProcessedArticle = {
      ...testArticle,
      url: 'https://example.com/different-url-' + Date.now(),
    };
    const isDuplicate3 = await duplicateDetector.isDuplicateFromDB(articleWithSimilarTitle);
    console.log(`   Result: ${isDuplicate3}`);
    console.log(`   ${isDuplicate3 ? '✓ PASS' : '✗ FAIL'} - Article with similar title should be detected as duplicate\n`);

    console.log('=== All Tests Completed ===');
    console.log('\nNote: The test article was inserted into the database.');
    console.log('It will be automatically cleaned up after 30 days (per requirement 4.4).');

  } catch (error) {
    console.error('\n✗ Error during testing:', error);
    throw error;
  } finally {
    // Disconnect from database
    console.log('\nDisconnecting from database...');
    await dbService.disconnect();
    console.log('✓ Disconnected from database');
  }
}

// Run the test
testDuplicateDetectorDB()
  .then(() => {
    console.log('\n✓ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test script failed:', error);
    process.exit(1);
  });
