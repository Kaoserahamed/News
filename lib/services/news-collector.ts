import Parser from 'rss-parser';
import { RawArticle } from '../models/article';
import { RSSSource, RSSSourceConfig } from '../models/rss-source';
import { createSystemLog } from '../models/system-log';
import fs from 'fs';
import path from 'path';

/**
 * NewsCollectorService handles fetching news articles from RSS feed sources
 */
export class NewsCollectorService {
  private parser: Parser;
  private readonly FETCH_TIMEOUT = 10000; // 10 seconds
  private sources: RSSSource[] = [];

  constructor() {
    this.parser = new Parser({
      timeout: this.FETCH_TIMEOUT,
    });
    this.loadSources();
  }

  /**
   * Load RSS sources from configuration file
   * @private
   */
  private loadSources(): void {
    try {
      const configPath = path.join(process.cwd(), 'config', 'rss-sources.json');
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config: RSSSourceConfig = JSON.parse(configData);
      this.sources = config.sources || [];
    } catch (error) {
      console.error('Failed to load RSS sources configuration:', error);
      this.sources = [];
    }
  }

  /**
   * Fetch articles from all enabled RSS sources
   * Processes sources concurrently with error handling
   * Logs errors for failed sources but continues with remaining sources
   * Returns combined array of articles from all successful sources
   * Logs execution timestamp and article count
   * 
   * Implements Requirements 1.1, 1.3, 1.4, 1.5
   * 
   * @returns Promise resolving to combined array of raw articles from all successful sources
   */
  async fetchAllSources(): Promise<RawArticle[]> {
    const startTime = new Date();
    const enabledSources = this.sources.filter(source => source.enabled);

    console.log(createSystemLog(
      'info',
      'NewsCollector',
      `Starting fetch from ${enabledSources.length} enabled sources`,
      { executionId: startTime.toISOString(), timestamp: startTime }
    ));

    // Fetch from all sources concurrently
    const fetchPromises = enabledSources.map(async (source) => {
      try {
        const articles = await this.fetchSource(source);
        console.log(createSystemLog(
          'info',
          'NewsCollector',
          `Successfully fetched ${articles.length} articles from ${source.name}`,
          { source: source.id, articleCount: articles.length }
        ));
        return articles;
      } catch (error) {
        // Log error but don't throw - continue with other sources
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(createSystemLog(
          'error',
          'NewsCollector',
          `Failed to fetch from ${source.name}: ${errorMessage}`,
          {
            source: source.id,
            error: {
              name: error instanceof Error ? error.name : 'Error',
              message: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            },
            timestamp: new Date(),
          }
        ));
        return []; // Return empty array for failed sources
      }
    });

    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);

    // Combine all articles into a single array
    const allArticles = results.flat();

    // Log completion with metrics
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(createSystemLog(
      'info',
      'NewsCollector',
      `Completed fetch from all sources: ${allArticles.length} total articles`,
      {
        executionId: startTime.toISOString(),
        articleCount: allArticles.length,
        duration,
        timestamp: endTime,
        sourcesProcessed: enabledSources.length,
      }
    ));

    return allArticles;
  }

  /**
   * Fetch articles from a single RSS source
   * Implements 10-second timeout per source
   * Extracts title, summary, content, link, pubDate, and source from RSS items
   * Handles missing optional fields (summary, content)
   * 
   * @param sourceConfig - RSS source configuration
   * @returns Array of raw articles from the source
   * @throws Error if fetch fails or times out
   */
  async fetchSource(sourceConfig: RSSSource): Promise<RawArticle[]> {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout fetching RSS feed from ${sourceConfig.name}`));
        }, this.FETCH_TIMEOUT);
      });

      // Race between fetch and timeout
      const feed = await Promise.race([
        this.parser.parseURL(sourceConfig.url),
        timeoutPromise,
      ]);

      // Extract articles from feed items
      const articles: RawArticle[] = [];

      if (feed.items && Array.isArray(feed.items)) {
        for (const item of feed.items) {
          // Skip items without required fields
          if (!item.title || !item.link || !item.pubDate) {
            continue;
          }

          // Extract article data
          const article: RawArticle = {
            title: item.title,
            summary: item.contentSnippet || item.summary || undefined,
            content: item.content || item['content:encoded'] || undefined,
            link: item.link,
            pubDate: item.pubDate,
            source: sourceConfig.name,
          };

          articles.push(article);
        }
      }

      return articles;
    } catch (error) {
      // Re-throw with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch RSS feed from ${sourceConfig.name}: ${errorMessage}`);
    }
  }
}
