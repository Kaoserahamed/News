/**
 * Test edge cases for article categorization
 */

import { categorizeArticle } from '../lib/utils/categorization';
import type { RawArticle } from '../lib/models/article';

const edgeCases: RawArticle[] = [
  {
    title: 'Random Article with No Keywords',
    summary: 'This article contains no category-specific keywords',
    content: 'Just some random text here',
    link: 'https://example.com/random',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Test'
  },
  {
    title: 'Article with Multiple Category Keywords',
    summary: 'Tech company CEO discusses sports investment and political impact',
    content: 'Apple CEO talks about NBA team acquisition and government policy',
    link: 'https://example.com/multi',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Test'
  },
  {
    title: '',
    summary: '',
    content: '',
    link: 'https://example.com/empty',
    pubDate: '2024-01-15T10:00:00Z',
    source: 'Test'
  }
];

console.log('Edge Case Testing\n');
console.log('=' .repeat(60));

edgeCases.forEach((article, index) => {
  const category = categorizeArticle(article);
  console.log(`\n${index + 1}. "${article.title || '(empty)'}"`);
  console.log(`   Category: ${category}`);
  console.log(`   Expected: ${index === 0 ? 'General' : index === 1 ? 'Technology (most matches)' : 'General'}`);
});

console.log('\n' + '='.repeat(60));
