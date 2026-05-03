import 'dotenv/config';
import { getDatabaseService } from '../lib/services/database';

async function deleteAllArticles() {
  const db = getDatabaseService();
  
  try {
    await db.connect();
    console.log('✅ Connected to database\n');
    
    // Delete all articles
    const collection = (db as any).db.collection('articles');
    const result = await collection.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} articles\n`);
    console.log('Now run: npx tsx scripts/test-complete-update-cycle.ts');
    console.log('to fetch fresh articles with images!\n');
    
    await db.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllArticles();
