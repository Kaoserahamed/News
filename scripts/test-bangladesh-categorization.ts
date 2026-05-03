import 'dotenv/config';
import { categorizeArticle } from '../lib/utils/categorization';
import { Category } from '../lib/models/category';
import { RawArticle } from '../lib/models/article';

/**
 * Test categorization with Bangladesh-specific content
 * Tests both English and Bangla keywords
 */

const testArticles: Array<{ title: string; expected: Category }> = [
  // Technology - English
  {
    title: 'Google launches new AI features for Bangladesh users',
    expected: Category.TECHNOLOGY
  },
  {
    title: 'Mobile banking apps see surge in downloads',
    expected: Category.TECHNOLOGY
  },
  // Technology - Bangla
  {
    title: 'বাংলাদেশে নতুন প্রযুক্তি চালু করল গুগল',
    expected: Category.TECHNOLOGY
  },
  {
    title: 'মোবাইল ব্যাংকিং অ্যাপ ডাউনলোড বৃদ্ধি',
    expected: Category.TECHNOLOGY
  },
  
  // Sports - English
  {
    title: 'Bangladesh cricket team wins against India in Asia Cup',
    expected: Category.SPORTS
  },
  {
    title: 'Shakib Al Hasan scores century in Test match',
    expected: Category.SPORTS
  },
  // Sports - Bangla
  {
    title: 'এশিয়া কাপে ভারতকে হারিয়ে বাংলাদেশ ক্রিকেট দল',
    expected: Category.SPORTS
  },
  {
    title: 'টেস্ট ম্যাচে শতক করলেন শাকিব আল হাসান',
    expected: Category.SPORTS
  },
  
  // Business - English
  {
    title: 'Bangladesh Bank raises interest rates to control inflation',
    expected: Category.BUSINESS
  },
  {
    title: 'Garment exports reach record high this year',
    expected: Category.BUSINESS
  },
  // Business - Bangla
  {
    title: 'মুদ্রাস্ফীতি নিয়ন্ত্রণে সুদের হার বাড়াল বাংলাদেশ ব্যাংক',
    expected: Category.BUSINESS
  },
  {
    title: 'তৈরি পোশাক রপ্তানি রেকর্ড উচ্চতায়',
    expected: Category.BUSINESS
  },
  
  // Politics - English
  {
    title: 'Prime Minister announces new education policy in Parliament',
    expected: Category.POLITICS
  },
  {
    title: 'Awami League holds rally in Dhaka',
    expected: Category.POLITICS
  },
  // Politics - Bangla
  {
    title: 'সংসদে নতুন শিক্ষানীতি ঘোষণা করলেন প্রধানমন্ত্রী',
    expected: Category.POLITICS
  },
  {
    title: 'ঢাকায় সমাবেশ করল আওয়ামী লীগ',
    expected: Category.POLITICS
  },
  
  // Entertainment - English
  {
    title: 'Shakib Khan new movie breaks box office records',
    expected: Category.ENTERTAINMENT
  },
  {
    title: 'Popular singer Tahsan releases new album',
    expected: Category.ENTERTAINMENT
  },
  // Entertainment - Bangla
  {
    title: 'শাকিব খানের নতুন সিনেমা বক্স অফিসে রেকর্ড',
    expected: Category.ENTERTAINMENT
  },
  {
    title: 'জনপ্রিয় গায়ক তাহসান নতুন অ্যালবাম প্রকাশ',
    expected: Category.ENTERTAINMENT
  },
  
  // General - No specific keywords
  {
    title: 'Local community celebrates annual festival',
    expected: Category.GENERAL
  },
  {
    title: 'স্থানীয় সম্প্রদায় বার্ষিক উৎসব পালন',
    expected: Category.GENERAL
  }
];

console.log('🧪 Testing Bangladesh Content Categorization\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const test of testArticles) {
  const article: RawArticle = {
    title: test.title,
    summary: '',
    link: 'https://example.com',
    pubDate: new Date().toISOString(),
    source: 'Test Source'
  };
  
  const result = categorizeArticle(article);
  const isCorrect = result === test.expected;
  
  if (isCorrect) {
    passed++;
    console.log(`✅ PASS`);
  } else {
    failed++;
    console.log(`❌ FAIL`);
  }
  
  console.log(`   Title: ${test.title}`);
  console.log(`   Expected: ${test.expected}`);
  console.log(`   Got: ${result}`);
  console.log('');
}

console.log('='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testArticles.length} tests`);

if (failed === 0) {
  console.log('✅ All tests passed! Categorization is working correctly for Bangladesh content.');
} else {
  console.log(`⚠️  ${failed} test(s) failed. Review the categorization keywords.`);
  process.exit(1);
}
