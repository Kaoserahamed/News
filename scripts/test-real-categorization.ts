import 'dotenv/config';
import { NewsCollectorService } from '../lib/services/news-collector';
import { ContentProcessorService } from '../lib/services/content-processor';
import { Category } from '../lib/models/category';

/**
 * Test categorization with real articles from Bangladesh RSS feeds
 * Shows how articles are being categorized in production
 */

async function testRealCategorization() {
  console.log('🧪 Testing Categorization with Real Bangladesh Articles\n');
  console.log('='.repeat(80));
  
  try {
    // Fetch real articles
    console.log('📰 Fetching articles from Bangladesh sources...\n');
    const collector = new NewsCollectorService();
    const rawArticles = await collector.fetchAllSources();
    
    if (rawArticles.length === 0) {
      console.log('❌ No articles fetched. Check your RSS sources.');
      return;
    }
    
    console.log(`✅ Fetched ${rawArticles.length} articles\n`);
    console.log('='.repeat(80));
    
    // Process and categorize
    const processor = new ContentProcessorService();
    const categoryCounts: Record<Category, number> = {
      [Category.TECHNOLOGY]: 0,
      [Category.SPORTS]: 0,
      [Category.BUSINESS]: 0,
      [Category.POLITICS]: 0,
      [Category.ENTERTAINMENT]: 0,
      [Category.GENERAL]: 0
    };
    
    const samplesByCategory: Record<Category, string[]> = {
      [Category.TECHNOLOGY]: [],
      [Category.SPORTS]: [],
      [Category.BUSINESS]: [],
      [Category.POLITICS]: [],
      [Category.ENTERTAINMENT]: [],
      [Category.GENERAL]: []
    };
    
    // Process each article
    for (const raw of rawArticles) {
      const processed = processor.processArticle(raw);
      categoryCounts[processed.category]++;
      
      // Store sample titles (max 3 per category)
      if (samplesByCategory[processed.category].length < 3) {
        const title = processed.title.substring(0, 80);
        samplesByCategory[processed.category].push(
          `${title}${processed.title.length > 80 ? '...' : ''}`
        );
      }
    }
    
    // Display results
    console.log('\n📊 Categorization Results:\n');
    
    const categoryNamesBangla: Record<Category, string> = {
      [Category.TECHNOLOGY]: 'প্রযুক্তি (Technology)',
      [Category.SPORTS]: 'খেলাধুলা (Sports)',
      [Category.BUSINESS]: 'ব্যবসা (Business)',
      [Category.POLITICS]: 'রাজনীতি (Politics)',
      [Category.ENTERTAINMENT]: 'বিনোদন (Entertainment)',
      [Category.GENERAL]: 'সাধারণ (General)'
    };
    
    for (const [category, count] of Object.entries(categoryCounts)) {
      const percentage = ((count / rawArticles.length) * 100).toFixed(1);
      const categoryName = categoryNamesBangla[category as Category];
      
      console.log(`${categoryName}:`);
      console.log(`  Count: ${count} (${percentage}%)`);
      
      if (count > 0 && samplesByCategory[category as Category].length > 0) {
        console.log(`  Samples:`);
        samplesByCategory[category as Category].forEach((title, index) => {
          console.log(`    ${index + 1}. ${title}`);
        });
      }
      console.log('');
    }
    
    console.log('='.repeat(80));
    
    // Summary
    const nonGeneral = rawArticles.length - categoryCounts[Category.GENERAL];
    const categorizationRate = ((nonGeneral / rawArticles.length) * 100).toFixed(1);
    
    console.log('\n📈 Summary:');
    console.log(`  Total Articles: ${rawArticles.length}`);
    console.log(`  Categorized: ${nonGeneral} (${categorizationRate}%)`);
    console.log(`  General: ${categoryCounts[Category.GENERAL]} (${(100 - parseFloat(categorizationRate)).toFixed(1)}%)`);
    
    if (parseFloat(categorizationRate) >= 70) {
      console.log('\n✅ Categorization is working well! Most articles are properly categorized.');
    } else if (parseFloat(categorizationRate) >= 50) {
      console.log('\n⚠️  Categorization is working but could be improved. Consider adding more keywords.');
    } else {
      console.log('\n❌ Low categorization rate. Review keywords and RSS sources.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testRealCategorization();
