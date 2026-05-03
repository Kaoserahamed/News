import 'dotenv/config';
import { UpdateOrchestratorService } from '../lib/services/update-orchestrator';

async function quickUpdate() {
  console.log('🚀 Starting quick update with ranking...\n');
  
  const orchestrator = new UpdateOrchestratorService();
  
  try {
    const result = await orchestrator.executeUpdateCycle();
    
    console.log('\n✅ Update completed!');
    console.log(`📰 Articles processed: ${result.articlesProcessed}`);
    console.log(`💾 Articles stored: ${result.articlesStored}`);
    console.log(`🔄 Duplicates skipped: ${result.duplicatesSkipped}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickUpdate();
