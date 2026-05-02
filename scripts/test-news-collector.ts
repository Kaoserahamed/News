/**
 * Test script for NewsCollectorService
 * Tests the fetchAllSources() method with real RSS feeds
 */

import { NewsCollectorService } from '../lib/services/news-collector';

async function testNewsCollector() {
  console.log('=== Testing NewsCollectorService ===\n');

  const collector = new NewsCollectorService();

  try {
    console.log('Fetching articles from all enabled sources...\n');
    const startTime = Date.now();
    
    const articles = await collector.fetchAllSources();
    
    const duration = Date.now() - startTime;

    console.log('\n=== Results ===');
    console.log(`Total articles fetched: ${articles.length}`);
    console.log(`Duration: ${duration}ms`);
    console.log('\nSample articles:');
    
    // Show first 3 articles
    articles.slice(0, 3).forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.source}`);
      console.log(`   Link: ${article.link}`);
      console.log(`   Published: ${article.pubDate}`);
      if (article.summary) {
        console.log(`   Summary: ${article.summary.substring(0, 100)}...`);
      }
    });

    // Group by source
    const bySource = articles.reduce((acc, article) => {
      acc[article.source] = (acc[article.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n=== Articles by Source ===');
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`${source}: ${count} articles`);
    });

  } catch (error) {
    console.error('Error testing news collector:', error);
    process.exit(1);
  }
}

testNewsCollector();
