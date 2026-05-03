/**
 * Unit tests for GET /api/health endpoint
 * 
 * Tests health check functionality including:
 * - Database connectivity checks
 * - Last update timestamp retrieval
 * - System status determination
 * - Error handling
 */

import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/health';
import { getDatabaseService } from '../../../lib/services/database';
import type { HealthApiResponse } from '../../../lib/models/api';

// Mock the database service
jest.mock('../../../lib/services/database');

describe('GET /api/health', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockDbService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    req = {
      method: 'GET',
      headers: {},
    };

    // Setup response mock
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup database service mock
    mockDbService = {
      isHealthy: jest.fn(),
      getCollection: jest.fn(),
    };

    (getDatabaseService as jest.Mock).mockReturnValue(mockDbService);
  });

  describe('Method validation', () => {
    it('should return 405 for non-GET requests', async () => {
      req.method = 'POST';

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET requests are allowed',
        },
      });
    });
  });

  describe('Healthy system', () => {
    it('should return healthy status when database is connected and updates are running', async () => {
      // Mock database as healthy
      mockDbService.isHealthy.mockResolvedValue(true);

      // Mock logs collection with successful update
      const mockLogsCollection = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
          {
            component: 'UpdateOrchestrator',
            level: 'info',
            message: 'Update cycle completed successfully',
            timestamp: new Date('2024-01-15T10:00:00Z'),
          },
        ]),
      };

      mockDbService.getCollection.mockResolvedValue(mockLogsCollection);

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(mockDbService.isHealthy).toHaveBeenCalled();
      expect(mockDbService.getCollection).toHaveBeenCalledWith('logs');
      expect(statusMock).toHaveBeenCalledWith(200);
      
      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('healthy');
      expect(response.data.database).toBe('connected');
      expect(response.data.lastUpdate).toBe('2024-01-15T10:00:00.000Z');
      expect(response.data.timestamp).toBeDefined();
    });
  });

  describe('Degraded system', () => {
    it('should return degraded status when database is connected but no updates have run', async () => {
      // Mock database as healthy
      mockDbService.isHealthy.mockResolvedValue(true);

      // Mock logs collection with no successful updates
      const mockLogsCollection = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockDbService.getCollection.mockResolvedValue(mockLogsCollection);

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      
      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('degraded');
      expect(response.data.database).toBe('connected');
      expect(response.data.lastUpdate).toBeNull();
    });

    it('should return degraded status when database is connected but logs query fails', async () => {
      // Mock database as healthy
      mockDbService.isHealthy.mockResolvedValue(true);

      // Mock logs collection query failure
      mockDbService.getCollection.mockRejectedValue(new Error('Query failed'));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      
      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('degraded');
      expect(response.data.database).toBe('error');
      expect(response.data.lastUpdate).toBeNull();
    });
  });

  describe('Unhealthy system', () => {
    it('should return unhealthy status when database is not connected', async () => {
      // Mock database as unhealthy
      mockDbService.isHealthy.mockResolvedValue(false);

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(mockDbService.isHealthy).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(503);
      
      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('unhealthy');
      expect(response.data.database).toBe('disconnected');
      expect(response.data.lastUpdate).toBeNull();
    });

    it('should return unhealthy status on unexpected errors', async () => {
      // Mock database health check to throw error
      mockDbService.isHealthy.mockRejectedValue(new Error('Unexpected error'));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(503);
      
      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('unhealthy');
      expect(response.data.database).toBe('error');
      expect(response.data.lastUpdate).toBeNull();
    });
  });

  describe('Last update timestamp parsing', () => {
    it('should handle Date objects from database', async () => {
      mockDbService.isHealthy.mockResolvedValue(true);

      const mockDate = new Date('2024-01-15T10:00:00Z');
      const mockLogsCollection = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
          {
            component: 'UpdateOrchestrator',
            level: 'info',
            message: 'Update cycle completed successfully',
            timestamp: mockDate,
          },
        ]),
      };

      mockDbService.getCollection.mockResolvedValue(mockLogsCollection);

      await handler(req as NextApiRequest, res as NextApiResponse);

      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.data.lastUpdate).toBe(mockDate.toISOString());
    });

    it('should handle ISO string timestamps from database', async () => {
      mockDbService.isHealthy.mockResolvedValue(true);

      const isoString = '2024-01-15T10:00:00.000Z';
      const mockLogsCollection = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
          {
            component: 'UpdateOrchestrator',
            level: 'info',
            message: 'Update cycle completed successfully',
            timestamp: isoString,
          },
        ]),
      };

      mockDbService.getCollection.mockResolvedValue(mockLogsCollection);

      await handler(req as NextApiRequest, res as NextApiResponse);

      const response = jsonMock.mock.calls[0][0] as HealthApiResponse;
      expect(response.data.lastUpdate).toBe(isoString);
    });
  });

  describe('Log query', () => {
    it('should query logs with correct filters', async () => {
      mockDbService.isHealthy.mockResolvedValue(true);

      const findMock = jest.fn().mockReturnThis();
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const toArrayMock = jest.fn().mockResolvedValue([]);

      const mockLogsCollection = {
        find: findMock,
        sort: sortMock,
        limit: limitMock,
        toArray: toArrayMock,
      };

      mockDbService.getCollection.mockResolvedValue(mockLogsCollection);

      await handler(req as NextApiRequest, res as NextApiResponse);

      // Verify query filters
      expect(findMock).toHaveBeenCalledWith({
        component: 'UpdateOrchestrator',
        level: 'info',
        message: { $regex: /completed successfully/i },
      });

      // Verify sorting by timestamp descending
      expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });

      // Verify limit to 1 result
      expect(limitMock).toHaveBeenCalledWith(1);
    });
  });
});
