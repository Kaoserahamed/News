import { ContentProcessorService } from './content-processor';
import { RawArticle } from '../models/article';
import { Category } from '../models/category';

describe('ContentProcessorService', () => {
  let service: ContentProcessorService;

  beforeEach(() => {
    service = new ContentProcessorService();
  });

  describe('processArticle', () => {
    it('should process a complete raw article into a processed article', () => {
      const rawArticle: RawArticle = {
        title: '<h1>Breaking News: AI Breakthrough</h1>',
        summary: '  Scientists  have  made  a  major  breakthrough  in  artificial  intelligence.  ',
        content: '<p>This is the full content with <strong>HTML tags</strong>.</p>',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };

      const processed = service.processArticle(rawArticle);

      // Verify title is cleaned and normalized
      expect(processed.title).toBe('Breaking News: AI Breakthrough');
      
      // Verify summary is cleaned and normalized
      expect(processed.summary).toBe('Scientists have made a major breakthrough in artificial intelligence.');
      
      // Verify content is cleaned and normalized
      expect(processed.content).toBe('This is the full content with HTML tags.');
      
      // Verify URL is preserved
      expect(processed.url).toBe('https://example.com/article');
      
      // Verify source is preserved
      expect(processed.source).toBe('TechNews');
      
      // Verify category is assigned (should be Technology based on keywords)
      expect(processed.category).toBe(Category.TECHNOLOGY);
      
      // Verify publishedAt is parsed correctly
      expect(processed.publishedAt).toEqual(new Date('2024-01-15T10:00:00Z'));
      
      // Verify processedAt is set
      expect(processed.processedAt).toBeInstanceOf(Date);
      expect(processed.processedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should handle missing optional fields gracefully', () => {
      const rawArticle: RawArticle = {
        title: 'Simple Title',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
        // summary and content are missing
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.title).toBe('Simple Title');
      expect(processed.summary).toBe(''); // Should default to empty string
      expect(processed.content).toBe(''); // Should default to empty string
      expect(processed.url).toBe('https://example.com/article');
      expect(processed.source).toBe('NewsSource');
      expect(processed.category).toBe(Category.GENERAL); // No keywords to match
      expect(processed.publishedAt).toBeInstanceOf(Date);
      expect(processed.processedAt).toBeInstanceOf(Date);
    });

    it('should use content as fallback for summary when summary is missing', () => {
      const rawArticle: RawArticle = {
        title: 'Article Title',
        content: 'This is the content that should be used as summary.',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.summary).toBe('This is the content that should be used as summary.');
      expect(processed.content).toBe('This is the content that should be used as summary.');
    });

    it('should use summary as fallback for content when content is missing', () => {
      const rawArticle: RawArticle = {
        title: 'Article Title',
        summary: 'This is the summary that should be used as content.',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.summary).toBe('This is the summary that should be used as content.');
      expect(processed.content).toBe('This is the summary that should be used as content.');
    });

    it('should truncate long summaries to 300 characters', () => {
      const longText = 'a'.repeat(400);
      const rawArticle: RawArticle = {
        title: 'Article Title',
        summary: longText,
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.summary.length).toBeLessThanOrEqual(300);
      expect(processed.summary).toContain('...');
    });

    it('should handle empty title gracefully', () => {
      const rawArticle: RawArticle = {
        title: '',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.title).toBe('');
      expect(processed.url).toBe('https://example.com/article');
    });

    it('should handle invalid date gracefully', () => {
      const rawArticle: RawArticle = {
        title: 'Article Title',
        link: 'https://example.com/article',
        pubDate: 'invalid-date',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      // Should default to current date
      expect(processed.publishedAt).toBeInstanceOf(Date);
      expect(processed.publishedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should handle HTML entities in title and summary', () => {
      const rawArticle: RawArticle = {
        title: 'Breaking &amp; Important News',
        summary: 'This &quot;article&quot; is about &lt;technology&gt;',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);

      expect(processed.title).toBe('Breaking & Important News');
      expect(processed.summary).toBe('This "article" is about <technology>');
    });

    it('should set processedAt timestamp', () => {
      const beforeProcessing = Date.now();
      
      const rawArticle: RawArticle = {
        title: 'Article Title',
        link: 'https://example.com/article',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };

      const processed = service.processArticle(rawArticle);
      
      const afterProcessing = Date.now();

      expect(processed.processedAt).toBeInstanceOf(Date);
      expect(processed.processedAt.getTime()).toBeGreaterThanOrEqual(beforeProcessing);
      expect(processed.processedAt.getTime()).toBeLessThanOrEqual(afterProcessing);
    });
  });
});
