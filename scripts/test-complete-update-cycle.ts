/**
 * Task 15.2: Test Complete Update Cycle
 * 
 * This script tests the complete end-to-end update cycle by:
 * 1. Manually triggering the /api/cron/update endpoint
 * 2. Verifying articles are fetched, processed, and stored
 * 3. Checking database for stored articles with correct structure
 * 4. Verifying duplicates are detected and skipped
 * 5. Checking logs for execution metrics
 * 
 * Requirements: 1.1, 1.5, 3.1, 3.2, 3.3, 11.1, 11.2, 11.3, 12.1
 * 
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/test-complete-update-cycle.ts
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { DatabaseService } from '../lib/services/database';
import { UpdateOrchestratorService } from '../lib/services/update-orchestrator';
import { Category } from '../lib/models/category';

interface TestResult {
  passed: boolean;
  message: string;
  details?: any;
}

class UpdateCycleTestSuite {
  private db: DatabaseService;
  private results: TestResult[] = [];

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  /**
   * Log test result
   */
  private logResult(result: TestResult): void {
    this.results.push(result);
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  }

  /**
   * Test 1: Manually trigger /api/cron/update endpoint logic
   * Requirements: 11.1, 11.2
   */
  async testTriggerUpdateCycle(): Promise<void> {
    console.log('\n=== Test 1: Trigger Update Cycle ===\n');

    try {
      console.log('Creating UpdateOrchestratorService instance...');
      const orchestrator = new UpdateOrchestratorService();

      console.log('Executing update cycle...');
      const startTime = Date.now();
      const result = await orchestrator.executeUpdateCycle();
      const duration = Date.now() - startTime;

      console.log('\nUpdate Cycle Result:');
      console.log(`  Execution ID: ${result.executionId}`);
      console.log(`  Articles Processed: ${result.articlesProcessed}`);
      console.log(`  Articles Stored: ${result.articlesStored}`);
      console.log(`  Duplicates Skipped: ${result.duplicatesSkipped}`);
      console.log(`  Duration: ${result.duration}ms (actual: ${duration}ms)`);
      console.log(`  Timestamp: ${result.timestamp.toISOString()}`);

      // Verify result structure
      if (typeof result.articlesProcessed !== 'number') {
        this.logResult({
          passed: false,
          message: 'articlesProcessed should be a number',
          details: { type: typeof result.articlesProcessed },
        });
        return;
      }

      if (typeof result.articlesStored !== 'number') {
        this.logResult({
          passed: false,
          message: 'articlesStored should be a number',
          details: { type: typeof result.articlesStored },
        });
        return;
      }

      if (typeof result.duplicatesSkipped !== 'number') {
        this.logResult({
          passed: false,
          message: 'duplicatesSkipped should be a number',
          details: { type: typeof result.duplicatesSkipped },
        });
        return;
      }

      if (typeof result.duration !== 'number') {
        this.logResult({
          passed: false,
          message: 'duration should be a number',
          details: { type: typeof result.duration },
        });
        return;
      }

      if (!(result.timestamp instanceof Date)) {
        this.logResult({
          passed: false,
          message: 'timestamp should be a Date object',
          details: { type: typeof result.timestamp },
        });
        return;
      }

      // Verify metrics make sense
      const totalProcessed = result.articlesStored + result.duplicatesSkipped;
      if (totalProcessed > result.articlesProcessed) {
        this.logResult({
          passed: false,
          message: 'Stored + Duplicates should not exceed Processed',
          details: {
            processed: result.articlesProcessed,
            stored: result.articlesStored,
            duplicates: result.duplicatesSkipped,
            total: totalProcessed,
          },
        });
        return;
      }

      this.logResult({
        passed: true,
        message: 'Update cycle executed successfully',
        details: {
          articlesProcessed: result.articlesProcessed,
          articlesStored: result.articlesStored,
          duplicatesSkipped: result.duplicatesSkipped,
          duration: result.duration,
        },
      });

      // Store result for later tests
      (this as any).updateResult = result;
    } catch (error) {
      this.logResult({
        passed: false,
        message: 'Update cycle failed with error',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Test 2: Verify articles are stored in database with correct structure
   * Requirements: 1.1, 1.5, 3.1
   */
  async testDatabaseStorage(): Promise<void> {
    console.log('\n=== Test 2: Verify Database Storage ===\n');

    try {
      // Connect to database
      await this.db.connect();

      // Query recent articles
      console.log('Querying recent articles from database...');
      const result = await this.db.findArticles({
        page: 1,
        limit: 10,
        sortBy: 'processedAt',
        sortOrder: 'desc',
      });

      console.log(`Found ${result.articles.length} articles (total: ${result.pagination.total})`);

      if (result.articles.length === 0) {
        this.logResult({
          passed: false,
          message: 'No articles found in database',
          details: { total: result.pagination.total },
        });
        return;
      }

      // Verify article structure
      const article = result.articles[0];
      console.log('\nSample Article:');
      console.log(`  ID: ${article.id}`);
      console.log(`  Title: ${article.title.substring(0, 60)}...`);
      console.log(`  Summary: ${article.summary.substring(0, 80)}...`);
      console.log(`  URL: ${article.url}`);
      console.log(`  Source: ${article.source}`);
      console.log(`  Category: ${article.category}`);
      console.log(`  Published At: ${article.publishedAt.toISOString()}`);
      console.log(`  Processed At: ${article.processedAt.toISOString()}`);

      // Verify required fields
      const requiredFields = ['id', 'title', 'summary', 'url', 'source', 'category', 'publishedAt', 'processedAt'];
      const missingFields = requiredFields.filter(field => !(field in article) || !article[field as keyof typeof article]);

      if (missingFields.length > 0) {
        this.logResult({
          passed: false,
          message: 'Article missing required fields',
          details: { missingFields },
        });
        return;
      }

      // Verify field types
      if (typeof article.id !== 'string') {
        this.logResult({
          passed: false,
          message: 'Article ID should be a string',
          details: { type: typeof article.id },
        });
        return;
      }

      if (typeof article.title !== 'string' || article.title.length === 0) {
        this.logResult({
          passed: false,
          message: 'Article title should be a non-empty string',
          details: { type: typeof article.title, length: article.title?.length },
        });
        return;
      }

      if (typeof article.summary !== 'string' || article.summary.length === 0) {
        this.logResult({
          passed: false,
          message: 'Article summary should be a non-empty string',
          details: { type: typeof article.summary, length: article.summary?.length },
        });
        return;
      }

      if (typeof article.url !== 'string' || !article.url.startsWith('http')) {
        this.logResult({
          passed: false,
          message: 'Article URL should be a valid HTTP(S) URL',
          details: { url: article.url },
        });
        return;
      }

      if (typeof article.source !== 'string' || article.source.length === 0) {
        this.logResult({
          passed: false,
          message: 'Article source should be a non-empty string',
          details: { type: typeof article.source, length: article.source?.length },
        });
        return;
      }

      // Verify category is valid
      const validCategories = Object.values(Category);
      if (!validCategories.includes(article.category)) {
        this.logResult({
          passed: false,
          message: 'Article category should be a valid Category enum value',
          details: { category: article.category, validCategories },
        });
        return;
      }

      // Verify dates
      if (!(article.publishedAt instanceof Date) || isNaN(article.publishedAt.getTime())) {
        this.logResult({
          passed: false,
          message: 'Article publishedAt should be a valid Date',
          details: { publishedAt: article.publishedAt },
        });
        return;
      }

      if (!(article.processedAt instanceof Date) || isNaN(article.processedAt.getTime())) {
        this.logResult({
          passed: false,
          message: 'Article processedAt should be a valid Date',
          details: { processedAt: article.processedAt },
        });
        return;
      }

      // Verify summary length constraint (max 300 characters)
      if (article.summary.length > 300) {
        this.logResult({
          passed: false,
          message: 'Article summary exceeds 300 character limit',
          details: { length: article.summary.length },
        });
        return;
      }

      this.logResult({
        passed: true,
        message: 'Articles stored with correct structure',
        details: {
          totalArticles: result.pagination.total,
          sampleArticleId: article.id,
          sampleCategory: article.category,
        },
      });
    } catch (error) {
      this.logResult({
        passed: false,
        message: 'Database storage verification failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Test 3: Verify duplicate detection
   * Requirements: 3.1, 3.2, 3.3
   */
  async testDuplicateDetection(): Promise<void> {
    console.log('\n=== Test 3: Verify Duplicate Detection ===\n');

    try {
      const updateResult = (this as any).updateResult;

      if (!updateResult) {
        this.logResult({
          passed: false,
          message: 'No update result available from previous test',
        });
        return;
      }

      console.log('Duplicate Detection Metrics:');
      console.log(`  Articles Processed: ${updateResult.articlesProcessed}`);
      console.log(`  Articles Stored: ${updateResult.articlesStored}`);
      console.log(`  Duplicates Skipped: ${updateResult.duplicatesSkipped}`);

      // If duplicates were skipped, that's good
      if (updateResult.duplicatesSkipped > 0) {
        console.log(`\n✓ Duplicate detection is working (${updateResult.duplicatesSkipped} duplicates skipped)`);
      } else {
        console.log('\n⚠ No duplicates detected in this run (may be expected for first run)');
      }

      // Run a second update cycle to test duplicate detection
      console.log('\nRunning second update cycle to test duplicate detection...');
      const orchestrator = new UpdateOrchestratorService();
      const secondResult = await orchestrator.executeUpdateCycle();

      console.log('\nSecond Update Cycle Result:');
      console.log(`  Articles Processed: ${secondResult.articlesProcessed}`);
      console.log(`  Articles Stored: ${secondResult.articlesStored}`);
      console.log(`  Duplicates Skipped: ${secondResult.duplicatesSkipped}`);

      // In the second run, we expect most articles to be duplicates
      if (secondResult.articlesProcessed > 0) {
        const duplicateRate = (secondResult.duplicatesSkipped / secondResult.articlesProcessed) * 100;
        console.log(`  Duplicate Rate: ${duplicateRate.toFixed(1)}%`);

        // We expect at least 50% duplicates in the second run
        if (duplicateRate >= 50) {
          this.logResult({
            passed: true,
            message: 'Duplicate detection working correctly',
            details: {
              firstRun: {
                processed: updateResult.articlesProcessed,
                stored: updateResult.articlesStored,
                duplicates: updateResult.duplicatesSkipped,
              },
              secondRun: {
                processed: secondResult.articlesProcessed,
                stored: secondResult.articlesStored,
                duplicates: secondResult.duplicatesSkipped,
                duplicateRate: `${duplicateRate.toFixed(1)}%`,
              },
            },
          });
        } else {
          this.logResult({
            passed: false,
            message: 'Duplicate detection rate lower than expected',
            details: {
              expected: '>=50%',
              actual: `${duplicateRate.toFixed(1)}%`,
              secondRun: secondResult,
            },
          });
        }
      } else {
        this.logResult({
          passed: false,
          message: 'Second update cycle processed no articles',
          details: secondResult,
        });
      }
    } catch (error) {
      this.logResult({
        passed: false,
        message: 'Duplicate detection test failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Test 4: Verify execution metrics are logged
   * Requirements: 11.3, 12.1
   */
  async testExecutionLogging(): Promise<void> {
    console.log('\n=== Test 4: Verify Execution Logging ===\n');

    try {
      // Query logs from database
      console.log('Querying system logs from database...');
      const logsCollection = await this.db.getCollection('logs');
      
      // Get recent logs (last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const logs = await logsCollection
        .find({
          timestamp: { $gte: tenMinutesAgo },
          component: 'UpdateOrchestrator',
        })
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray();

      console.log(`Found ${logs.length} UpdateOrchestrator logs in the last 10 minutes`);

      if (logs.length === 0) {
        this.logResult({
          passed: false,
          message: 'No UpdateOrchestrator logs found',
          details: { timeRange: 'last 10 minutes' },
        });
        return;
      }

      // Display sample logs
      console.log('\nSample Logs:');
      logs.slice(0, 5).forEach((log, index) => {
        console.log(`\n  Log ${index + 1}:`);
        console.log(`    Level: ${log.level}`);
        console.log(`    Message: ${log.message}`);
        console.log(`    Timestamp: ${log.timestamp.toISOString()}`);
        if (log.metadata) {
          console.log(`    Metadata:`, JSON.stringify(log.metadata, null, 6));
        }
      });

      // Verify log structure
      const sampleLog = logs[0];
      const requiredFields = ['level', 'component', 'message', 'timestamp'];
      const missingFields = requiredFields.filter(field => !(field in sampleLog));

      if (missingFields.length > 0) {
        this.logResult({
          passed: false,
          message: 'Log entry missing required fields',
          details: { missingFields },
        });
        return;
      }

      // Check for specific log types
      const hasStartLog = logs.some(log => log.message.includes('Update cycle started'));
      const hasCompletionLog = logs.some(log => log.message.includes('Update cycle completed'));
      const hasMetricsLog = logs.some(log => 
        log.metadata && 
        ('articleCount' in log.metadata || 'articlesStored' in log.metadata)
      );

      console.log('\nLog Type Coverage:');
      console.log(`  Start Log: ${hasStartLog ? '✓' : '✗'}`);
      console.log(`  Completion Log: ${hasCompletionLog ? '✓' : '✗'}`);
      console.log(`  Metrics Log: ${hasMetricsLog ? '✓' : '✗'}`);

      if (hasStartLog && hasCompletionLog && hasMetricsLog) {
        this.logResult({
          passed: true,
          message: 'Execution metrics are properly logged',
          details: {
            totalLogs: logs.length,
            hasStartLog,
            hasCompletionLog,
            hasMetricsLog,
          },
        });
      } else {
        this.logResult({
          passed: false,
          message: 'Missing expected log types',
          details: {
            hasStartLog,
            hasCompletionLog,
            hasMetricsLog,
          },
        });
      }
    } catch (error) {
      this.logResult({
        passed: false,
        message: 'Execution logging verification failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Test 5: Verify database health
   */
  async testDatabaseHealth(): Promise<void> {
    console.log('\n=== Test 5: Verify Database Health ===\n');

    try {
      const isHealthy = await this.db.isHealthy();
      console.log(`Database Health: ${isHealthy ? 'Healthy ✓' : 'Unhealthy ✗'}`);

      if (isHealthy) {
        this.logResult({
          passed: true,
          message: 'Database is healthy and responsive',
        });
      } else {
        this.logResult({
          passed: false,
          message: 'Database health check failed',
        });
      }
    } catch (error) {
      this.logResult({
        passed: false,
        message: 'Database health check error',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Task 15.2: Test Complete Update Cycle                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
      // Run tests in sequence
      await this.testTriggerUpdateCycle();
      await this.testDatabaseStorage();
      await this.testDuplicateDetection();
      await this.testExecutionLogging();
      await this.testDatabaseHealth();

      // Print summary
      this.printSummary();
    } catch (error) {
      console.error('\n❌ Test suite failed with error:');
      console.error(error);
      process.exit(1);
    } finally {
      // Cleanup
      try {
        await this.db.disconnect();
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Test Summary                                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.message}`);
        });
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  }
}

// Run the test suite
const testSuite = new UpdateCycleTestSuite();
testSuite.runAllTests();
