import React from 'react';

/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages for different error types
 * (connection failures, timeouts, server errors) with a retry button.
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

export type ErrorType = 'connection' | 'timeout' | 'server' | 'general';

export interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** The type of error (determines icon and styling) */
  type?: ErrorType;
  /** Callback function to retry the failed operation */
  onRetry?: () => void;
  /** Optional custom title for the error */
  title?: string;
}

/**
 * Get user-friendly error message based on error type
 */
function getErrorDetails(type: ErrorType, message: string): { title: string; description: string } {
  switch (type) {
    case 'connection':
      return {
        title: 'Connection Failed',
        description: 'Unable to reach the server. Please check your internet connection and try again.',
      };
    case 'timeout':
      return {
        title: 'Request Timed Out',
        description: 'The request took too long to complete. Please check your connection and try again.',
      };
    case 'server':
      return {
        title: 'Server Error',
        description: 'The server encountered an error. Please try again later.',
      };
    case 'general':
    default:
      return {
        title: 'Error',
        description: message || 'An unexpected error occurred. Please try again.',
      };
  }
}

/**
 * Detect error type from error message
 */
export function detectErrorType(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'timeout';
  }
  
  if (
    lowerMessage.includes('connection') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('unreachable') ||
    lowerMessage.includes('failed to fetch')
  ) {
    return 'connection';
  }
  
  if (
    lowerMessage.includes('server') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('unavailable')
  ) {
    return 'server';
  }
  
  return 'general';
}

/**
 * ErrorMessage component displays error information with retry functionality
 */
export default function ErrorMessage({
  message,
  type = 'general',
  onRetry,
  title,
}: ErrorMessageProps) {
  const errorDetails = getErrorDetails(type, message);
  const displayTitle = title || errorDetails.title;
  const displayMessage = type === 'general' ? message : errorDetails.description;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-start">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Error Content */}
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-red-800">{displayTitle}</h3>
            <p className="mt-2 text-red-700">{displayMessage}</p>
            
            {/* Retry Button */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                         transition-colors duration-200 font-medium"
                aria-label="Retry failed operation"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
