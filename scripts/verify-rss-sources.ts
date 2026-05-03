import 'dotenv/config';
import { NewsCollectorService } from '../lib/services/news-collector';
import fs from 'fs';
import path from 'path';
import { RSSSourceConfig } from '../lib/models/rss-source';

/**
 * Verify all RSS sources are working and returning articles
 * Tests each source individually and reports status
 */

async function verifyRSSSources() {
  console.log('🔍 Verifying RSS Sources\n');
  console.log('='.repeat(80));
  
  try {
    // Load sources configuration
    const configPath = path.join(process.cwd(), 'config', 'rss-sources.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: RSSSourceConfig = JSON.parse(configData);
    
    const collector = new NewsCollectorService();
    
    let totalSources = 0;
    let enabledSources = 0;
    let workingSources = 0;
    let failedSources = 0;
    let totalArticles = 0;
    let articlesWithImages = 0;
    
    console.log(`\n📋 Found ${config.sources.length} sources in configuration\n`);
    
    // Test each source
    for (const source of config.sources) {
      totalSources++;
      
      if (!source.enabled) {
        console.log(`⏭️  ${source.name}`);
        console.log(`   Status: Disabled`);
        console.log(`   URL: ${source.url}`);
        console.log('');
        continue;
      }
      
      enabledSources++;
      console.log(`🧪 Testing: ${source.name}`);
      console.log(`   URL: ${source.url}`);
      
      try {
        const startTime = Date.now();
        const articles = await collector.fetchSource(source);
        const duration = Date.now() - startTime;
        
        if (articles.length > 0) {
          workingSources++;
          totalArticles += articles.length;
          
          const withImages = articles.filter(a => a.imageUrl).length;
          articlesWithImages += withImages;
          const imagePercentage = ((withImages / articles.length) * 100).toFixed(0);
          
          console.log(`   ✅ Status: Working`);
          console.log(`   📰 Articles: ${articles.length}`);
          console.log(`   📸 Images: ${withImages}/${articles.length} (${imagePercentage}%)`);
          console.log(`   ⏱️  Response Time: ${duration}ms`);
          
          // Show sample article
          if (articles[0]) {
            const sampleTitle = articles[0].title.substring(0, 60);
            console.log(`   📄 Sample: ${sampleTitle}${articles[0].title.length > 60 ? '...' : ''}`);
          }
        } else {
          failedSources++;
          console.log(`   ⚠️  Status: No articles returned`);
          console.log(`   ⏱️  Response Time: ${duration}ms`);
        }
      } catch (error) {
        failedSources++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`   ❌ Status: Failed`);
        console.log(`   Error: ${errorMessage}`);
      }
      
      console.log('');
    }
    
    // Summary
    console.log('='.repeat(80));
    console.log('\n📊 Verification Summary:\n');
    console.log(`Total Sources: ${totalSources}`);
    console.log(`  ✅ Enabled: ${enabledSources}`);
    console.log(`  ⏭️  Disabled: ${totalSources - enabledSources}`);
    console.log('');
    console.log(`Enabled Sources Status:`);
    console.log(`  ✅ Working: ${workingSources}`);
    console.log(`  ❌ Failed: ${failedSources}`);
    console.log('');
    console.log(`Content Statistics:`);
    console.log(`  📰 Total Articles: ${totalArticles}`);
    console.log(`  📸 Articles with Images: ${articlesWithImages} (${totalArticles > 0 ? ((articlesWithImages / totalArticles) * 100).toFixed(1) : 0}%)`);
    console.log(`  📊 Average per Source: ${enabledSources > 0 ? Math.round(totalArticles / workingSources) : 0}`);
    console.log('');
    
    // Health assessment
    const successRate = enabledSources > 0 ? (workingSources / enabledSources) * 100 : 0;
    
    if (successRate === 100) {
      console.log('✅ All enabled sources are working perfectly!');
    } else if (successRate >= 80) {
      console.log('✅ Most sources are working well.');
      if (failedSources > 0) {
        console.log(`⚠️  ${failedSources} source(s) need attention.`);
      }
    } else if (successRate >= 50) {
      console.log('⚠️  Some sources are having issues. Review failed sources.');
    } else {
      console.log('❌ Many sources are failing. Check network connectivity and RSS feed URLs.');
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Exit with error if any enabled source failed
    if (failedSources > 0) {
      console.log('\n⚠️  Some sources failed verification. Review the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

verifyRSSSources();
