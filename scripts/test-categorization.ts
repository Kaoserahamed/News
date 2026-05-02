/**
 * Simple test script to verify categorization functionality
 */

import { categorizeArticle } from '../lib/utils/categorization';
import { Category } from '../lib/models/category';
import type { RawArticle } from '../lib/models/article';

// Test articles for each category
const testArticles: Array<{ article: RawArticle; expectedCategory: Category }> = [
  {
    article: {
      title: 'Apple Announces New iPhone with AI Features',
      summary: 'Apple unveiled its latest smartphone with advanced artificial intelligence capabilities',
      content: 'The tech giant revealed new AI-powered features in their latest device',
      link: 'https://example.com/apple-iphone',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'TechCrunch'
    },
    expectedCategory: Category.TECHNOLOGY
  },
  {
    article: {
      title: 'Lakers Win Championship in Overtime Thriller',
      summary: 'The Los Angeles Lakers defeated their rivals in an exciting overtime game',
      content: 'The NBA finals concluded with a dramatic victory for the Lakers',
      link: 'https://example.com/lakers-win',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'ESPN'
    },
    expectedCategory: Category.SPORTS
  },
  {
    article: {
      title: 'Stock Market Reaches Record High',
      summary: 'Wall Street celebrates as major indices hit all-time highs',
      content: 'Investors saw significant gains as the S&P 500 and Dow Jones reached record levels',
      link: 'https://example.com/stock-market',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'Bloomberg'
    },
    expectedCategory: Category.BUSINESS
  },
  {
    article: {
      title: 'President Signs New Healthcare Bill',
      summary: 'Congress passes major healthcare reform legislation',
      content: 'The White House announced the signing of comprehensive healthcare policy changes',
      link: 'https://example.com/healthcare-bill',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'CNN Politics'
    },
    expectedCategory: Category.POLITICS
  },
  {
    article: {
      title: 'New Marvel Movie Breaks Box Office Records',
      summary: 'The latest superhero film from Marvel Studios dominates theaters',
      content: 'Hollywood celebrates as the new Marvel movie becomes the highest-grossing film of the year',
      link: 'https://example.com/marvel-movie',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'Variety'
    },
    expectedCategory: Category.ENTERTAINMENT
  },
  {
    article: {
      title: 'Morning Commute Delayed by Road Construction',
      summary: 'Drivers experience longer travel times due to roadwork',
      content: 'Construction crews are working on repairs that will continue through next week',
      link: 'https://example.com/traffic',
      pubDate: '2024-01-15T10:00:00Z',
      source: 'Local News'
    },
    expectedCategory: Category.GENERAL
  }
];

console.log('Testing Article Categorization\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const { article, expectedCategory } of testArticles) {
  const result = categorizeArticle(article);
  const isCorrect = result === expectedCategory;
  
  if (isCorrect) {
    passed++;
    console.log(`✓ PASS: "${article.title}"`);
    console.log(`  Expected: ${expectedCategory}, Got: ${result}\n`);
  } else {
    failed++;
    console.log(`✗ FAIL: "${article.title}"`);
    console.log(`  Expected: ${expectedCategory}, Got: ${result}\n`);
  }
}

console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testArticles.length} tests`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
