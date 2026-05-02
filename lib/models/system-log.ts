/**
 * Log level enum for system logs
 */
export type LogLevel = 'info' | 'warn' | 'error';

/**
 * SystemLog represents a log entry for system operations and errors
 */
export interface SystemLog {
  id?: string;                    // MongoDB ObjectId as string (optional for new logs)
  level: LogLevel;                // Severity level of the log
  component: string;              // Component that generated the log (e.g., "NewsCollector")
  message: string;                // Log message
  timestamp: Date;                // When the log was created
  metadata?: SystemLogMetadata;   // Optional additional context
}

/**
 * SystemLogMetadata contains optional contextual information for logs
 */
export interface SystemLogMetadata {
  executionId?: string;           // Unique identifier for an update cycle
  articleCount?: number;          // Number of articles processed
  duration?: number;              // Duration in milliseconds
  error?: ErrorDetails;           // Error details if applicable
  [key: string]: any;             // Allow additional custom fields
}

/**
 * ErrorDetails captures structured error information
 */
export interface ErrorDetails {
  name: string;                   // Error name/type
  message: string;                // Error message
  stack?: string;                 // Stack trace (optional)
  code?: string;                  // Error code (optional)
}

/**
 * Helper function to create a system log entry
 */
export function createSystemLog(
  level: LogLevel,
  component: string,
  message: string,
  metadata?: SystemLogMetadata
): SystemLog {
  return {
    level,
    component,
    message,
    timestamp: new Date(),
    metadata,
  };
}
