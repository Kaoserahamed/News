/**
 * Article categorization utilities
 * Provides keyword-based categorization for news articles
 */

import { Category } from '../models/category';
import type { RawArticle } from '../models/article';

/**
 * Keyword lists for each category
 * Articles are categorized based on keyword matches in title and content
 * Includes both English and Bangla keywords for Bangladesh news sources
 */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  [Category.TECHNOLOGY]: [
    // English keywords
    'technology', 'tech', 'software', 'hardware', 'computer', 'internet',
    'digital', 'ai', 'artificial intelligence', 'machine learning', 'ml',
    'programming', 'coding', 'developer', 'app', 'application', 'mobile',
    'web', 'cloud', 'data', 'cybersecurity', 'security', 'hack', 'crypto',
    'blockchain', 'bitcoin', 'startup', 'gadget', 'device',
    'smartphone', 'tablet', 'laptop', 'robot', 'automation', 'innovation',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'iot', 'internet of things',
    '5g', 'network', 'algorithm', 'database', 'server', 'platform', 'api',
    'opensource', 'github', 'microsoft', 'apple', 'google', 'amazon', 'meta',
    'facebook', 'twitter', 'tesla', 'spacex', 'nvidia', 'intel', 'samsung',
    // Bangla keywords
    'প্রযুক্তি', 'কম্পিউটার', 'ইন্টারনেট', 'সফটওয়্যার', 'মোবাইল', 'ফোন',
    'ডিজিটাল', 'অ্যাপ', 'অ্যাপ্লিকেশন', 'ওয়েব', 'সাইবার', 'হ্যাক',
    'ক্রিপ্টো', 'বিটকয়েন', 'স্মার্টফোন', 'ট্যাবলেট', 'ল্যাপটপ',
    'রোবট', 'নেটওয়ার্ক', 'ডেটা', 'গুগল', 'ফেসবুক', 'টুইটার'
  ],
  
  [Category.SPORTS]: [
    // English keywords
    'sports', 'sport', 'football', 'soccer', 'basketball', 'cricket',
    'tennis', 'golf', 'hockey', 'rugby', 'boxing', 'wrestling',
    'olympics', 'olympic', 'championship', 'tournament', 'league',
    'fifa', 'uefa', 'premier league', 'world cup', 'asia cup', 't20',
    'test match', 'odi', 'ipl', 'bpl', 'bangladesh premier league',
    'athlete', 'player', 'coach', 'team', 'game', 'match', 'score',
    'win', 'loss', 'victory', 'defeat', 'champion', 'medal',
    'stadium', 'arena', 'season', 'transfer', 'injury',
    'bangladesh cricket', 'tigers', 'shakib', 'mushfiq', 'tamim',
    // Bangla keywords
    'খেলা', 'খেলাধুলা', 'ক্রিকেট', 'ফুটবল', 'টেনিস', 'হকি',
    'ম্যাচ', 'টুর্নামেন্ট', 'চ্যাম্পিয়ন', 'বিজয়', 'পরাজয়',
    'খেলোয়াড়', 'দল', 'কোচ', 'স্টেডিয়াম', 'লিগ', 'বিপিএল',
    'বাংলাদেশ ক্রিকেট', 'টাইগার', 'শাকিব', 'মুশফিক', 'তামিম',
    'বিশ্বকাপ', 'এশিয়া কাপ', 'টি-টোয়েন্টি', 'টেস্ট', 'ওডিআই'
  ],
  
  [Category.BUSINESS]: [
    // English keywords
    'business', 'economy', 'economic', 'finance', 'financial', 'market',
    'stock', 'stocks', 'trading', 'investment', 'investor', 'dhaka stock',
    'dse', 'chittagong stock', 'earnings', 'revenue', 'profit', 'loss',
    'merger', 'acquisition', 'ipo', 'ceo', 'executive', 'company',
    'corporation', 'enterprise', 'startup', 'entrepreneur', 'funding',
    'bankruptcy', 'debt', 'credit', 'loan', 'bank', 'banking',
    'bangladesh bank', 'central bank', 'interest rate', 'inflation',
    'recession', 'gdp', 'unemployment', 'jobs', 'employment', 'taka',
    'retail', 'consumer', 'sales', 'manufacturing', 'industry', 'trade',
    'export', 'import', 'garments', 'rmg', 'textile', 'tariff', 'tax',
    'regulation', 'real estate', 'property', 'housing', 'commodity',
    'remittance', 'foreign exchange', 'dollar', 'rupee',
    // Bangla keywords
    'ব্যবসা', 'অর্থনীতি', 'অর্থ', 'বাজার', 'শেয়ার', 'বিনিয়োগ',
    'ব্যাংক', 'ঋণ', 'লোন', 'বাংলাদেশ ব্যাংক', 'সুদ', 'মুদ্রাস্ফীতি',
    'টাকা', 'ডলার', 'রপ্তানি', 'আমদানি', 'পোশাক', 'তৈরি পোশাক',
    'শিল্প', 'কারখানা', 'বাণিজ্য', 'কোম্পানি', 'প্রতিষ্ঠান',
    'উদ্যোক্তা', 'স্টার্টআপ', 'জিডিপি', 'কর', 'রেমিট্যান্স',
    'প্রবাসী আয়', 'ঢাকা স্টক', 'চট্টগ্রাম স্টক'
  ],
  
  [Category.POLITICS]: [
    // English keywords
    'politics', 'political', 'government', 'parliament', 'jatiya sangsad',
    'prime minister', 'president', 'minister', 'ministry', 'election',
    'vote', 'voting', 'campaign', 'awami league', 'bnp', 'jatiya party',
    'party', 'legislation', 'law', 'bill', 'policy', 'reform',
    'regulation', 'supreme court', 'high court', 'justice', 'judge',
    'mp', 'member of parliament', 'politician', 'secretariat',
    'administration', 'cabinet', 'diplomat', 'diplomacy', 'foreign policy',
    'domestic policy', 'national security', 'defense', 'military',
    'war', 'peace', 'treaty', 'sanctions', 'united nations', 'un',
    'saarc', 'bimstec', 'india', 'pakistan', 'china', 'myanmar',
    'immigration', 'border', 'rohingya', 'refugee', 'healthcare',
    'education', 'climate change', 'environment', 'infrastructure',
    'corruption', 'scandal', 'investigation', 'protest', 'rally',
    'hasina', 'khaleda', 'zia', 'ershad', 'tarique',
    // Bangla keywords
    'রাজনীতি', 'সরকার', 'সংসদ', 'জাতীয় সংসদ', 'প্রধানমন্ত্রী',
    'রাষ্ট্রপতি', 'মন্ত্রী', 'মন্ত্রণালয়', 'নির্বাচন', 'ভোট',
    'আওয়ামী লীগ', 'বিএনপি', 'জাতীয় পার্টি', 'দল', 'আইন', 'বিল',
    'নীতি', 'সংস্কার', 'সুপ্রিম কোর্ট', 'হাইকোর্ট', 'বিচারপতি',
    'এমপি', 'সংসদ সদস্য', 'রাজনীতিবিদ', 'সচিবালয়', 'মন্ত্রিসভা',
    'পররাষ্ট্র', 'জাতীয় নিরাপত্তা', 'প্রতিরক্ষা', 'সামরিক', 'সেনা',
    'জাতিসংঘ', 'সার্ক', 'ভারত', 'পাকিস্তান', 'চীন', 'মিয়ানমার',
    'সীমান্ত', 'রোহিঙ্গা', 'শরণার্থী', 'স্বাস্থ্য', 'শিক্ষা',
    'জলবায়ু', 'পরিবেশ', 'দুর্নীতি', 'কেলেঙ্কারি', 'তদন্ত',
    'বিক্ষোভ', 'সমাবেশ', 'হাসিনা', 'খালেদা', 'জিয়া', 'এরশাদ'
  ],
  
  [Category.ENTERTAINMENT]: [
    // English keywords
    'entertainment', 'movie', 'movies', 'film', 'cinema', 'actor', 'actress',
    'director', 'dhallywood', 'tollywood', 'bollywood', 'hollywood',
    'box office', 'tv', 'television', 'drama', 'natok', 'series',
    'show', 'episode', 'channel', 'ntv', 'rtv', 'atn', 'banglavision',
    'music', 'song', 'album', 'artist', 'singer', 'band', 'concert',
    'tour', 'festival', 'celebrity', 'star', 'fame', 'premiere',
    'shakib khan', 'jaya ahsan', 'arifin shuvoo', 'pori moni',
    'tahsan', 'minar', 'habib wahid', 'nancy', 'kona', 'james',
    'gaming', 'video game', 'game', 'esports', 'youtube', 'influencer',
    'viral', 'fashion', 'style', 'designer', 'model',
    'theater', 'theatre', 'play', 'performance', 'cultural',
    // Bangla keywords
    'বিনোদন', 'সিনেমা', 'ছবি', 'চলচ্চিত্র', 'নায়ক', 'নায়িকা',
    'পরিচালক', 'ঢালিউড', 'টলিউড', 'বলিউড', 'হলিউড',
    'টিভি', 'টেলিভিশন', 'নাটক', 'ধারাবাহিক', 'অনুষ্ঠান',
    'চ্যানেল', 'এনটিভি', 'আরটিভি', 'এটিএন', 'বাংলাভিশন',
    'সংগীত', 'গান', 'অ্যালবাম', 'শিল্পী', 'গায়ক', 'ব্যান্ড',
    'কনসার্ট', 'উৎসব', 'তারকা', 'সেলিব্রিটি', 'প্রিমিয়ার',
    'শাকিব খান', 'জয়া আহসান', 'অরিফিন শুভ', 'পরীমনি',
    'তাহসান', 'মিনার', 'হাবিব ওয়াহিদ', 'ন্যান্সি', 'কনা', 'জেমস',
    'গেমিং', 'ভিডিও গেম', 'ইউটিউব', 'ভাইরাল', 'ফ্যাশন',
    'থিয়েটার', 'নাট্য', 'সাংস্কৃতিক', 'সংস্কৃতি'
  ],
  
  [Category.GENERAL]: []
};

/**
 * Categorize an article based on keyword matching
 * 
 * Algorithm:
 * 1. Combine article title, summary, and content into searchable text
 * 2. Convert to lowercase for case-insensitive matching
 * 3. Count keyword matches for each category with weighted scoring
 * 4. Title matches get higher weight (2x) than content matches
 * 5. Return category with highest match count
 * 6. Require minimum threshold (2 matches) to avoid false positives
 * 7. Default to 'General' if no keywords match or below threshold
 * 
 * @param article - The raw article to categorize
 * @returns The determined category
 */
export function categorizeArticle(article: RawArticle): Category {
  // Combine text fields separately for weighted matching
  const titleText = (article.title || '').toLowerCase();
  const contentText = [
    article.summary || '',
    article.content || ''
  ].join(' ').toLowerCase();

  // Count keyword matches for each category with weighted scoring
  let maxScore = 0;
  let bestCategory: Category = Category.GENERAL;
  const TITLE_WEIGHT = 2; // Title matches are more important
  const MIN_THRESHOLD = 2; // Minimum score to avoid false positives

  // Iterate through each category (except GENERAL which has no keywords)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === Category.GENERAL) continue;

    let score = 0;
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // Check title (higher weight)
      if (titleText.includes(lowerKeyword)) {
        score += TITLE_WEIGHT;
      }
      
      // Check content (normal weight)
      if (contentText.includes(lowerKeyword)) {
        score += 1;
      }
    }

    // Update best category if this one has higher score
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as Category;
    }
  }

  // Return GENERAL if score is below threshold (avoid false positives)
  if (maxScore < MIN_THRESHOLD) {
    return Category.GENERAL;
  }

  return bestCategory;
}
