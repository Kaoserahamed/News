import 'dotenv/config';
import { getDatabaseService } from '../lib/services/database';
import { NewsCollectorService } from '../lib/services/news-collector';
import { ContentProcessorService } from '../lib/services/content-processor';

async function clearAndRefetch() {
  const db = getDatabaseService();
  
  try {
    await db.connect();
    console.log('✅ Connected to database\n');
    
    // Clear all articles
    console.log('🗑️  Clearing all articles from database...');
    const collection = (db as any).db.collection('articles');
    const deleteResult = await collection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} articles\n`);
    
    // Fetch new articles with images
    console.log('📰 Fetching articles from Bangladesh sources...');
    const collector = new NewsCollectorService();
    const rawArticles = await collector.fetchAllSources();
    console.log(`✅ Fetched ${rawArticles.length} raw articles\n`);
    
    // Process articles
    console.log('⚙️  Processing articles...');
    const processor = new ContentProcessorService();
    const processedArticles = rawArticles.map(raw => processor.processArticle(raw));
    console.log(`✅ Processed ${processedArticles.length} articles\n`);
    
    // Store articles
    console.log('💾 Storing articles in database...');
    let storedCount = 0;
    let withImages = 0;
    
    for (const article of processedArticles) {
      try {
        await db.insertArticle(article);
        storedCount++;
        if (article.imageUrl) {
          withImages++;
        }
      } catch (error) {
        // Skip duplicates
      }
    }
    
    console.log(`✅ Stored ${storedCount} articles`);
    console.log(`📸 Articles with images: ${withImages}/${storedCount} (${Math.round(withImages/storedCount*100)}%)\n`);
    
    // Show sample articles with images
    if (withImages > 0) {
      console.log('Sample articles with images:\n');
      const articlesWithImages = processedArticles.filter(a => a.imageUrl).slice(0, 3);
      articlesWithImages.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Image: ${article.imageUrl?.substring(0, 80)}...\n`);
      });
    }
    
    await db.disconnect();
    console.log('✅ Done! Refresh your browser to see articles with images.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearAndRefetch();
