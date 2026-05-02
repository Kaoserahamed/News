/**
 * Unit tests for article categorization
 */

import { categorizeArticle } from './categorization';
import { Category } from '../models/category';
import type { RawArticle } from '../models/article';

describe('categorizeArticle', () => {
  describe('Technology category', () => {
    it('should categorize article with technology keywords in title', () => {
      const article: RawArticle = {
        title: 'New AI breakthrough in machine learning',
        summary: 'Scientists discover new approach',
        content: 'Details about the discovery',
        link: 'https://example.com/article1',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });

    it('should categorize article with technology keywords in summary', () => {
      const article: RawArticle = {
        title: 'Latest developments',
        summary: 'Apple releases new iPhone with advanced software features',
        content: '',
        link: 'https://example.com/article2',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });

    it('should categorize article with technology keywords in content', () => {
      const article: RawArticle = {
        title: 'Industry update',
        summary: 'Recent changes',
        content: 'The startup raised funding for their blockchain platform using cryptocurrency',
        link: 'https://example.com/article3',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });
  });

  describe('Sports category', () => {
    it('should categorize article with sports keywords', () => {
      const article: RawArticle = {
        title: 'NBA Finals: Lakers win championship',
        summary: 'Basketball team secures victory in playoffs',
        content: 'The team played an amazing game',
        link: 'https://example.com/article4',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'ESPN'
      };
      
      expect(categorizeArticle(article)).toBe(Category.SPORTS);
    });

    it('should categorize football article', () => {
      const article: RawArticle = {
        title: 'Super Bowl preview',
        summary: 'NFL teams prepare for the big game',
        content: 'Analysis of the upcoming match',
        link: 'https://example.com/article5',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'ESPN'
      };
      
      expect(categorizeArticle(article)).toBe(Category.SPORTS);
    });
  });

  describe('Business category', () => {
    it('should categorize article with business keywords', () => {
      const article: RawArticle = {
        title: 'Stock market reaches new high',
        summary: 'Wall Street celebrates as Dow Jones hits record',
        content: 'Investors are optimistic about the economy',
        link: 'https://example.com/article6',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'Bloomberg'
      };
      
      expect(categorizeArticle(article)).toBe(Category.BUSINESS);
    });

    it('should categorize merger and acquisition news', () => {
      const article: RawArticle = {
        title: 'Company announces major acquisition',
        summary: 'CEO discusses merger strategy and financial implications',
        content: 'The deal is valued at billions',
        link: 'https://example.com/article7',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'Bloomberg'
      };
      
      expect(categorizeArticle(article)).toBe(Category.BUSINESS);
    });
  });

  describe('Politics category', () => {
    it('should categorize article with politics keywords', () => {
      const article: RawArticle = {
        title: 'President signs new legislation',
        summary: 'Congress passes bill after lengthy debate',
        content: 'The new law will affect millions',
        link: 'https://example.com/article8',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'PoliticsDaily'
      };
      
      expect(categorizeArticle(article)).toBe(Category.POLITICS);
    });

    it('should categorize election news', () => {
      const article: RawArticle = {
        title: 'Campaign trail update',
        summary: 'Presidential candidates debate policy reforms',
        content: 'Voters will decide in November',
        link: 'https://example.com/article9',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'PoliticsDaily'
      };
      
      expect(categorizeArticle(article)).toBe(Category.POLITICS);
    });
  });

  describe('Entertainment category', () => {
    it('should categorize article with entertainment keywords', () => {
      const article: RawArticle = {
        title: 'New movie breaks box office records',
        summary: 'Hollywood celebrates as film earns millions',
        content: 'The director and actors attended the premiere',
        link: 'https://example.com/article10',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'EntertainmentWeekly'
      };
      
      expect(categorizeArticle(article)).toBe(Category.ENTERTAINMENT);
    });

    it('should categorize music news', () => {
      const article: RawArticle = {
        title: 'Grammy Awards announced',
        summary: 'Popular artist wins album of the year',
        content: 'The singer performed at the ceremony',
        link: 'https://example.com/article11',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'EntertainmentWeekly'
      };
      
      expect(categorizeArticle(article)).toBe(Category.ENTERTAINMENT);
    });

    it('should categorize streaming service news', () => {
      const article: RawArticle = {
        title: 'Netflix releases new series',
        summary: 'Streaming platform announces upcoming shows',
        content: 'The series will premiere next month',
        link: 'https://example.com/article12',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'EntertainmentWeekly'
      };
      
      expect(categorizeArticle(article)).toBe(Category.ENTERTAINMENT);
    });
  });

  describe('General category (default)', () => {
    it('should default to General when no keywords match', () => {
      const article: RawArticle = {
        title: 'Xyz abc def',
        summary: 'Qwerty uiop asdf',
        content: 'Zxcv bnm lkj',
        link: 'https://example.com/article13',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };
      
      expect(categorizeArticle(article)).toBe(Category.GENERAL);
    });

    it('should default to General for empty content', () => {
      const article: RawArticle = {
        title: '',
        summary: '',
        content: '',
        link: 'https://example.com/article14',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };
      
      expect(categorizeArticle(article)).toBe(Category.GENERAL);
    });

    it('should default to General when summary and content are undefined', () => {
      const article: RawArticle = {
        title: 'Vague headline',
        link: 'https://example.com/article15',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };
      
      expect(categorizeArticle(article)).toBe(Category.GENERAL);
    });
  });

  describe('Case insensitivity', () => {
    it('should match keywords regardless of case', () => {
      const article: RawArticle = {
        title: 'TECHNOLOGY NEWS',
        summary: 'SOFTWARE UPDATE',
        content: 'ARTIFICIAL INTELLIGENCE',
        link: 'https://example.com/article16',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });

    it('should match mixed case keywords', () => {
      const article: RawArticle = {
        title: 'BaSKeTBaLl GaMe',
        summary: 'NBA PlAyOfFs',
        content: 'ChAmPiOnShIp',
        link: 'https://example.com/article17',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'ESPN'
      };
      
      expect(categorizeArticle(article)).toBe(Category.SPORTS);
    });
  });

  describe('Multiple category keywords', () => {
    it('should choose category with most keyword matches', () => {
      // Article with both tech and business keywords, but more tech keywords
      const article: RawArticle = {
        title: 'Tech startup raises funding',
        summary: 'Software company secures investment for AI platform',
        content: 'The technology firm will use the money to develop new algorithms',
        link: 'https://example.com/article18',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });

    it('should handle tie-breaking by first match', () => {
      // Article with equal keywords from different categories
      const article: RawArticle = {
        title: 'Sports business',
        summary: 'Team finances',
        content: 'Economic impact',
        link: 'https://example.com/article19',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'NewsSource'
      };
      
      // Should return one of the categories (implementation dependent)
      const result = categorizeArticle(article);
      expect([Category.SPORTS, Category.BUSINESS]).toContain(result);
    });
  });

  describe('Edge cases', () => {
    it('should handle articles with only title', () => {
      const article: RawArticle = {
        title: 'Basketball championship game',
        link: 'https://example.com/article20',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'ESPN'
      };
      
      expect(categorizeArticle(article)).toBe(Category.SPORTS);
    });

    it('should handle very long content', () => {
      const longContent = 'technology '.repeat(1000) + 'software development';
      const article: RawArticle = {
        title: 'Tech article',
        summary: 'About technology',
        content: longContent,
        link: 'https://example.com/article21',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });

    it('should handle special characters in content', () => {
      const article: RawArticle = {
        title: 'Tech@2024: AI & ML Revolution!',
        summary: 'Software (v2.0) updates #technology',
        content: 'Artificial-intelligence, machine_learning, and more...',
        link: 'https://example.com/article22',
        pubDate: '2024-01-15T10:00:00Z',
        source: 'TechNews'
      };
      
      expect(categorizeArticle(article)).toBe(Category.TECHNOLOGY);
    });
  });
});
