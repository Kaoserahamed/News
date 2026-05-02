/**
 * Unit tests for DuplicateDetectorService
 * 
 * Tests similarity calculation, URL duplicate detection, and title similarity detection.
 */

import { DuplicateDetectorService } from './duplicate-detector';
import { ProcessedArticle } from '../models/article';
import { Category } from '../models/category';

describe('DuplicateDetectorService', () => {
  let service: DuplicateDetectorService;

  beforeEach(() => {
    service = new DuplicateDetectorService();
  });

  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      const similarity = service.calculateSimilarity('hello world', 'hello world');
      expect(similarity).toBe(1.0);
    });

    it('should return 1.0 for identical strings with different casing', () => {
      const similarity = service.calculateSimilarity('Hello World', 'hello world');
      expect(similarity).toBe(1.0);
    });

    it('should return 1.0 for identical strings with extra whitespace', () => {
      const similarity = service.calculateSimilarity('  hello world  ', 'hello world');
      expect(similarity).toBe(1.0);
    });

    it('should return 1.0 for both empty strings', () => {
      const similarity = service.calculateSimilarity('', '');
      expect(similarity).toBe(1.0);
    });

    it('should return 0.0 when one string is empty', () => {
      expect(service.calculateSimilarity('hello', '')).toBe(0.0);
      expect(service.calculateSimilarity('', 'world')).toBe(0.0);
    });

    it('should return high similarity for strings with minor differences', () => {
      // "hello world" vs "hello world!" - 1 character difference out of 12
      const similarity = service.calculateSimilarity('hello world', 'hello world!');
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should return low similarity for completely different strings', () => {
      const similarity = service.calculateSimilarity('hello world', 'xyz abc');
      expect(similarity).toBeLessThan(0.5);
    });

    it('should calculate correct similarity for single character difference', () => {
      // "test" vs "text" - 1 character difference out of 4
      const similarity = service.calculateSimilarity('test', 'text');
      expect(similarity).toBe(0.75); // 1 - (1/4) = 0.75
    });

    it('should calculate correct similarity for multiple character differences', () => {
      // "kitten" vs "sitting" - 3 character differences out of 7
      const similarity = service.calculateSimilarity('kitten', 'sitting');
      expect(similarity).toBeCloseTo(0.571, 2); // 1 - (3/7) ≈ 0.571
    });

    it('should handle strings of different lengths', () => {
      const similarity = service.calculateSimilarity('short', 'much longer string');
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should return value between 0 and 1', () => {
      const testCases = [
        ['hello', 'world'],
        ['test', 'test'],
        ['abc', 'xyz'],
        ['', 'something'],
        ['a', 'b'],
      ];

      testCases.forEach(([str1, str2]) => {
        const similarity = service.calculateSimilarity(str1, str2);
        expect(similarity).toBeGreaterThanOrEqual(0);
        expect(similarity).toBeLessThanOrEqual(1);
      });
    });

    it('should be case-insensitive', () => {
      const similarity1 = service.calculateSimilarity('HELLO', 'hello');
      const similarity2 = service.calculateSimilarity('HeLLo', 'hELlO');
      expect(similarity1).toBe(1.0);
      expect(similarity2).toBe(1.0);
    });

    it('should handle special characters', () => {
      const similarity = service.calculateSimilarity(
        'Breaking: AI Breakthrough!',
        'Breaking: AI Breakthrough?'
      );
      expect(similarity).toBeGreaterThan(0.95);
    });
  });

  describe('checkURLDuplicate', () => {
    const existingArticles: ProcessedArticle[] = [
      {
        title: 'Article 1',
        summary: 'Summary 1',
        content: 'Content 1',
        url: 'https://example.com/article1',
        source: 'Source 1',
        category: Category.TECHNOLOGY,
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        processedAt: new Date('2024-01-15T10:05:00Z'),
      },
      {
        title: 'Article 2',
        summary: 'Summary 2',
        content: 'Content 2',
        url: 'https://example.com/article2',
        source: 'Source 2',
        category: Category.SPORTS,
        publishedAt: new Date('2024-01-15T11:00:00Z'),
        processedAt: new Date('2024-01-15T11:05:00Z'),
      },
    ];

    it('should return true for exact URL match', () => {
      const isDuplicate = service.checkURLDuplicate(
        'https://example.com/article1',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return true for URL match with different casing', () => {
      const isDuplicate = service.checkURLDuplicate(
        'HTTPS://EXAMPLE.COM/ARTICLE1',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return true for URL match with extra whitespace', () => {
      const isDuplicate = service.checkURLDuplicate(
        '  https://example.com/article1  ',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return false for non-matching URL', () => {
      const isDuplicate = service.checkURLDuplicate(
        'https://example.com/article3',
        existingArticles
      );
      expect(isDuplicate).toBe(false);
    });

    it('should return false for empty URL', () => {
      const isDuplicate = service.checkURLDuplicate('', existingArticles);
      expect(isDuplicate).toBe(false);
    });

    it('should return false when existing articles array is empty', () => {
      const isDuplicate = service.checkURLDuplicate(
        'https://example.com/article1',
        []
      );
      expect(isDuplicate).toBe(false);
    });
  });

  describe('checkTitleSimilarity', () => {
    const existingArticles: ProcessedArticle[] = [
      {
        title: 'Breaking News: AI Makes Major Breakthrough',
        summary: 'Summary 1',
        content: 'Content 1',
        url: 'https://example.com/article1',
        source: 'Source 1',
        category: Category.TECHNOLOGY,
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        processedAt: new Date('2024-01-15T10:05:00Z'),
      },
      {
        title: 'Sports Update: Team Wins Championship',
        summary: 'Summary 2',
        content: 'Content 2',
        url: 'https://example.com/article2',
        source: 'Source 2',
        category: Category.SPORTS,
        publishedAt: new Date('2024-01-15T11:00:00Z'),
        processedAt: new Date('2024-01-15T11:05:00Z'),
      },
    ];

    it('should return true for identical title', () => {
      const isDuplicate = service.checkTitleSimilarity(
        'Breaking News: AI Makes Major Breakthrough',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return true for title with minor differences (>90% similar)', () => {
      // Very similar title with slight variation
      const isDuplicate = service.checkTitleSimilarity(
        'Breaking News: AI Makes Major Breakthrough!',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return true for title with different casing', () => {
      const isDuplicate = service.checkTitleSimilarity(
        'BREAKING NEWS: AI MAKES MAJOR BREAKTHROUGH',
        existingArticles
      );
      expect(isDuplicate).toBe(true);
    });

    it('should return false for significantly different title', () => {
      const isDuplicate = service.checkTitleSimilarity(
        'Completely Different Article About Weather',
        existingArticles
      );
      expect(isDuplicate).toBe(false);
    });

    it('should return false for empty title', () => {
      const isDuplicate = service.checkTitleSimilarity('', existingArticles);
      expect(isDuplicate).toBe(false);
    });

    it('should return false when existing articles array is empty', () => {
      const isDuplicate = service.checkTitleSimilarity(
        'Breaking News: AI Makes Major Breakthrough',
        []
      );
      expect(isDuplicate).toBe(false);
    });

    it('should detect similarity at exactly 90% threshold', () => {
      // Create a title that is exactly 90% similar
      // "0123456789" (10 chars) vs "012345678X" (1 char diff) = 90% similar
      const articles: ProcessedArticle[] = [
        {
          title: '0123456789',
          summary: 'Summary',
          content: 'Content',
          url: 'https://example.com/test',
          source: 'Source',
          category: Category.GENERAL,
          publishedAt: new Date(),
          processedAt: new Date(),
        },
      ];

      const isDuplicate = service.checkTitleSimilarity('012345678X', articles);
      expect(isDuplicate).toBe(true);
    });

    it('should not detect similarity below 90% threshold', () => {
      // Create a title that is less than 90% similar
      // "0123456789" (10 chars) vs "01234567XY" (2 char diff) = 80% similar
      const articles: ProcessedArticle[] = [
        {
          title: '0123456789',
          summary: 'Summary',
          content: 'Content',
          url: 'https://example.com/test',
          source: 'Source',
          category: Category.GENERAL,
          publishedAt: new Date(),
          processedAt: new Date(),
        },
      ];

      const isDuplicate = service.checkTitleSimilarity('01234567XY', articles);
      expect(isDuplicate).toBe(false);
    });
  });

  describe('isDuplicate', () => {
    const existingArticles: ProcessedArticle[] = [
      {
        title: 'Breaking News: AI Makes Major Breakthrough',
        summary: 'Summary 1',
        content: 'Content 1',
        url: 'https://example.com/article1',
        source: 'Source 1',
        category: Category.TECHNOLOGY,
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        processedAt: new Date('2024-01-15T10:05:00Z'),
      },
      {
        title: 'Sports Update: Team Wins Championship',
        summary: 'Summary 2',
        content: 'Content 2',
        url: 'https://example.com/article2',
        source: 'Source 2',
        category: Category.SPORTS,
        publishedAt: new Date('2024-01-15T11:00:00Z'),
        processedAt: new Date('2024-01-15T11:05:00Z'),
      },
    ];

    it('should return true when URL matches', () => {
      const article: ProcessedArticle = {
        title: 'Different Title',
        summary: 'Different Summary',
        content: 'Different Content',
        url: 'https://example.com/article1', // Same URL
        source: 'Different Source',
        category: Category.BUSINESS,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      const isDuplicate = service.isDuplicate(article, existingArticles);
      expect(isDuplicate).toBe(true);
    });

    it('should return true when title is similar (>90%)', () => {
      const article: ProcessedArticle = {
        title: 'Breaking News: AI Makes Major Breakthrough!', // Very similar title
        summary: 'Different Summary',
        content: 'Different Content',
        url: 'https://example.com/different-url',
        source: 'Different Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      const isDuplicate = service.isDuplicate(article, existingArticles);
      expect(isDuplicate).toBe(true);
    });

    it('should return true when both URL and title match', () => {
      const article: ProcessedArticle = {
        title: 'Breaking News: AI Makes Major Breakthrough',
        summary: 'Different Summary',
        content: 'Different Content',
        url: 'https://example.com/article1',
        source: 'Different Source',
        category: Category.TECHNOLOGY,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      const isDuplicate = service.isDuplicate(article, existingArticles);
      expect(isDuplicate).toBe(true);
    });

    it('should return false when neither URL nor title match', () => {
      const article: ProcessedArticle = {
        title: 'Completely Different Article About Weather',
        summary: 'Different Summary',
        content: 'Different Content',
        url: 'https://example.com/different-article',
        source: 'Different Source',
        category: Category.GENERAL,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      const isDuplicate = service.isDuplicate(article, existingArticles);
      expect(isDuplicate).toBe(false);
    });

    it('should return false when existing articles array is empty', () => {
      const article: ProcessedArticle = {
        title: 'Some Article',
        summary: 'Summary',
        content: 'Content',
        url: 'https://example.com/article',
        source: 'Source',
        category: Category.GENERAL,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      const isDuplicate = service.isDuplicate(article, []);
      expect(isDuplicate).toBe(false);
    });

    it('should check URL before title (performance optimization)', () => {
      // This test verifies that URL check happens first
      // by using a spy to ensure checkURLDuplicate is called
      const checkURLSpy = jest.spyOn(service, 'checkURLDuplicate');
      const checkTitleSpy = jest.spyOn(service, 'checkTitleSimilarity');

      const article: ProcessedArticle = {
        title: 'Different Title',
        summary: 'Summary',
        content: 'Content',
        url: 'https://example.com/article1', // URL matches
        source: 'Source',
        category: Category.GENERAL,
        publishedAt: new Date(),
        processedAt: new Date(),
      };

      service.isDuplicate(article, existingArticles);

      expect(checkURLSpy).toHaveBeenCalled();
      // Title check should not be called if URL already matched
      expect(checkTitleSpy).not.toHaveBeenCalled();

      checkURLSpy.mockRestore();
      checkTitleSpy.mockRestore();
    });
  });
});
