/**
 * Test script to demonstrate DuplicateDetectorService functionality
 * 
 * This script shows how the similarity calculation works with various examples.
 */

import { DuplicateDetectorService } from '../lib/services/duplicate-detector';
import { ProcessedArticle } from '../lib/models/article';
import { Category } from '../lib/models/category';

const service = new DuplicateDetectorService();

console.log('=== Duplicate Detector Service Test ===\n');

// Test 1: Similarity Calculation Examples
console.log('1. Similarity Calculation Examples:');
console.log('-----------------------------------');

const testPairs = [
  ['Breaking News: AI Breakthrough', 'Breaking News: AI Breakthrough'],
  ['Breaking News: AI Breakthrough', 'Breaking News: AI Breakthrough!'],
  ['Breaking News: AI Breakthrough', 'BREAKING NEWS: AI BREAKTHROUGH'],
  ['Breaking News: AI Breakthrough', 'Breaking: AI Makes Breakthrough'],
  ['Breaking News: AI Breakthrough', 'Sports Update: Team Wins'],
  ['hello world', 'hello world'],
  ['hello world', 'hello world!'],
  ['hello world', 'goodbye world'],
  ['kitten', 'sitting'],
  ['', ''],
];

testPairs.forEach(([str1, str2]) => {
  const similarity = service.calculateSimilarity(str1, str2);
  const percentage = (similarity * 100).toFixed(1);
  console.log(`"${str1}" vs "${str2}"`);
  console.log(`  Similarity: ${similarity.toFixed(4)} (${percentage}%)`);
  console.log(`  Duplicate? ${similarity >= 0.9 ? 'YES' : 'NO'}\n`);
});

// Test 2: URL Duplicate Detection
console.log('\n2. URL Duplicate Detection:');
console.log('---------------------------');

const existingArticles: ProcessedArticle[] = [
  {
    title: 'Article 1',
    summary: 'Summary 1',
    content: 'Content 1',
    url: 'https://example.com/article1',
    source: 'TechNews',
    category: Category.TECHNOLOGY,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    processedAt: new Date('2024-01-15T10:05:00Z'),
  },
  {
    title: 'Article 2',
    summary: 'Summary 2',
    content: 'Content 2',
    url: 'https://example.com/article2',
    source: 'SportsNews',
    category: Category.SPORTS,
    publishedAt: new Date('2024-01-15T11:00:00Z'),
    processedAt: new Date('2024-01-15T11:05:00Z'),
  },
];

const urlTests = [
  'https://example.com/article1',
  'HTTPS://EXAMPLE.COM/ARTICLE1',
  'https://example.com/article3',
  '  https://example.com/article2  ',
];

urlTests.forEach((url) => {
  const isDuplicate = service.checkURLDuplicate(url, existingArticles);
  console.log(`URL: "${url}"`);
  console.log(`  Duplicate? ${isDuplicate ? 'YES' : 'NO'}\n`);
});

// Test 3: Title Similarity Detection
console.log('\n3. Title Similarity Detection:');
console.log('------------------------------');

const titleTests = [
  'Article 1',
  'Article 1!',
  'ARTICLE 1',
  'Article 2',
  'Completely Different Title',
];

titleTests.forEach((title) => {
  const isDuplicate = service.checkTitleSimilarity(title, existingArticles);
  console.log(`Title: "${title}"`);
  console.log(`  Duplicate? ${isDuplicate ? 'YES' : 'NO'}\n`);
});

// Test 4: Full Duplicate Detection
console.log('\n4. Full Duplicate Detection:');
console.log('----------------------------');

const testArticles: ProcessedArticle[] = [
  {
    title: 'Different Title',
    summary: 'Summary',
    content: 'Content',
    url: 'https://example.com/article1', // Same URL as existing
    source: 'Source',
    category: Category.GENERAL,
    publishedAt: new Date(),
    processedAt: new Date(),
  },
  {
    title: 'Article 1', // Same title as existing
    summary: 'Summary',
    content: 'Content',
    url: 'https://example.com/new-article',
    source: 'Source',
    category: Category.GENERAL,
    publishedAt: new Date(),
    processedAt: new Date(),
  },
  {
    title: 'Brand New Article',
    summary: 'Summary',
    content: 'Content',
    url: 'https://example.com/brand-new',
    source: 'Source',
    category: Category.GENERAL,
    publishedAt: new Date(),
    processedAt: new Date(),
  },
];

testArticles.forEach((article, index) => {
  const isDuplicate = service.isDuplicate(article, existingArticles);
  console.log(`Test Article ${index + 1}:`);
  console.log(`  Title: "${article.title}"`);
  console.log(`  URL: "${article.url}"`);
  console.log(`  Duplicate? ${isDuplicate ? 'YES' : 'NO'}\n`);
});

console.log('=== Test Complete ===');
