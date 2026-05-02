/**
 * Verification script for article categorization
 * Demonstrates the categorizeArticle function with sample articles
 */

import { categorizeArticle } from '../lib/utils/categorization';
import type { RawArticle } from '../lib/models/article';

// Sample articles for testing
const sampleArticles: RawArticle[] = [
  {
    title: 'Apple Announces New iPhone with AI Features',
    summary: 'Apple unveiled its latest smartphone with advanced artificial intelligence capabilities',
    content: 'The tech giant revealed new machine learning features...',
    link: 'https://example.com/apple-iphone',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'TechCrunch'
  },
  {
    title: 'Lakers Win Championship Game',
    summary: 'The Los Angeles Lakers defeated their rivals in the NBA finals',
    content: 'In an exciting basketball match, the team secured victory...',
    link: 'https://example.com/lakers-win',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'ESPN'
  },
  {
    title: 'Stock Market Reaches New High',
    summary: 'Wall Street celebrates as the S&P 500 hits record levels',
    content: 'Investors are optimistic about the economy...',
    link: 'https://example.com/stock-market',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Bloomberg'
  },
  {
    title: 'President Signs New Healthcare Bill',
    summary: 'Congress passes major healthcare reform legislation',
    content: 'The new policy will affect millions of Americans...',
    link: 'https://example.com/healthcare-bill',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'CNN'
  },
  {
    title: 'New Marvel Movie Breaks Box Office Records',
    summary: 'The latest superhero film from Marvel Studios dominates theaters',
    content: 'Fans lined up for the premiere of the blockbuster...',
    link: 'https://example.com/marvel-movie',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Variety'
  },
  {
    title: 'Local Community Event This Weekend',
    summary: 'Residents invited to neighborhood gathering',
    content: 'The event will feature activities for all ages...',
    link: 'https://example.com/community-event',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Local News'
  }
];

console.log('Article Categorization Verification\n');
console.log('=' .repeat(60));

sampleArticles.forEach((article, index) => {
  const category = categorizeArticle(article);
  console.log(`\n${index + 1}. "${article.title}"`);
  console.log(`   Source: ${article.source}`);
  console.log(`   Category: ${category}`);
});

console.log('\n' + '='.repeat(60));
console.log('\nExpected Results:');
console.log('1. Technology (keywords: Apple, iPhone, AI, artificial intelligence)');
console.log('2. Sports (keywords: Lakers, Championship, NBA, basketball)');
console.log('3. Business (keywords: Stock Market, Wall Street, S&P 500, economy)');
console.log('4. Politics (keywords: President, Congress, healthcare, legislation, policy)');
console.log('5. Entertainment (keywords: Marvel, Movie, Box Office, superhero, film)');
console.log('6. General (no matching keywords)');
