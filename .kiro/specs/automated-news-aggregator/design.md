# Design Document: Automated News Aggregation Web Application

## Overview

The Automated News Aggregation Web Application is a full-stack system that automatically collects, processes, and presents news articles from multiple RSS feed sources. The system operates on an hourly update cycle, fetching articles, processing and deduplicating content, storing data in MongoDB Atlas, and serving it through a REST API to a responsive Next.js frontend.

### Key Design Goals

1. **Automation**: Fully automated news collection with no manual intervention required
2. **Data Quality**: Clean, normalized, and deduplicated content
3. **Performance**: Fast search and retrieval with efficient indexing
4. **Scalability**: Support for multiple sources and growing article databases
5. **Reliability**: Robust error handling and retry mechanisms
6. **User Experience**: Responsive interface with search, filtering, and pagination

### Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js runtime)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Deployment**: Vercel (with cron jobs)
- **RSS Parsing**: `rss-parser` library
- **HTTP Client**: `axios` or native `fetch`

## Architecture

### High-Level Architecture

The system follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Platform                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Vercel Cron Jobs                          │ │
│  │         (Triggers every 1 hour)                        │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Next.js Application                          │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │         Frontend (React/Next.js)             │    │ │
│  │  │  - Article List Component                    │    │ │
│  │  │  - Search Component                          │    │ │
│  │  │  - Category Filter Component                 │    │ │
│  │  │  - Pagination Component                      │    │ │
│  │  └──────────────────┬───────────────────────────┘    │ │
│  │                     │                                 │ │
│  │                     │ HTTP/JSON                       │ │
│  │                     ▼                                 │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │      Backend API Routes                      │    │ │
│  │  │  - GET /api/articles (list, search, filter)  │    │ │
│  │  │  - GET /api/health (health check)            │    │ │
│  │  │  - POST /api/cron/update (trigger update)    │    │ │
│  │  └──────────────────┬───────────────────────────┘    │ │
│  │                     │                                 │ │
│  │  ┌──────────────────┴───────────────────────────┐    │ │
│  │  │         Business Logic Layer                 │    │ │
│  │  │  - News Collector Service                    │    │ │
│  │  │  - Content Processor Service                 │    │ │
│  │  │  - Duplicate Detector Service                │    │ │
│  │  │  - Database Service                          │    │ │
│  │  └──────────────────┬───────────────────────────┘    │ │
│  └────────────────────┼────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────┘
                         │
                         │ MongoDB Driver
                         ▼
              ┌──────────────────────┐
              │   MongoDB Atlas      │
              │   (Cloud Database)   │
              │  - articles collection│
              │  - logs collection   │
              └──────────────────────┘
```

### Component Interaction Flow

**Update Cycle Flow:**
1. Vercel cron triggers `/api/cron/update` endpoint every hour
2. News Collector fetches RSS feeds from configured sources
3. Content Processor normalizes and categorizes each article
4. Duplicate Detector checks against existing articles
5. Database Service stores new articles in MongoDB
6. Execution logs are recorded

**User Request Flow:**
1. User interacts with Frontend (search, filter, paginate)
2. Frontend sends HTTP request to Backend API
3. Backend API queries MongoDB with filters/search terms
4. Database returns matching articles
5. Backend API formats and returns JSON response
6. Frontend renders articles in UI

## Components and Interfaces

### 1. News Collector Service

**Responsibility**: Fetch news articles from external RSS feed sources

**Interface**:
```typescript
interface NewsCollectorService {
  fetchAllSources(): Promise<RawArticle[]>;
  fetchSource(sourceConfig: RSSSource): Promise<RawArticle[]>;
}

interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: Category;
}

interface RawArticle {
  title: string;
  summary?: string;
  content?: string;
  link: string;
  pubDate: string;
  source: string;
}
```

**Implementation Details**:
- Uses `rss-parser` library to parse RSS/Atom feeds
- Maintains a configuration array of RSS sources (stored in environment variables or config file)
- Implements timeout handling (10 seconds per source)
- Logs errors for failed sources but continues processing remaining sources
- Returns array of raw articles from all successful sources

**Error Handling**:
- Network timeouts: Log error, continue with other sources
- Invalid RSS format: Log error, skip source
- Missing required fields: Skip individual article, continue processing

### 2. Content Processor Service

**Responsibility**: Clean, normalize, and categorize news articles

**Interface**:
```typescript
interface ContentProcessorService {
  processArticle(raw: RawArticle): ProcessedArticle;
  cleanHTML(html: string): string;
  normalizeWhitespace(text: string): string;
  parseDate(dateString: string): Date;
  truncateSummary(text: string, maxLength: number): string;
  categorizeArticle(article: RawArticle): Category;
}

interface ProcessedArticle {
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  category: Category;
  publishedAt: Date;
  processedAt: Date;
}

enum Category {
  TECHNOLOGY = 'Technology',
  SPORTS = 'Sports',
  BUSINESS = 'Business',
  POLITICS = 'Politics',
  ENTERTAINMENT = 'Entertainment',
  GENERAL = 'General'
}
```

**Implementation Details**:
- **HTML Cleaning**: Use regex or library (e.g., `striptags`) to remove HTML tags
- **Whitespace Normalization**: Replace multiple spaces/newlines with single space, trim edges
- **Date Parsing**: Parse various date formats, convert to ISO 8601, handle timezone conversion
- **Summary Truncation**: Truncate at word boundaries, preserve complete sentences, add ellipsis if truncated
- **Categorization**: Keyword-based classification using predefined keyword lists per category

**Pure Functions** (suitable for property-based testing):
- `cleanHTML(html: string): string`
- `normalizeWhitespace(text: string): string`
- `truncateSummary(text: string, maxLength: number): string`

### 3. Duplicate Detector Service

**Responsibility**: Identify and prevent duplicate articles from being stored

**Interface**:
```typescript
interface DuplicateDetectorService {
  isDuplicate(article: ProcessedArticle, existing: ProcessedArticle[]): boolean;
  checkURLDuplicate(url: string, existing: ProcessedArticle[]): boolean;
  checkTitleSimilarity(title: string, existing: ProcessedArticle[]): boolean;
  calculateSimilarity(str1: string, str2: string): number;
}
```

**Implementation Details**:
- **URL Matching**: Exact string comparison (case-insensitive)
- **Title Similarity**: Use Levenshtein distance or Jaro-Winkler similarity algorithm
- **Similarity Threshold**: 90% similarity triggers duplicate detection
- **Optimization**: Query database for articles from last 7 days only (reduce comparison set)

**Pure Functions** (suitable for property-based testing):
- `calculateSimilarity(str1: string, str2: string): number`
- `checkTitleSimilarity(title: string, existingTitles: string[]): boolean`

### 4. Database Service

**Responsibility**: Manage MongoDB operations for articles and logs

**Interface**:
```typescript
interface DatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Article operations
  insertArticle(article: ProcessedArticle): Promise<string>;
  findArticles(query: ArticleQuery): Promise<ArticleResult>;
  findRecentArticles(days: number): Promise<ProcessedArticle[]>;
  
  // Log operations
  insertLog(log: SystemLog): Promise<void>;
  
  // Health check
  isHealthy(): Promise<boolean>;
}

interface ArticleQuery {
  page?: number;
  limit?: number;
  category?: Category;
  searchTerm?: string;
  sortBy?: 'publishedAt' | 'processedAt';
  sortOrder?: 'asc' | 'desc';
}

interface ArticleResult {
  articles: ProcessedArticle[];
  total: number;
  page: number;
  totalPages: number;
}

interface SystemLog {
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**MongoDB Schema**:

```javascript
// articles collection
{
  _id: ObjectId,
  title: String (indexed),
  summary: String (text indexed),
  content: String,
  url: String (unique indexed),
  source: String,
  category: String (indexed),
  publishedAt: Date (indexed, descending),
  processedAt: Date,
  createdAt: Date
}

// logs collection
{
  _id: ObjectId,
  level: String,
  component: String,
  message: String,
  timestamp: Date (indexed, descending),
  metadata: Object
}
```

**Indexes**:
- `articles.publishedAt`: Descending (for chronological listing)
- `articles.category`: Ascending (for filtering)
- `articles.url`: Unique (for duplicate prevention)
- `articles.title`: Text index (for search)
- `articles.summary`: Text index (for search)
- `logs.timestamp`: Descending (for log retrieval)

**Retry Logic**:
- Implement exponential backoff: 1s, 2s, 4s delays
- Maximum 3 retry attempts
- Log all retry attempts

### 5. Backend API Routes

**Responsibility**: Expose HTTP endpoints for frontend and cron jobs

**Endpoints**:

#### GET `/api/articles`

Query parameters:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category` (string, optional)
- `search` (string, optional)

Response:
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Page must be a positive integer"
  }
}
```

#### POST `/api/cron/update`

Protected endpoint (verify Vercel cron secret)

Response:
```json
{
  "success": true,
  "data": {
    "articlesProcessed": 45,
    "articlesStored": 32,
    "duplicatesSkipped": 13,
    "duration": 12500,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

#### GET `/api/health`

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "lastUpdate": "2024-01-15T10:00:00Z",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Implementation Details**:
- Validate all query parameters
- Return 400 for invalid parameters
- Return 503 when database is unavailable
- Implement request timeout (10 seconds)
- Log all requests with response status

### 6. Frontend Components

**Responsibility**: Render UI and handle user interactions

**Component Hierarchy**:

```
App (pages/index.tsx)
├── Header
│   ├── Logo
│   └── SearchBar
├── CategoryFilter
│   └── CategoryButton[]
├── ArticleList
│   ├── ArticleCard[]
│   │   ├── ArticleTitle
│   │   ├── ArticleSummary
│   │   ├── ArticleMeta (source, date, category)
│   │   └── ArticleLink
│   └── LoadingSpinner
├── Pagination
│   ├── PreviousButton
│   ├── PageNumbers
│   └── NextButton
└── ErrorBoundary
    └── ErrorMessage
```

**State Management**:
```typescript
interface AppState {
  articles: ProcessedArticle[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filters: {
    category: Category | null;
    searchTerm: string;
  };
}
```

**Key Features**:
- **Responsive Design**: Tailwind CSS breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Infinite Scroll**: Detect scroll position, load next page automatically
- **Search Debouncing**: 300ms delay before triggering search API call
- **Optimistic UI**: Show loading states during API calls
- **Error Recovery**: Retry button for failed requests

## Data Models

### Article Data Model

```typescript
interface Article {
  id: string;                    // MongoDB ObjectId as string
  title: string;                 // Max 500 characters
  summary: string;               // Max 300 characters
  content: string;               // Full article text
  url: string;                   // Original article URL (unique)
  source: string;                // Source name (e.g., "TechCrunch")
  category: Category;            // Enum value
  publishedAt: Date;             // Original publication date
  processedAt: Date;             // When article was processed
  createdAt: Date;               // When stored in database
}
```

**Validation Rules**:
- `title`: Required, non-empty, max 500 chars
- `summary`: Required, non-empty, max 300 chars
- `url`: Required, valid URL format, unique
- `source`: Required, non-empty
- `category`: Required, must be valid Category enum value
- `publishedAt`: Required, valid date, not in future
- `content`: Optional (some RSS feeds don't provide full content)

### RSS Source Configuration

```typescript
interface RSSSourceConfig {
  sources: RSSSource[];
}

interface RSSSource {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  url: string;                   // RSS feed URL
  category: Category;            // Default category for articles
  enabled: boolean;              // Whether to fetch from this source
}
```

**Example Configuration**:
```json
{
  "sources": [
    {
      "id": "techcrunch",
      "name": "TechCrunch",
      "url": "https://techcrunch.com/feed/",
      "category": "Technology",
      "enabled": true
    },
    {
      "id": "espn",
      "name": "ESPN",
      "url": "https://www.espn.com/espn/rss/news",
      "category": "Sports",
      "enabled": true
    }
  ]
}
```

### System Log Model

```typescript
interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  component: string;             // e.g., "NewsCollector", "ContentProcessor"
  message: string;
  timestamp: Date;
  metadata?: {
    executionId?: string;
    articleCount?: number;
    duration?: number;
    error?: {
      name: string;
      message: string;
      stack?: string;
    };
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, I need to analyze which acceptance criteria are suitable for property-based testing.

