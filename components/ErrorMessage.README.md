# ErrorMessage Component

## Overview

The `ErrorMessage` component displays user-friendly error messages for different error types (connection failures, timeouts, server errors) with a retry button. It automatically detects the error type from the error message and displays appropriate messaging.

## Requirements Validation

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- **10.1**: Displays error message when Backend API is unreachable (connection failure)
- **10.2**: Displays timeout error message when API request times out after 10 seconds
- **10.3**: Displays service unavailable message when database is unavailable (503 status)
- **10.4**: Provides a retry button when errors occur
- **10.5**: Re-attempts the failed operation when user clicks retry button

## Features

- **Automatic Error Type Detection**: Analyzes error messages to determine error type
- **User-Friendly Messages**: Displays clear, actionable error messages
- **Retry Functionality**: Allows users to retry failed operations
- **Accessible**: Includes proper ARIA labels and semantic HTML
- **Responsive Design**: Works on all screen sizes

## Error Types

The component supports four error types:

1. **connection**: Network/connection failures
2. **timeout**: Request timeout errors
3. **server**: Server-side errors (500, 503, etc.)
4. **general**: Generic errors

## Usage

### Basic Usage

```tsx
import ErrorMessage from '@/components/ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    // Retry logic here
    fetchData();
  };

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return <div>Content</div>;
}
```

### With Automatic Error Type Detection

```tsx
import ErrorMessage, { detectErrorType } from '@/components/ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <ErrorMessage
        message={error}
        type={detectErrorType(error)}
        onRetry={() => fetchData()}
      />
    );
  }

  return <div>Content</div>;
}
```

### With Custom Title

```tsx
<ErrorMessage
  message="Failed to load articles"
  type="connection"
  title="Connection Problem"
  onRetry={handleRetry}
/>
```

### Without Retry Button

```tsx
<ErrorMessage
  message="This feature is not available"
  type="general"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | `string` | Yes | - | The error message to display |
| `type` | `ErrorType` | No | `'general'` | The type of error (connection, timeout, server, general) |
| `onRetry` | `() => void` | No | - | Callback function to retry the failed operation |
| `title` | `string` | No | Auto-generated | Optional custom title for the error |

## Error Type Detection

The `detectErrorType` function automatically determines the error type from the error message:

```typescript
const errorType = detectErrorType("Request timed out"); // Returns 'timeout'
const errorType = detectErrorType("Failed to fetch"); // Returns 'connection'
const errorType = detectErrorType("Server error 503"); // Returns 'server'
```

Detection rules:
- **timeout**: Contains "timeout" or "timed out"
- **connection**: Contains "connection", "network", "unreachable", or "failed to fetch"
- **server**: Contains "server", "503", "500", or "unavailable"
- **general**: Default for all other messages

## Implementation in pages/index.tsx

The ErrorMessage component is used in the main page to display errors from API calls:

```tsx
{state.error && !state.loading && (
  <ErrorMessage
    message={state.error}
    type={detectErrorType(state.error)}
    onRetry={handleRetry}
  />
)}
```

The API fetching logic includes:
- 10-second timeout using AbortController
- Specific error messages for different failure types
- Retry functionality through the `handleRetry` callback

## Styling

The component uses Tailwind CSS classes for styling:
- Red color scheme for error indication
- Left border accent for visual emphasis
- Hover and focus states for the retry button
- Responsive padding and spacing
- Shadow effects for depth

## Accessibility

- Uses semantic HTML structure
- Includes ARIA labels on interactive elements
- Proper color contrast for text readability
- Keyboard-accessible retry button
- Screen reader-friendly error messages
