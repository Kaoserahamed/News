/**
 * Update Orchestrator Service
 * 
 * Coordinates all services to execute a complete news update cycle.
 * Flow: Fetch articles → Process articles → Check duplicates → Store in database
 * Tracks metrics and logs execution details.
 * 
 * Requirements: 1.1, 1.5, 11.1, 11.2, 11.3
 */

import { NewsCollectorService } from './news-collector';
import { ContentProcessorService } from './content-processor';
import { DuplicateDetectorService } from './duplicate-detector';
import { DatabaseService } from './database';
import { createSystemLog } from '../models/system-log';
import { ProcessedArticle } from '../models/article';

/**
 * UpdateCycleResult contains metrics from an update cycle execution
 */
export interface UpdateCycleResult {
  articlesProcessed: number;    // Total articles fetched and processed
  articlesStored: number;        // Articles successfully stored in database
  duplicatesSkipped: number;     // Articles skipped due to duplicate detection
  duration: number;              // Execution time in milliseconds
  timestamp: Date;               // When the update cycle completed
  executionId: string;           // Unique identifier for this execution
}

/**
 * UpdateOrchestratorService class
 * 
 * Orchestrates the complete news update cycle by coordinating all services.
 * Implements the main business logic flow and tracks execution metrics.
 * Includes lock mechanism to prevent concurrent execution.
 */
export class UpdateOrchestratorService {
  private newsCollector: NewsCollectorService;
  private contentProcessor: ContentProcessorService;
  private duplicateDetector: DuplicateDetectorService;
  private databaseService: DatabaseService;
  private isRunning: boolean = false;  // Lock flag to prevent concurrent execution

  constructor() {
    this.newsCollector = new NewsCollectorService();
    this.contentProcessor = new ContentProcessorService();
    this.databaseService = DatabaseService.getInstance();
    this.duplicateDetector = new DuplicateDetectorService(this.databaseService);
  }

  /**
   * Execute a complete update cycle
   * 
   * Coordinates all services to fetch, process, deduplicate, and store articles.
   * Tracks metrics and logs execution details at each step.
   * 
   * Flow:
   * 1. Fetch articles from all RSS sources
   * 2. Process each article (clean, normalize, categorize)
   * 3. Check for duplicates against existing articles
   * 4. Store non-duplicate articles in database
   * 5. Log execution metrics
   * 
   * Requirements: 1.1, 1.5, 11.1, 11.2, 11.3
   * 
   * @returns Promise<UpdateCycleResult> with execution metrics
   */
  async executeUpdateCycle(): Promise<UpdateCycleResult> {
    // Check if an update cycle is already running (concurrent execution prevention)
    // Requirement: 11.4
    if (this.isRunning) {
      const warningMessage = 'Update cycle skipped: Previous cycle is still running';
      console.warn(createSystemLog(
        'warn',
        'UpdateOrchestrator',
        warningMessage,
        {
          timestamp: new Date(),
          phase: 'concurrent-prevention',
        }
      ));

      // Store warning log in database
      try {
        await this.databaseService.connect();
        await this.databaseService.insertLog(createSystemLog(
          'warn',
          'UpdateOrchestrator',
          warningMessage,
          {
            timestamp: new Date(),
          }
        ));
      } catch (logError) {
        console.error('[UpdateOrchestrator] Failed to store warning log in database:', logError);
      }

      // Throw error to indicate cycle was skipped
      throw new Error(warningMessage);
    }

    // Set lock to prevent concurrent execution
    this.isRunning = true;

    const startTime = new Date();
    const executionId = startTime.toISOString();

    // Initialize metrics
    let articlesProcessed = 0;
    let articlesStored = 0;
    let duplicatesSkipped = 0;

    try {
      // Log update cycle start with execution ID and timestamp
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Update cycle started - Execution ID: ${executionId}`,
        {
          executionId,
          timestamp: startTime,
          phase: 'start',
        }
      ));

      // Ensure database connection
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        'Connecting to database',
        {
          executionId,
          phase: 'database-connection',
        }
      ));

      await this.databaseService.connect();

      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        'Database connection established',
        {
          executionId,
          phase: 'database-connection',
        }
      ));

      // Step 1: Fetch articles from all RSS sources
      const fetchStartTime = Date.now();
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        'Step 1: Fetching articles from RSS sources',
        {
          executionId,
          phase: 'fetch',
          step: 1,
        }
      ));

      const rawArticles = await this.newsCollector.fetchAllSources();
      articlesProcessed = rawArticles.length;
      const fetchDuration = Date.now() - fetchStartTime;

      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Step 1 completed: Fetched ${articlesProcessed} articles from RSS sources`,
        {
          executionId,
          phase: 'fetch',
          step: 1,
          articleCount: articlesProcessed,
          duration: fetchDuration,
        }
      ));

      // Step 2: Process each article
      const processStartTime = Date.now();
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Step 2: Processing ${articlesProcessed} articles`,
        {
          executionId,
          phase: 'process',
          step: 2,
          articleCount: articlesProcessed,
        }
      ));

      const processedArticles: ProcessedArticle[] = [];
      let processingErrors = 0;

      for (const rawArticle of rawArticles) {
        try {
          const processed = this.contentProcessor.processArticle(rawArticle);
          processedArticles.push(processed);
        } catch (error) {
          // Log processing error but continue with other articles
          processingErrors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(createSystemLog(
            'error',
            'UpdateOrchestrator',
            `Failed to process article: ${rawArticle.title}`,
            {
              executionId,
              phase: 'process',
              step: 2,
              articleTitle: rawArticle.title,
              articleUrl: rawArticle.link,
              error: {
                name: error instanceof Error ? error.name : 'Error',
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
              },
            }
          ));
        }
      }

      const processDuration = Date.now() - processStartTime;
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Step 2 completed: Processed ${processedArticles.length} articles successfully${processingErrors > 0 ? `, ${processingErrors} failed` : ''}`,
        {
          executionId,
          phase: 'process',
          step: 2,
          articleCount: processedArticles.length,
          successCount: processedArticles.length,
          errorCount: processingErrors,
          duration: processDuration,
        }
      ));

      // Step 3 & 4: Check duplicates and store articles
      const storeStartTime = Date.now();
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Step 3 & 4: Checking duplicates and storing ${processedArticles.length} articles`,
        {
          executionId,
          phase: 'duplicate-check-and-store',
          step: 3,
          articleCount: processedArticles.length,
        }
      ));

      let storageErrors = 0;

      for (const article of processedArticles) {
        try {
          // Check if article is a duplicate
          const isDuplicate = await this.duplicateDetector.isDuplicateFromDB(article);

          if (isDuplicate) {
            duplicatesSkipped++;
            console.log(createSystemLog(
              'info',
              'UpdateOrchestrator',
              `Duplicate detected and skipped: ${article.title}`,
              {
                executionId,
                phase: 'duplicate-check',
                step: 3,
                articleTitle: article.title,
                url: article.url,
                source: article.source,
              }
            ));
            continue;
          }

          // Store article in database
          await this.databaseService.insertArticle(article);
          articlesStored++;

          console.log(createSystemLog(
            'info',
            'UpdateOrchestrator',
            `Article stored successfully: ${article.title}`,
            {
              executionId,
              phase: 'store',
              step: 4,
              articleTitle: article.title,
              url: article.url,
              source: article.source,
              category: article.category,
            }
          ));
        } catch (error) {
          // Log storage error but continue with other articles
          storageErrors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Check if it's a duplicate error from database (unique index violation)
          if (errorMessage.includes('Duplicate article')) {
            duplicatesSkipped++;
            console.log(createSystemLog(
              'info',
              'UpdateOrchestrator',
              `Duplicate detected by database: ${article.title}`,
              {
                executionId,
                phase: 'duplicate-check',
                step: 3,
                articleTitle: article.title,
                url: article.url,
                source: article.source,
              }
            ));
          } else {
            // Other storage errors
            console.error(createSystemLog(
              'error',
              'UpdateOrchestrator',
              `Failed to store article: ${article.title}`,
              {
                executionId,
                phase: 'store',
                step: 4,
                articleTitle: article.title,
                articleUrl: article.url,
                error: {
                  name: error instanceof Error ? error.name : 'Error',
                  message: errorMessage,
                  stack: error instanceof Error ? error.stack : undefined,
                },
              }
            ));
          }
        }
      }

      const storeDuration = Date.now() - storeStartTime;
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Step 3 & 4 completed: Stored ${articlesStored} articles, skipped ${duplicatesSkipped} duplicates${storageErrors > 0 ? `, ${storageErrors} errors` : ''}`,
        {
          executionId,
          phase: 'duplicate-check-and-store',
          step: 3,
          storedCount: articlesStored,
          duplicatesSkipped,
          errorCount: storageErrors,
          duration: storeDuration,
        }
      ));

      // Calculate duration
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Create result
      const result: UpdateCycleResult = {
        articlesProcessed,
        articlesStored,
        duplicatesSkipped,
        duration,
        timestamp: endTime,
        executionId,
      };

      // Log update cycle completion with comprehensive metrics
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        `Update cycle completed successfully - Execution ID: ${executionId}`,
        {
          executionId,
          phase: 'completion',
          articlesProcessed,
          articlesStored,
          duplicatesSkipped,
          duration,
          timestamp: endTime,
          successRate: articlesProcessed > 0 ? ((articlesStored / articlesProcessed) * 100).toFixed(2) + '%' : '0%',
        }
      ));

      // Store completion log in database
      await this.databaseService.insertLog(createSystemLog(
        'info',
        'UpdateOrchestrator',
        'Update cycle completed',
        {
          executionId,
          articleCount: articlesStored,
          duration,
        }
      ));

      return result;
    } catch (error) {
      // Log critical error with comprehensive context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.error(createSystemLog(
        'error',
        'UpdateOrchestrator',
        `Update cycle failed - Execution ID: ${executionId}: ${errorMessage}`,
        {
          executionId,
          phase: 'error',
          articlesProcessed,
          articlesStored,
          duplicatesSkipped,
          duration,
          timestamp: endTime,
          error: {
            name: error instanceof Error ? error.name : 'Error',
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
          },
        }
      ));

      // Store error log in database (if database is available)
      try {
        await this.databaseService.insertLog(createSystemLog(
          'error',
          'UpdateOrchestrator',
          `Update cycle failed: ${errorMessage}`,
          {
            executionId,
            articleCount: articlesStored,
            duration,
            error: {
              name: error instanceof Error ? error.name : 'Error',
              message: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            },
          }
        ));
      } catch (logError) {
        // If logging fails, just log to console
        console.error('[UpdateOrchestrator] Failed to store error log in database:', logError);
      }

      // Re-throw error to caller
      throw error;
    } finally {
      // Always release the lock when update cycle completes (success or error)
      // Requirement: 11.4
      this.isRunning = false;
      console.log(createSystemLog(
        'info',
        'UpdateOrchestrator',
        'Update cycle lock released',
        {
          timestamp: new Date(),
          phase: 'lock-release',
        }
      ));
    }
  }
}
