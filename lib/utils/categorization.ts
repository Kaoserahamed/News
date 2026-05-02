/**
 * Article categorization utilities
 * Provides keyword-based categorization for news articles
 */

import { Category } from '../models/category';
import type { RawArticle } from '../models/article';

/**
 * Keyword lists for each category
 * Articles are categorized based on keyword matches in title and content
 */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  [Category.TECHNOLOGY]: [
    'technology', 'tech', 'software', 'hardware', 'computer', 'internet',
    'digital', 'ai', 'artificial intelligence', 'machine learning', 'ml',
    'programming', 'coding', 'developer', 'app', 'application', 'mobile',
    'web', 'cloud', 'data', 'cybersecurity', 'security', 'hack', 'crypto',
    'blockchain', 'bitcoin', 'startup', 'silicon valley', 'gadget', 'device',
    'smartphone', 'tablet', 'laptop', 'robot', 'automation', 'innovation',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'iot', 'internet of things',
    '5g', 'network', 'algorithm', 'database', 'server', 'platform', 'api',
    'opensource', 'github', 'microsoft', 'apple', 'google', 'amazon', 'meta',
    'facebook', 'twitter', 'tesla', 'spacex', 'nvidia', 'intel', 'amd'
  ],
  
  [Category.SPORTS]: [
    'sports', 'sport', 'football', 'soccer', 'basketball', 'baseball',
    'tennis', 'golf', 'hockey', 'cricket', 'rugby', 'boxing', 'mma',
    'ufc', 'wrestling', 'olympics', 'olympic', 'championship', 'tournament',
    'league', 'nfl', 'nba', 'mlb', 'nhl', 'fifa', 'uefa', 'premier league',
    'world cup', 'super bowl', 'playoffs', 'finals', 'athlete', 'player',
    'coach', 'team', 'game', 'match', 'score', 'win', 'loss', 'victory',
    'defeat', 'champion', 'medal', 'racing', 'formula 1', 'f1', 'nascar',
    'marathon', 'swimming', 'track', 'field', 'gymnastics', 'volleyball',
    'espn', 'stadium', 'arena', 'season', 'draft', 'transfer', 'injury'
  ],
  
  [Category.BUSINESS]: [
    'business', 'economy', 'economic', 'finance', 'financial', 'market',
    'stock', 'stocks', 'trading', 'investment', 'investor', 'wall street',
    'nasdaq', 'dow jones', 's&p 500', 'earnings', 'revenue', 'profit',
    'loss', 'merger', 'acquisition', 'ipo', 'ceo', 'cfo', 'executive',
    'company', 'corporation', 'enterprise', 'startup', 'entrepreneur',
    'venture capital', 'funding', 'valuation', 'bankruptcy', 'debt',
    'credit', 'loan', 'bank', 'banking', 'federal reserve', 'interest rate',
    'inflation', 'recession', 'gdp', 'unemployment', 'jobs', 'employment',
    'retail', 'consumer', 'sales', 'manufacturing', 'industry', 'trade',
    'export', 'import', 'tariff', 'tax', 'regulation', 'antitrust',
    'real estate', 'property', 'housing', 'commodity', 'oil', 'gold'
  ],
  
  [Category.POLITICS]: [
    'politics', 'political', 'government', 'congress', 'senate', 'house',
    'president', 'presidential', 'election', 'vote', 'voting', 'campaign',
    'democrat', 'republican', 'party', 'legislation', 'law', 'bill',
    'policy', 'reform', 'regulation', 'supreme court', 'justice', 'judge',
    'governor', 'mayor', 'senator', 'representative', 'politician',
    'white house', 'capitol', 'administration', 'cabinet', 'diplomat',
    'diplomacy', 'foreign policy', 'domestic policy', 'national security',
    'defense', 'military', 'war', 'peace', 'treaty', 'sanctions',
    'united nations', 'un', 'nato', 'eu', 'european union', 'brexit',
    'immigration', 'border', 'healthcare', 'education', 'climate change',
    'environment', 'energy', 'infrastructure', 'welfare', 'social security',
    'medicare', 'medicaid', 'scandal', 'investigation', 'impeachment'
  ],
  
  [Category.ENTERTAINMENT]: [
    'entertainment', 'movie', 'movies', 'film', 'cinema', 'actor', 'actress',
    'director', 'hollywood', 'box office', 'oscar', 'academy awards',
    'emmy', 'golden globe', 'tv', 'television', 'series', 'show', 'episode',
    'season', 'streaming', 'netflix', 'hulu', 'disney', 'hbo', 'amazon prime',
    'music', 'song', 'album', 'artist', 'singer', 'band', 'concert',
    'tour', 'grammy', 'billboard', 'spotify', 'celebrity', 'star',
    'fame', 'red carpet', 'premiere', 'festival', 'cannes', 'sundance',
    'comic', 'comics', 'marvel', 'dc', 'superhero', 'anime', 'manga',
    'gaming', 'video game', 'game', 'playstation', 'xbox', 'nintendo',
    'esports', 'twitch', 'youtube', 'influencer', 'viral', 'meme',
    'fashion', 'style', 'designer', 'model', 'runway', 'vogue',
    'theater', 'theatre', 'broadway', 'play', 'musical', 'performance'
  ],
  
  [Category.GENERAL]: []
};

/**
 * Categorize an article based on keyword matching
 * 
 * Algorithm:
 * 1. Combine article title, summary, and content into searchable text
 * 2. Convert to lowercase for case-insensitive matching
 * 3. Count keyword matches for each category
 * 4. Return category with highest match count
 * 5. Default to 'General' if no keywords match
 * 
 * @param article - The raw article to categorize
 * @returns The determined category
 */
export function categorizeArticle(article: RawArticle): Category {
  // Combine all text fields for keyword matching
  const searchText = [
    article.title,
    article.summary || '',
    article.content || ''
  ].join(' ').toLowerCase();

  // Count keyword matches for each category
  let maxMatches = 0;
  let bestCategory: Category = Category.GENERAL;

  // Iterate through each category (except GENERAL which has no keywords)
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === Category.GENERAL) continue;

    let matchCount = 0;
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Update best category if this one has more matches
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestCategory = category as Category;
    }
  }

  return bestCategory;
}
