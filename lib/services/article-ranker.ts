/**
 * Article Ranking Service
 * 
 * Ranks articles based on multiple factors:
 * - Recency (newer articles ranked higher)
 * - Source trust score
 * - Category diversity
 * 
 * Limits to top 30 articles per day for quality over quantity
 */

import { ProcessedArticle } from '../models/article';
import { Category } from '../models/category';

interface RankingWeights {
  recency: number;      // Weight for how recent the article is
  trustScore: number;   // Weight for source credibility
  diversity: number;    // Weight for category diversity
}

// Default weights (can be adjusted)
const DEFAULT_WEIGHTS: RankingWeights = {
  recency: 0.4,      // 40% - Freshness is important
  trustScore: 0.4,   // 40% - Trust is critical
  diversity: 0.2,    // 20% - Variety matters
};

export class ArticleRankerService {
  private weights: RankingWeights;
  private readonly MAX_ARTICLES_PER_DAY = 30;

  constructor(weights: RankingWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Rank and filter articles to top 30 per day
   * 
   * @param articles - Array of processed articles
   * @returns Top 30 ranked articles
   */
  rankArticles(articles: ProcessedArticle[]): ProcessedArticle[] {
    if (articles.length === 0) {
      return [];
    }

    // Calculate scores for all articles
    const scoredArticles = articles.map(article => ({
      article,
      score: this.calculateScore(article, articles),
    }));

    // Sort by score (highest first)
    scoredArticles.sort((a, b) => b.score - a.score);

    // Return top 30
    return scoredArticles
      .slice(0, this.MAX_ARTICLES_PER_DAY)
      .map(item => item.article);
  }

  /**
   * Calculate ranking score for an article
   * 
   * Score = w1*recency + w2*trustScore + w3*diversity
   * 
   * @param article - Article to score
   * @param allArticles - All articles for diversity calculation
   * @returns Score between 0 and 1
   */
  private calculateScore(
    article: ProcessedArticle,
    allArticles: ProcessedArticle[]
  ): number {
    const recencyScore = this.calculateRecencyScore(article);
    const trustScore = article.trustScore || 0.5;
    const diversityScore = this.calculateDiversityScore(article, allArticles);

    const totalScore =
      this.weights.recency * recencyScore +
      this.weights.trustScore * trustScore +
      this.weights.diversity * diversityScore;

    return totalScore;
  }

  /**
   * Calculate recency score (0-1)
   * Articles from last 24 hours get highest score
   * Score decreases exponentially with age
   * 
   * @param article - Article to score
   * @returns Score between 0 and 1
   */
  private calculateRecencyScore(article: ProcessedArticle): number {
    const now = new Date();
    const publishedAt = new Date(article.publishedAt);
    const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay: score = e^(-age/24)
    // Articles from last 24 hours get score close to 1
    // Older articles decay exponentially
    const score = Math.exp(-ageInHours / 24);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate diversity score (0-1)
   * Penalize over-represented categories
   * Reward under-represented categories
   * 
   * @param article - Article to score
   * @param allArticles - All articles for comparison
   * @returns Score between 0 and 1
   */
  private calculateDiversityScore(
    article: ProcessedArticle,
    allArticles: ProcessedArticle[]
  ): number {
    // Count articles per category
    const categoryCounts: Record<Category, number> = {
      [Category.TECHNOLOGY]: 0,
      [Category.SPORTS]: 0,
      [Category.BUSINESS]: 0,
      [Category.POLITICS]: 0,
      [Category.ENTERTAINMENT]: 0,
      [Category.GENERAL]: 0,
    };

    allArticles.forEach(a => {
      categoryCounts[a.category]++;
    });

    // Calculate ideal count (equal distribution)
    const totalArticles = allArticles.length;
    const idealCount = totalArticles / 6; // 6 categories

    // Calculate how over/under-represented this category is
    const currentCount = categoryCounts[article.category];
    const ratio = currentCount / idealCount;

    // Score: 1.0 for under-represented, decreases for over-represented
    // ratio < 1: under-represented (score > 0.5)
    // ratio = 1: ideal (score = 0.5)
    // ratio > 1: over-represented (score < 0.5)
    const score = 1 / (1 + ratio);

    return score;
  }

  /**
   * Get category distribution from articles
   * Useful for debugging and monitoring
   * 
   * @param articles - Array of articles
   * @returns Category counts
   */
  getCategoryDistribution(articles: ProcessedArticle[]): Record<Category, number> {
    const counts: Record<Category, number> = {
      [Category.TECHNOLOGY]: 0,
      [Category.SPORTS]: 0,
      [Category.BUSINESS]: 0,
      [Category.POLITICS]: 0,
      [Category.ENTERTAINMENT]: 0,
      [Category.GENERAL]: 0,
    };

    articles.forEach(article => {
      counts[article.category]++;
    });

    return counts;
  }
}
