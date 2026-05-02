/**
 * Tests for POST /api/cron/update endpoint
 * 
 * Tests:
 * - Method validation (only POST allowed)
 * - Authorization header validation
 * - Cron secret verification
 * - Successful update cycle execution
 * - Error handling for concurrent execution
 * - Request logging
 */

import { NextApiRequest, NextApiResponse } from 'next';
import handler from './update';
import { UpdateOrchestratorService } from '../../../lib/services/update-orchestrator';
import type { ApiResponse, UpdateApiResponse, ApiErrorResponse } from '../../../lib/models/api';

// Mock the UpdateOrchestratorService
jest.mock('../../../lib/services/update-orchestrator');

describe('POST /api/cron/update', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.CRON_SECRET = 'test-secret-key';

    // Create mock request and response objects
    req = {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret-key',
      },
    };

    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    res = {
      status: statusMock as any,
      json: jsonMock,
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Method validation', () => {
    it('should reject GET requests with 405', async () => {
      req.method = 'GET';

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST requests are allowed',
        },
      });
    });

    it('should reject PUT requests with 405', async () => {
      req.method = 'PUT';

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
    });

    it('should reject DELETE requests with 405', async () => {
      req.method = 'DELETE';

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
    });
  });

  describe('Authorization validation', () => {
    it('should reject requests without authorization header', async () => {
      req.headers = {};

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization header',
        },
      });
    });

    it('should reject requests with invalid secret', async () => {
      req.headers = {
        authorization: 'Bearer wrong-secret',
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization credentials',
        },
      });
    });

    it('should accept authorization header without Bearer prefix', async () => {
      req.headers = {
        authorization: 'test-secret-key',
      };

      // Mock successful update cycle
      const mockResult = {
        articlesProcessed: 10,
        articlesStored: 8,
        duplicatesSkipped: 2,
        duration: 5000,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        executionId: '2024-01-15T10:00:00.000Z',
      };

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockResolvedValue(mockResult),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should return 500 if CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVER_CONFIGURATION_ERROR',
          message: 'Cron secret is not configured on the server',
        },
      });
    });
  });

  describe('Successful update cycle execution', () => {
    it('should execute update cycle and return metrics', async () => {
      const mockResult = {
        articlesProcessed: 10,
        articlesStored: 8,
        duplicatesSkipped: 2,
        duration: 5000,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        executionId: '2024-01-15T10:00:00.000Z',
      };

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockResolvedValue(mockResult),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          articlesProcessed: 10,
          articlesStored: 8,
          duplicatesSkipped: 2,
          duration: 5000,
          timestamp: '2024-01-15T10:00:00.000Z',
        },
      });
    });

    it('should log request with response status', async () => {
      const mockResult = {
        articlesProcessed: 5,
        articlesStored: 4,
        duplicatesSkipped: 1,
        duration: 3000,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        executionId: '2024-01-15T10:00:00.000Z',
      };

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockResolvedValue(mockResult),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verify logging was called (Requirement: 12.4)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/cron/update - Request received')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/cron/update - Status: 200')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('4/5 stored, 1 duplicates skipped')
      );
    });
  });

  describe('Error handling', () => {
    it('should handle concurrent execution error with 409', async () => {
      const concurrentError = new Error('Update cycle skipped: Previous cycle is still running');

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockRejectedValue(concurrentError),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CONCURRENT_EXECUTION',
          message: 'Update cycle is already running. Please try again later.',
        },
      });
    });

    it('should handle generic errors with 500', async () => {
      const genericError = new Error('Database connection failed');

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockRejectedValue(genericError),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UPDATE_CYCLE_FAILED',
          message: 'Failed to execute update cycle. Please check server logs for details.',
          details: undefined, // details only shown in development
        },
      });
    });

    it('should include error details in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const genericError = new Error('Test error message');

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockRejectedValue(genericError),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UPDATE_CYCLE_FAILED',
          message: 'Failed to execute update cycle. Please check server logs for details.',
          details: 'Test error message',
        },
      });
    });

    it('should log errors with response status', async () => {
      const error = new Error('Test error');

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockRejectedValue(error),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verify error logging (Requirement: 12.4)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[API /cron/update] Error executing update cycle:'),
        error
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('POST /api/cron/update - Status: 500')
      );
    });
  });

  describe('Request logging', () => {
    it('should log all requests with timestamp and endpoint', async () => {
      const mockResult = {
        articlesProcessed: 1,
        articlesStored: 1,
        duplicatesSkipped: 0,
        duration: 1000,
        timestamp: new Date(),
        executionId: 'test-id',
      };

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockResolvedValue(mockResult),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verify request logging includes timestamp and endpoint (Requirement: 12.4)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] POST \/api\/cron\/update/)
      );
    });

    it('should log request duration', async () => {
      const mockResult = {
        articlesProcessed: 1,
        articlesStored: 1,
        duplicatesSkipped: 0,
        duration: 1000,
        timestamp: new Date(),
        executionId: 'test-id',
      };

      (UpdateOrchestratorService as jest.MockedClass<typeof UpdateOrchestratorService>).mockImplementation(() => ({
        executeUpdateCycle: jest.fn().mockResolvedValue(mockResult),
      } as any));

      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verify duration is logged (Requirement: 12.4)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Duration:')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('ms')
      );
    });
  });
});
