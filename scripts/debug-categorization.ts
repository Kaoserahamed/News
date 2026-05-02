/**
 * Debug script to see which keywords are matching
 */

import { Category } from '../lib/models/category';
import type { RawArticle } from '../lib/models/article';

// Copy the keyword list from categorization.ts
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  [Category.TECHNOLOGY]: [
    'technology', 'tech', 'software', 'hardware', 'computer', 'internet',
    'digital', 'ai', 'artificial intelligence', 'machine learning', 'ml',
    'programming', 'coding', 'developer', 'app', 'application', 'mobile',
    'web', 'cloud', 'data', 'cybersecurity', 'security', 'hack', 'crypto',
    'blockchain', 'bitcoin', 'startup', 'silicon valley', 'gadget', 'device',
    'smartphone', 'tablet', 'laptop', 'robot', 'automation', 'innovation',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'iot', 'internet of things',
    '5g', 'network', 'algorithm', 'database', 'server', 'platform', 'api',
    'opensource', 'github', 'microsoft', 'apple', 'google', 'amazon', 'meta',
    'facebook', 'twitter', 'tesla', 'spacex', 'nvidia', 'intel', 'amd'
  ],
  [Category.SPORTS]: [],
  [Category.BUSINESS]: [],
  [Category.POLITICS]: [],
  [Category.ENTERTAINMENT]: [],
  [Category.GENERAL]: []
};

const article: RawArticle = {
  title: 'Random Article with No Keywords',
  summary: 'This article contains no category-specific keywords',
  content: 'Just some random text here',
  link: 'https://example.com/random',
  pubDate: '2024-01-15T10:00:00Z',
  source: 'Test'
};

const searchText = [
  article.title,
  article.summary || '',
  article.content || ''
].join(' ').toLowerCase();

console.log('Search text:', searchText);
console.log('\nMatching keywords:');

for (const keyword of CATEGORY_KEYWORDS[Category.TECHNOLOGY]) {
  if (searchText.includes(keyword.toLowerCase())) {
    console.log(`  - "${keyword}"`);
  }
}
