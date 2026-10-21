# Day 2 Architecture: Service Boundaries, Database Schema, API Contracts

## Repository
`News` — Bangladesh News Aggregator (Next.js 14, MongoDB Atlas)

## Proposed Concept
News aggregation platform with AI summarization, personalization engine, fact-checking, multimedia content, newsletter generation, and paywall/subscription system.

## Service Boundaries
| Service | Responsibility | Technology |
|---------|---------------|------------|
| Ingestion Service | RSS polling, API fetching, web scraping, deduplication | Next.js API Routes, Node.js, rss-parser |
| Article Service | Article storage, categorization, tagging, sentiment | Next.js API Routes, MongoDB |
| Personalization Service | Collaborative filtering, content-based recommendations | Next.js API Routes, MongoDB |
| Summarization Service | Article summarization, TL;DR, key points | Next.js API Routes, AI model |
| Fact-checking Service | Claim extraction, verification, bias detection | Next.js API Routes, AI model |
| Delivery Service | Newsletter generation, push alerts, paywall | Next.js API Routes, email/SMS |
| Multimedia Service | Image galleries, video embedding, audio articles | Next.js API Routes, object storage |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS | Next.js, React |

## Database Schema (MongoDB Atlas)
- `users` — {_id, email, passwordHash, role (reader/subscriber/editor/admin), readingPreferences, topics, newsletterSubscriptions, readingHistory, createdAt}
- `sources` — {_id, name, url, type (rss/api/scrape), credibilityScore, category, refreshInterval, lastFetched, createdAt}
- `articles` — {_id, sourceId, title, body, author, sourceName, publishedDate, category, tags, imageUrl, summary, keyPoints, sentiment, factCheckLabel, language, readTime, scrollDepth, createdAt}
- `article_views` — {_id, articleId, userId, viewedAt, device, location}
- `subscriptions` — {_id, userId, planType, status, billingCycle, paymentMethod, createdAt, expiresAt}
- `newsletters` — {_id, name, curationRules, schedule, recipientList, lastSent, createdAt}
- `fact_checks` — {_id, claim, verificationStatus (verified/disputed/misleading/false), trustedSources, createdAt}
- `paywall_articles` — {_id, articleId, accessType (metered/hard), entitlements, createdAt}
- `audit_logs` — {_id, userId, action, entityType, entityId, timestamp, immutable}

## API Contracts
### Articles
- `GET /api/articles` — ?page=&limit=&category= → {articles, pagination}
- `GET /api/articles/{id}` → {article, citations}
- `GET /api/articles/search?q={query}` → {articles}
- `POST /api/articles/{id}/read` → {viewRecord}

### Personalization
- `GET /api/feed/personalized` — {userId} → {rankedArticles}
- `POST /api/feed/feedback` — {articleId, like/dislike/hide} → 204
- `GET /api/recommendations` → {articles}

### Summarization
- `POST /api/summarize` — {articleId} → {summary, keyPoints, tldr}
- `GET /api/summaries/{articleId}` → {summary}

### Fact-checking
- `GET /api/fact-check/{articleId}` → {label, sources, confidence}
- `POST /api/fact-check/claims` — {text} → {extractedClaims}

### Newsletter
- `POST /api/newsletters` — {name, curationRules, schedule} → {newsletter}
- `POST /api/newsletters/{id}/send` → 202
- `GET /api/newsletters/{id}/analytics` → {openRate, clickRate}

### Paywall/Subscription
- `POST /api/subscriptions` — {planType, paymentMethod} → {subscription}
- `GET /api/subscriptions/{id}` → {status, entitlements}
- `GET /api/articles/{id}/access` — {userId} → {accessLevel, paywallInfo}

### Admin/Editor
- `POST /api/admin/sources` — {url, type, category} → {source}
- `POST /api/admin/articles/publish` — {articleId, schedule} → 204
- `GET /api/admin/content-calendar` → {schedule}
- `GET /api/admin/analytics` → {views, engagement, sources}

### Real-time (SSE/WebSocket)
- `GET /api/alerts/breaking` → live push notifications

## Technical Notes
- Currently Next.js API Routes + MongoDB Atlas; serverless architecture
- Vercel cron for daily updates; cron job requires Pro plan
- Duplicate detection: 90% accuracy using Levenshtein distance
- Smart categorization: Bangladesh-specific keyword categorization
- Bilingual: Bangla and English UI
- No AI summarization, personalization, fact-checking, paywall, or newsletter yet
- No editor dashboard, comments, or multimedia content yet

## Day 2 Outcome
Architecture design documented. No code changes. 0 PRs. Ready for Day 3 (CI/CD pipeline).