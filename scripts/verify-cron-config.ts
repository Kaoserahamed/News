/**
 * Verification script for Vercel cron job configuration
 * 
 * This script verifies that:
 * 1. vercel.json exists and has correct cron configuration
 * 2. CRON_SECRET environment variable is documented
 * 3. /api/cron/update endpoint exists
 */

import * as fs from 'fs';
import * as path from 'path';

interface VercelConfig {
  crons?: Array<{
    path: string;
    schedule: string;
  }>;
}

function verifyVercelJson(): boolean {
  console.log('🔍 Verifying vercel.json configuration...\n');
  
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(vercelJsonPath)) {
    console.error('❌ vercel.json not found');
    return false;
  }
  
  const content = fs.readFileSync(vercelJsonPath, 'utf-8');
  const config: VercelConfig = JSON.parse(content);
  
  if (!config.crons || config.crons.length === 0) {
    console.error('❌ No cron jobs configured in vercel.json');
    return false;
  }
  
  const updateCron = config.crons.find(cron => cron.path === '/api/cron/update');
  
  if (!updateCron) {
    console.error('❌ /api/cron/update cron job not found');
    return false;
  }
  
  console.log('✅ vercel.json exists');
  console.log(`✅ Cron job configured for: ${updateCron.path}`);
  console.log(`✅ Schedule: ${updateCron.schedule} (every hour)`);
  
  if (updateCron.schedule !== '0 * * * *') {
    console.warn('⚠️  Schedule is not "0 * * * *" (every hour at minute 0)');
    return false;
  }
  
  return true;
}

function verifyEnvExample(): boolean {
  console.log('\n🔍 Verifying .env.example configuration...\n');
  
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example not found');
    return false;
  }
  
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  
  if (!content.includes('CRON_SECRET')) {
    console.error('❌ CRON_SECRET not documented in .env.example');
    return false;
  }
  
  console.log('✅ .env.example exists');
  console.log('✅ CRON_SECRET environment variable documented');
  
  return true;
}

function verifyCronEndpoint(): boolean {
  console.log('\n🔍 Verifying /api/cron/update endpoint...\n');
  
  const endpointPath = path.join(process.cwd(), 'pages', 'api', 'cron', 'update.ts');
  
  if (!fs.existsSync(endpointPath)) {
    console.error('❌ /api/cron/update endpoint not found');
    return false;
  }
  
  const content = fs.readFileSync(endpointPath, 'utf-8');
  
  // Check for key implementation details
  const checks = [
    { pattern: /CRON_SECRET/, description: 'CRON_SECRET authentication' },
    { pattern: /UpdateOrchestratorService/, description: 'UpdateOrchestratorService integration' },
    { pattern: /executeUpdateCycle/, description: 'executeUpdateCycle method call' },
    { pattern: /authorization/, description: 'Authorization header check' },
  ];
  
  let allChecksPass = true;
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.description} implemented`);
    } else {
      console.error(`❌ ${check.description} not found`);
      allChecksPass = false;
    }
  }
  
  return allChecksPass;
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Vercel Cron Job Configuration Verification');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const vercelJsonOk = verifyVercelJson();
  const envExampleOk = verifyEnvExample();
  const endpointOk = verifyCronEndpoint();
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  if (vercelJsonOk && envExampleOk && endpointOk) {
    console.log('✅ All verifications passed!');
    console.log('\n📋 Task 10 Requirements Met:');
    console.log('   ✅ vercel.json with cron job configuration');
    console.log('   ✅ Cron schedule set to run every hour (0 * * * *)');
    console.log('   ✅ Cron job configured to call /api/cron/update');
    console.log('   ✅ Environment variable CRON_SECRET documented');
    console.log('\n📝 Next Steps:');
    console.log('   1. Set CRON_SECRET in Vercel environment variables');
    console.log('   2. Deploy to Vercel');
    console.log('   3. Verify cron job runs automatically every hour');
    console.log('═══════════════════════════════════════════════════════');
    process.exit(0);
  } else {
    console.log('❌ Some verifications failed');
    console.log('═══════════════════════════════════════════════════════');
    process.exit(1);
  }
}

main();
