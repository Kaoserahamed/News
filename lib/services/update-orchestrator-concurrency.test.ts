/**
 * Concurrent Execution Prevention Test for UpdateOrchestratorService
 * 
 * This test verifies that the lock mechanism prevents overlapping update cycles
 * according to task 8.3:
 * - Add lock mechanism to prevent overlapping update cycles (Req 11.4)
 * - Skip new cycle if previous cycle is still running
 * - Log warning when cycle is skipped
 */

import { UpdateOrchestratorService } from './update-orchestrator';
import { DatabaseService } from './database';
import { NewsCollectorService } from './news-collector';
import { ContentProcessorService } from './content-processor';
import { DuplicateDetectorService } from './duplicate-detector';

// Mock all dependencies
jest.mock('./news-collector');
jest.mock('./content-processor');
jest.mock('./duplicate-detector');
jest.mock('./database');

describe('UpdateOrchestrator Concurrent Execution Prevention', () => {
  let orchestrator: UpdateOrchestratorService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockNewsCollector: jest.Mocked<NewsCollectorService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock DatabaseService
    mockDatabaseService = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      insertArticle: jest.fn().mockResolvedValue('mock-id'),
      insertLog: jest.fn().mockResolvedValue(undefined),
      findArticles: jest.fn().mockResolvedValue({ articles: [], total: 0, page: 1, totalPages: 0 }),
      findRecentArticles: jest.fn().mockResolvedValue([]),
      isHealthy: jest.fn().mockResolvedValue(true),
    } as any;

    // Mock DatabaseService.getInstance to return our mock
    (DatabaseService.getInstance as jest.Mock) = jest.fn().mockReturnValue(mockDatabaseService);

    // Mock NewsCollectorService
    mockNewsCollector = {
      fetchAllSources: jest.fn().mockResolvedValue([]),
      fetchSource: jest.fn().mockResolvedValue([]),
    } as any;

    (NewsCollectorService as jest.Mock).mockImplementation(() => mockNewsCollector);

    // Mock ContentProcessorService
    (ContentProcessorService as jest.Mock).mockImplementation(() => ({
      processArticle: jest.fn(),
      cleanHTML: jest.fn(),
      normalizeWhitespace: jest.fn(),
      parseDate: jest.fn(),
      truncateSummary: jest.fn(),
      categorizeArticle: jest.fn(),
    }));

    // Mock DuplicateDetectorService
    (DuplicateDetectorService as jest.Mock).mockImplementation(() => ({
      isDuplicateFromDB: jest.fn().mockResolvedValue(false),
      checkURLDuplicate: jest.fn(),
      checkTitleSimilarity: jest.fn(),
      calculateSimilarity: jest.fn(),
    }));

    // Create new orchestrator instance
    orchestrator = new UpdateOrchestratorService();
  });

  test('should allow first update cycle to execute', async () => {
    // Mock NewsCollectorService to return empty array quickly
    mockNewsCollector.fetchAllSources = jest.fn().mockResolvedValue([]);

    // Execute update cycle
    const result = await orchestrator.executeUpdateCycle();

    // Verify cycle executed successfully
    expect(result).toBeDefined();
    expect(result.articlesProcessed).toBe(0);
    expect(result.articlesStored).toBe(0);
    expect(result.duplicatesSkipped).toBe(0);
    expect(result.executionId).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.duration).toBeGreaterThanOrEqual(0);

    console.log('✅ First update cycle executed successfully');
  });

  test('should prevent concurrent execution when cycle is already running', async () => {
    // Mock NewsCollectorService to simulate a long-running operation
    let resolveFirstCycle: () => void;
    const firstCyclePromise = new Promise<void>((resolve) => {
      resolveFirstCycle = resolve;
    });

    // Mock fetchAllSources on the instance directly
    mockNewsCollector.fetchAllSources = jest.fn().mockImplementation(() => {
      return firstCyclePromise.then(() => []);
    });

    // Start first update cycle (will be blocked until we resolve it)
    const firstCycleExecution = orchestrator.executeUpdateCycle();

    // Wait a bit to ensure first cycle has started and acquired the lock
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to start second update cycle while first is still running
    // Use expect().rejects to properly handle the promise rejection
    await expect(orchestrator.executeUpdateCycle()).rejects.toThrow('Update cycle skipped: Previous cycle is still running');

    // Verify warning was logged to database
    expect(mockDatabaseService.insertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        component: 'UpdateOrchestrator',
        message: 'Update cycle skipped: Previous cycle is still running',
      })
    );

    console.log('✅ Second cycle was correctly prevented');

    // Resolve first cycle to clean up
    resolveFirstCycle!();
    await firstCycleExecution;
  });

  test('should allow new cycle after previous cycle completes successfully', async () => {
    // Mock NewsCollectorService to return empty array quickly
    mockNewsCollector.fetchAllSources = jest.fn().mockResolvedValue([]);

    // Execute first update cycle
    const firstResult = await orchestrator.executeUpdateCycle();
    expect(firstResult).toBeDefined();
    console.log('✅ First cycle completed');

    // Execute second update cycle (should succeed)
    const secondResult = await orchestrator.executeUpdateCycle();
    expect(secondResult).toBeDefined();
    expect(secondResult.executionId).not.toBe(firstResult.executionId);
    console.log('✅ Second cycle executed successfully after first completed');
  });

  test('should release lock even when cycle fails with error', async () => {
    // Mock NewsCollectorService to throw an error
    mockNewsCollector.fetchAllSources = jest.fn().mockRejectedValue(
      new Error('Network error')
    );

    // Execute first update cycle (will fail) - use expect().rejects
    await expect(orchestrator.executeUpdateCycle()).rejects.toThrow('Network error');
    console.log('✅ First cycle failed as expected');

    // Mock successful execution for second cycle
    mockNewsCollector.fetchAllSources = jest.fn().mockResolvedValue([]);

    // Execute second update cycle (should succeed because lock was released)
    const secondResult = await orchestrator.executeUpdateCycle();
    expect(secondResult).toBeDefined();
    console.log('✅ Second cycle executed successfully after first failed');
  });

  test('should log lock release in finally block', async () => {
    // Spy on console.log to verify lock release logging
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock NewsCollectorService to return empty array quickly
    const { NewsCollectorService } = require('./news-collector');
    NewsCollectorService.prototype.fetchAllSources = jest.fn().mockResolvedValue([]);

    // Execute update cycle
    await orchestrator.executeUpdateCycle();

    // Verify lock release was logged
    const lockReleaseLogs = consoleLogSpy.mock.calls.filter(call => {
      const logArg = call[0];
      return typeof logArg === 'object' && 
             logArg.message === 'Update cycle lock released' &&
             logArg.metadata?.phase === 'lock-release';
    });

    expect(lockReleaseLogs.length).toBeGreaterThan(0);
    console.log('✅ Lock release was logged');

    consoleLogSpy.mockRestore();
  });
});

/**
 * Summary of Concurrent Execution Prevention Coverage
 * 
 * ✅ Requirement 11.4: Skip new cycle if previous cycle is still running
 *    - Implemented with isRunning flag in UpdateOrchestratorService
 *    - Lock is set at start of executeUpdateCycle()
 *    - Lock is checked before starting new cycle
 *    - Lock is released in finally block to ensure cleanup
 * 
 * ✅ Log warning when cycle is skipped
 *    - Warning logged to console with createSystemLog
 *    - Warning persisted to database via insertLog
 *    - Error thrown to indicate cycle was skipped
 * 
 * ✅ Lock mechanism prevents overlapping update cycles
 *    - isRunning flag prevents concurrent execution
 *    - Lock released on both success and error (finally block)
 *    - Subsequent cycles can execute after previous completes
 * 
 * Test Coverage:
 * ✅ First cycle executes successfully
 * ✅ Second cycle blocked while first is running
 * ✅ Second cycle succeeds after first completes
 * ✅ Lock released even when cycle fails
 * ✅ Lock release is logged
 */
