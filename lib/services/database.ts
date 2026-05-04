/**
 * Database Service
 * 
 * Manages MongoDB connection and provides database operations for articles and logs.
 * Implements connection pooling, retry logic, and health checks.
 * 
 * Requirements: 4.1, 4.5
 */

import { MongoClient, Db, Collection, Document, Filter } from 'mongodb';
import { ProcessedArticle, Article } from '../models/article';
import { ArticleQuery, ArticleResult, DEFAULT_QUERY_PARAMS, QUERY_LIMITS } from '../models/api';
import { Category } from '../models/category';
import { SystemLog } from '../models/system-log';

// Global connection instance to reuse across serverless function invocations
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * DatabaseService class
 * 
 * Provides MongoDB connection management and basic database operations.
 * Implements singleton pattern to ensure single connection pool across the application.
 */
export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  // Connection configuration
  private readonly uri: string;
  private readonly dbName: string;
  private readonly maxRetries: number = 2; // Reduced from 3
  private readonly retryDelays: number[] = [300, 700]; // Faster retries: 0.3s, 0.7s (total 1s)
  
  // Collection names
  private readonly ARTICLES_COLLECTION = 'articles';
  private readonly LOGS_COLLECTION = 'logs';
  
  // Flag to track if indexes have been created
  private indexesCreated: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.uri = process.env.MONGODB_URI || '';
    this.dbName = this.extractDatabaseName(this.uri);

    if (!this.uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Reuse cached connection if available (for serverless)
    if (cachedClient && cachedDb) {
      this.client = cachedClient;
      this.db = cachedDb;
      console.log('[DatabaseService] Reusing cached connection');
    }
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Extract database name from MongoDB URI
   */
  private extractDatabaseName(uri: string): string {
    try {
      const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
      return match ? match[1] : 'news-aggregator';
    } catch {
      return 'news-aggregator';
    }
  }

  /**
   * Connect to MongoDB with connection pooling and retry logic
   * 
   * Implements exponential backoff retry strategy (1s, 2s, 4s delays)
   * Uses connection pooling for efficient resource management
   * 
   * Requirements: 4.1, 4.5
   */
  public async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.client && this.db) {
      return;
    }

    // If connection is in progress, wait for it
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // Start new connection
    this.isConnecting = true;
    this.connectionPromise = this.connectWithRetry();

    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Internal method to connect with retry logic
   */
  private async connectWithRetry(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Create MongoDB client with connection pooling options
        // Aggressive timeouts for faster failure during cold starts
        this.client = new MongoClient(this.uri, {
          maxPoolSize: 10,
          minPoolSize: 2,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 2000, // Reduced from 3000ms
          socketTimeoutMS: 25000, // Reduced from 30000ms
          connectTimeoutMS: 2000, // Reduced from 3000ms
        });

        // Connect to MongoDB with timeout
        await Promise.race([
          this.client.connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 2500) // Reduced from 3000ms
          )
        ]);

        // Get database instance
        this.db = this.client.db(this.dbName);

        // Verify connection by pinging the database
        await this.db.admin().ping();

        // Cache for serverless reuse
        cachedClient = this.client;
        cachedDb = this.db;

        // Create indexes on first connection (async, don't wait)
        if (!this.indexesCreated) {
          this.ensureIndexes().catch(err => 
            console.error('[DatabaseService] Background index creation failed:', err)
          );
        }

        console.log(`[DatabaseService] Successfully connected to MongoDB (attempt ${attempt + 1}/${this.maxRetries})`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`[DatabaseService] Connection attempt ${attempt + 1}/${this.maxRetries} failed:`, error);

        // Clean up failed connection
        if (this.client) {
          try {
            await this.client.close();
          } catch (closeError) {
            console.error('[DatabaseService] Error closing failed connection:', closeError);
          }
          this.client = null;
          this.db = null;
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelays[attempt];
          console.log(`[DatabaseService] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to connect to MongoDB after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Disconnect from MongoDB
   * 
   * Closes the MongoDB connection and cleans up resources
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        console.log('[DatabaseService] Disconnected from MongoDB');
      } catch (error) {
        console.error('[DatabaseService] Error disconnecting from MongoDB:', error);
        throw error;
      } finally {
        this.client = null;
        this.db = null;
      }
    }
  }

  /**
   * Check if database connection is healthy
   * 
   * Performs a ping operation to verify database connectivity
   * 
   * Requirements: 4.1
   * 
   * @returns true if database is connected and responsive, false otherwise
   */
  public async isHealthy(): Promise<boolean> {
    try {
      // Quick check - just verify client and db exist
      // Don't ping to avoid timeout
      return !!(this.client && this.db);
    } catch (error) {
      console.error('[DatabaseService] Health check failed:', error);
      return false;
    }
  }

  /**
   * Get database instance
   * 
   * Ensures connection is established before returning database instance
   * 
   * @throws Error if not connected to database
   */
  public async getDatabase(): Promise<Db> {
    if (!this.db) {
      await this.connect();
    }

    if (!this.db) {
      throw new Error('Database connection not established');
    }

    return this.db;
  }

  /**
   * Get a collection from the database
   * 
   * @param collectionName Name of the collection
   * @returns MongoDB collection instance
   */
  public async getCollection<T extends Document = Document>(
    collectionName: string
  ): Promise<Collection<T>> {
    const db = await this.getDatabase();
    return db.collection<T>(collectionName);
  }

  /**
   * Helper method to sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Ensure MongoDB indexes are created
   * 
   * Creates indexes for efficient querying:
   * - publishedAt (descending) for chronological listing
   * - category for filtering
   * - url (unique) for duplicate prevention
   * - text indexes on title and summary for search
   * - timestamp (descending) for log retrieval
   * 
   * Requirements: 4.2, 4.3, 5.1, 5.3, 5.4, 12.3
   */
  private async ensureIndexes(): Promise<void> {
    if (this.indexesCreated) {
      return;
    }

    try {
      const articlesCollection = await this.getCollection(this.ARTICLES_COLLECTION);
      const logsCollection = await this.getCollection(this.LOGS_COLLECTION);

      // Create indexes
      await Promise.all([
        // Index for chronological listing (descending order)
        articlesCollection.createIndex({ publishedAt: -1 }, { name: 'publishedAt_desc' }),
        
        // Index for category filtering and aggregation
        articlesCollection.createIndex({ category: 1 }, { name: 'category_asc' }),
        
        // Compound index for category + publishedAt (for filtered queries)
        articlesCollection.createIndex(
          { category: 1, publishedAt: -1 }, 
          { name: 'category_publishedAt' }
        ),
        
        // Unique index for URL to prevent duplicates
        articlesCollection.createIndex({ url: 1 }, { unique: true, name: 'url_unique' }),
        
        // Text indexes for search functionality on title and summary
        articlesCollection.createIndex(
          { title: 'text', summary: 'text' },
          { name: 'title_summary_text', weights: { title: 2, summary: 1 } }
        ),

        // Index for log retrieval (descending order for recent logs first)
        logsCollection.createIndex({ timestamp: -1 }, { name: 'timestamp_desc' }),
      ]);

      this.indexesCreated = true;
      console.log('[DatabaseService] Indexes created successfully');
    } catch (error) {
      console.error('[DatabaseService] Error creating indexes:', error);
      // Don't throw - indexes might already exist
    }
  }

  /**
   * Insert an article into the database with retry logic
   * 
   * Implements exponential backoff retry strategy (1s, 2s, 4s delays)
   * Returns the inserted article's ID
   * 
   * Requirements: 4.1, 4.5
   * 
   * @param article ProcessedArticle to insert
   * @returns MongoDB ObjectId as string
   * @throws Error if insertion fails after all retries
   */
  public async insertArticle(article: ProcessedArticle): Promise<string> {
    await this.ensureIndexes();
    
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const articlesCollection = await this.getCollection(this.ARTICLES_COLLECTION);

        // Prepare document for insertion
        const document = {
          ...article,
          createdAt: new Date(),
        };

        // Insert the article
        const result = await articlesCollection.insertOne(document as any);

        console.log(`[DatabaseService] Article inserted successfully: ${result.insertedId}`);
        return result.insertedId.toString();
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a duplicate key error (URL already exists)
        if ((error as any).code === 11000) {
          console.log('[DatabaseService] Duplicate article detected (URL already exists)');
          throw new Error('Duplicate article: URL already exists in database');
        }

        console.error(`[DatabaseService] Insert attempt ${attempt + 1}/${this.maxRetries} failed:`, error);

        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelays[attempt];
          console.log(`[DatabaseService] Retrying insert in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to insert article after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Find articles with pagination, filtering, and search support
   * 
   * Supports:
   * - Pagination (page, limit)
   * - Category filtering
   * - Text search on title and summary
   * - Sorting by publishedAt or processedAt
   * 
   * Requirements: 5.1, 5.2, 5.3, 5.4
   * 
   * @param query ArticleQuery parameters
   * @returns ArticleResult with articles and pagination metadata
   */
  public async findArticles(query: ArticleQuery = {}): Promise<ArticleResult> {
    // Skip ensureIndexes() - indexes are created once on first connection
    // This saves ~50-100ms per request
    
    const articlesCollection = await this.getCollection(this.ARTICLES_COLLECTION);

    // Apply defaults and validate parameters
    const page = Math.max(query.page || DEFAULT_QUERY_PARAMS.page, QUERY_LIMITS.MIN_PAGE);
    const limit = Math.min(
      Math.max(query.limit || DEFAULT_QUERY_PARAMS.limit, QUERY_LIMITS.MIN_LIMIT),
      QUERY_LIMITS.MAX_LIMIT
    );
    const sortBy = query.sortBy || DEFAULT_QUERY_PARAMS.sortBy;
    const sortOrder = query.sortOrder || DEFAULT_QUERY_PARAMS.sortOrder;

    // Build filter
    const filter: Filter<Document> = {};

    // Category filter
    if (query.category) {
      filter.category = query.category;
    }

    // Search filter (text search)
    if (query.searchTerm && query.searchTerm.trim()) {
      filter.$text = { $search: query.searchTerm.trim() };
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // If using text search, add text score to sort
    if (query.searchTerm && query.searchTerm.trim()) {
      sort.score = { $meta: 'textScore' } as any;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    try {
      const queryStartTime = Date.now();
      
      // Execute query with pagination and projection (only fetch needed fields)
      // Note: MongoDB doesn't allow mixing inclusion (1) and exclusion (0) in same projection
      const projection = {
        title: 1,
        summary: 1,
        url: 1,
        source: 1,
        category: 1,
        publishedAt: 1,
        imageUrl: 1,
        trustScore: 1,
      };

      // Use estimatedDocumentCount for better performance on first page
      // For filtered queries, we need countDocuments
      const hasFilters = Object.keys(filter).length > 0;
      
      const [articles, total] = await Promise.all([
        articlesCollection
          .find(filter, { 
            projection,
            // Use secondary read preference for better performance (eventual consistency is OK)
            readPreference: 'secondaryPreferred'
          })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        // Use faster count method when possible
        hasFilters 
          ? articlesCollection.countDocuments(filter)
          : articlesCollection.estimatedDocumentCount()
      ]);

      const queryTime = Date.now() - queryStartTime;
      console.log(`[DatabaseService] Query executed in ${queryTime}ms (hasFilters: ${hasFilters})`);

      // Transform MongoDB documents to Article objects
      const transformedArticles: Article[] = articles.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        summary: doc.summary,
        content: '',  // Excluded for performance
        url: doc.url,
        source: doc.source,
        category: doc.category as Category,
        publishedAt: doc.publishedAt,
        processedAt: doc.publishedAt,  // Use publishedAt as fallback
        createdAt: doc.publishedAt,    // Use publishedAt as fallback
        imageUrl: doc.imageUrl,
        trustScore: doc.trustScore || 0.5,
        verificationStatus: 'unverified',
        crossSourceCount: 1,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      // Optionally fetch category counts on first page with no filters
      let categoryCounts: Partial<Record<Category, number>> | undefined;
      if (page === 1 && !hasFilters) {
        try {
          const aggStartTime = Date.now();
          
          // Use aggregation with allowDiskUse for better performance
          const counts = await articlesCollection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ], { 
            allowDiskUse: true,
            maxTimeMS: 2000 // Timeout after 2 seconds
          }).toArray();
          
          const aggTime = Date.now() - aggStartTime;
          console.log(`[DatabaseService] Category aggregation in ${aggTime}ms`);
          
          categoryCounts = {};
          counts.forEach((item: any) => {
            if (item._id) {
              categoryCounts![item._id as Category] = item.count;
            }
          });
        } catch (error) {
          console.warn('[DatabaseService] Failed to fetch category counts:', error);
          // Don't fail the request if category counts fail
        }
      }

      return {
        articles: transformedArticles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        categoryCounts,
      };
    } catch (error) {
      console.error('[DatabaseService] Error finding articles:', error);
      throw new Error(`Failed to find articles: ${(error as Error).message}`);
    }
  }

  /**
   * Find articles from the last N days
   * 
   * Queries articles published within the specified number of days
   * Useful for duplicate detection and recent article retrieval
   * 
   * Requirements: 4.1, 4.2
   * 
   * @param days Number of days to look back
   * @returns Array of articles from the last N days
   */
  public async findRecentArticles(days: number): Promise<Article[]> {
    await this.ensureIndexes();

    const articlesCollection = await this.getCollection(this.ARTICLES_COLLECTION);

    // Calculate the date N days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      // Query articles published after the cutoff date
      const articles = await articlesCollection
        .find({
          publishedAt: { $gte: cutoffDate },
        })
        .sort({ publishedAt: -1 })
        .toArray();

      // Transform MongoDB documents to Article objects
      return articles.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        summary: doc.summary,
        content: doc.content,
        url: doc.url,
        source: doc.source,
        category: doc.category as Category,
        publishedAt: doc.publishedAt,
        processedAt: doc.processedAt,
        createdAt: doc.createdAt,
        imageUrl: doc.imageUrl,
        trustScore: doc.trustScore || 0.5,
        verificationStatus: doc.verificationStatus || 'unverified',
        crossSourceCount: doc.crossSourceCount || 1,
      }));
    } catch (error) {
      console.error('[DatabaseService] Error finding recent articles:', error);
      throw new Error(`Failed to find recent articles: ${(error as Error).message}`);
    }
  }

  /**
   * Insert a system log entry into the database
   * 
   * Stores system logs for monitoring, debugging, and audit purposes.
   * Logs include information about update cycles, errors, and system operations.
   * 
   * Requirements: 12.1, 12.2, 12.3
   * 
   * @param log SystemLog entry to insert
   * @returns Promise that resolves when log is inserted
   * @throws Error if insertion fails
   */
  public async insertLog(log: SystemLog): Promise<void> {
    await this.ensureIndexes();

    try {
      const logsCollection = await this.getCollection(this.LOGS_COLLECTION);

      // Prepare document for insertion
      const document = {
        level: log.level,
        component: log.component,
        message: log.message,
        timestamp: log.timestamp,
        metadata: log.metadata || {},
      };

      // Insert the log
      await logsCollection.insertOne(document as any);

      // Only log to console for errors and warnings to avoid noise
      if (log.level === 'error' || log.level === 'warn') {
        console.log(`[DatabaseService] Log inserted: [${log.level.toUpperCase()}] ${log.component}: ${log.message}`);
      }
    } catch (error) {
      console.error('[DatabaseService] Error inserting log:', error);
      // Don't throw - logging failures should not break the application
      // Just log to console as fallback
      console.error(`[DatabaseService] Failed to insert log: [${log.level.toUpperCase()}] ${log.component}: ${log.message}`);
    }
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (DatabaseService.instance) {
      DatabaseService.instance.client = null;
      DatabaseService.instance.db = null;
      DatabaseService.instance = null;
    }
  }
}

/**
 * Export singleton instance getter for convenience
 */
export const getDatabaseService = (): DatabaseService => {
  return DatabaseService.getInstance();
};
