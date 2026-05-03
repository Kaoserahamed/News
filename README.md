# Bangladesh News Aggregator

A full-stack news aggregation system that automatically collects, processes, and presents news articles from reliable Bangladesh news sources. The system runs automated hourly updates, processes and deduplicates content, and provides a responsive bilingual (Bangla/English) web interface.

## ✨ Features

- **🇧🇩 Bangladesh Focus**: Curated news from top Bangladesh sources (Prothom Alo, Daily Star, BBC Bangla, DW Bangla)
- **🌐 Bilingual Support**: Content in both Bangla and English with smart categorization
- **📸 Rich Media**: 89% of articles include images for visual engagement
- **🤖 Automated Collection**: Hourly news updates from 4 verified, reliable RSS sources
- **🧠 Smart Processing**: Content normalization, HTML cleaning, and intelligent categorization
- **🔍 Duplicate Detection**: Advanced similarity detection prevents duplicate articles (90% threshold)
- **💾 MongoDB Storage**: Scalable cloud database with optimized indexes for fast queries
- **🔌 REST API**: Clean JSON API with pagination, search, and filtering
- **📱 Responsive UI**: Mobile-first design that works on all devices (320px - 2560px)
- **🔎 Search & Filter**: Real-time search with category filtering and pagination
- **❤️ Health Monitoring**: Built-in health check endpoint for system monitoring

## 🇧🇩 News Sources (All Verified Working)

| Source | Language | Type | Articles/Fetch | Images |
|--------|----------|------|----------------|--------|
| **Prothom Alo** | Bangla | Daily Newspaper | ~54 | 100% |
| **The Daily Star** | English | Daily Newspaper | ~4 | 100% |
| **BBC Bangla** | Bangla | International | ~14 | 100% |
| **DW Bangla** | Bangla | International | ~9 | 0% |

**Total**: ~81 articles per fetch with 89% image coverage

## 📊 Categories (Bangla/English)

- 🔧 **প্রযুক্তি** (Technology)
- ⚽ **খেলাধুলা** (Sports)
- 💼 **ব্যবসা** (Business)
- 🏛️ **রাজনীতি** (Politics)
- 🎬 **বিনোদন** (Entertainment)
- 📰 **সাধারণ** (General)

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Deployment**: Vercel with cron jobs
- **Key Libraries**: 
  - `rss-parser` - RSS feed parsing
  - `date-fns` - Date formatting
  - `fast-levenshtein` - Duplicate detection
  - `mongodb` - Database driver

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **MongoDB Atlas account** (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Vercel account** (free tier available at [vercel.com](https://vercel.com)) for deployment
- **Git** for version control

## 🛠️ Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd news-aggregator

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# MongoDB Atlas Connection String
# Get this from: MongoDB Atlas → Cluster → Connect → Connect your application
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0

# Cron Secret (generate a secure random string)
# Generate using: openssl rand -hex 32
CRON_SECRET=your-secure-random-string-here

# Node Environment
NODE_ENV=development
```

**To generate a secure CRON_SECRET:**

```bash
# Option 1: Using OpenSSL (Linux/Mac)
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Set Up MongoDB Atlas

1. **Create a cluster** at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Create a database user**:
   - Go to Database Access → Add New Database User
   - Choose password authentication
   - Set username and password (use these in `MONGODB_URI`)
   - Grant "Read and write to any database" permissions

3. **Configure network access**:
   - Go to Network Access → Add IP Address
   - For development: Add your current IP
   - For Vercel deployment: Add `0.0.0.0/0` (allows all IPs)

4. **Get connection string**:
   - Go to Cluster → Connect → Connect your application
   - Select "Node.js" driver
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<cluster>` with your values

### 4. Test Database Connection

```bash
# Test MongoDB connection
npm run test:mongodb-connection
```

Expected output:
```
✓ Connected to MongoDB successfully
✓ Database is healthy
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test the Update Cycle (Optional)

Manually trigger a news update:

```bash
curl -X POST http://localhost:3000/api/cron/update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from your `.env` file.

## 📁 Project Structure

```
news-aggregator/
├── components/              # React UI components
│   ├── ArticleCard.tsx     # Individual article display
│   ├── ArticleList.tsx     # Article grid/list
│   ├── CategoryFilter.tsx  # Category filter buttons
│   ├── ErrorMessage.tsx    # Error display component
│   ├── Header.tsx          # App header
│   ├── Pagination.tsx      # Pagination controls
│   └── SearchBar.tsx       # Search input
├── config/
│   └── rss-sources.json    # RSS feed configuration
├── lib/
│   ├── models/             # TypeScript interfaces
│   │   ├── article.ts      # Article data models
│   │   ├── category.ts     # Category enum
│   │   ├── rss-source.ts   # RSS source config
│   │   ├── system-log.ts   # Logging models
│   │   └── api.ts          # API request/response types
│   ├── services/           # Business logic
│   │   ├── content-processor.ts    # Content cleaning & normalization
│   │   ├── database.ts             # MongoDB operations
│   │   ├── duplicate-detector.ts   # Duplicate detection
│   │   ├── news-collector.ts       # RSS feed fetching
│   │   └── update-orchestrator.ts  # Update cycle coordination
│   └── utils/
│       └── categorization.ts       # Article categorization
├── pages/
│   ├── api/                # API routes
│   │   ├── articles.ts     # GET /api/articles
│   │   ├── health.ts       # GET /api/health
│   │   └── cron/
│   │       └── update.ts   # POST /api/cron/update
│   ├── _app.tsx            # Next.js app wrapper
│   └── index.tsx           # Main page
├── styles/
│   └── globals.css         # Global styles
├── .env.example            # Environment variables template
├── vercel.json             # Vercel cron configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🔧 Configuration

### RSS Sources

RSS feed sources are configured in `config/rss-sources.json`:

```json
{
  "sources": [
    {
      "id": "techcrunch",
      "name": "TechCrunch",
      "url": "https://techcrunch.com/feed/",
      "category": "Technology",
      "enabled": true
    }
  ]
}
```

**To add a new source:**
1. Add a new object to the `sources` array
2. Set a unique `id`
3. Provide the RSS feed `url`
4. Assign a `category` (Technology, Sports, Business, Politics, Entertainment, General)
5. Set `enabled: true` to activate

**To disable a source:**
- Set `enabled: false` for that source

### Categories

Available categories with bilingual support (defined in `lib/models/category.ts`):
- **Technology** (প্রযুক্তি) - Tech news, gadgets, software
- **Sports** (খেলাধুলা) - Cricket, football, BPL, international sports
- **Business** (ব্যবসা) - Economy, stock market, trade, banking
- **Politics** (রাজনীতি) - Government, elections, policy, international relations
- **Entertainment** (বিনোদন) - Dhallywood, music, TV, culture
- **General** (সাধারণ) - Other news and events

The system automatically categorizes articles using Bangladesh-specific keywords in both Bangla and English.

## 🌐 API Endpoints

### GET `/api/articles`

Retrieve articles with optional filtering, search, and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Articles per page
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Search in titles and summaries

**Example:**
```bash
curl "http://localhost:3000/api/articles?page=1&limit=20&category=Technology&search=AI"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### POST `/api/cron/update`

Trigger a news update cycle (protected endpoint).

**Headers:**
- `Authorization: Bearer <CRON_SECRET>`

**Response:**
```json
{
  "success": true,
  "data": {
    "articlesProcessed": 45,
    "articlesStored": 32,
    "duplicatesSkipped": 13,
    "duration": 12500,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### GET `/api/health`

Check system health and database connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "lastUpdate": "2024-01-15T10:00:00Z",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🚀 Deployment to Vercel

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production**:

| Name | Value | Description |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `CRON_SECRET` | `<random-string>` | Secure random string (32+ characters) |
| `NODE_ENV` | `production` | Environment identifier (optional) |

**Important**: Make sure to select "Production" environment for each variable.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### Step 5: Verify Deployment

Test the deployed application:

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Manually trigger an update
curl -X POST https://your-app.vercel.app/api/cron/update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Step 6: Verify Cron Job

The cron job is configured in `vercel.json` to run every hour:

```json
{
  "crons": [
    {
      "path": "/api/cron/update",
      "schedule": "0 * * * *"
    }
  ]
}
```

**To verify the cron job:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your production deployment
3. Look for "Cron Jobs" section
4. Verify the job is listed with schedule `0 * * * *`

**Note**: Cron jobs require a **Vercel Pro plan** or higher. The Hobby plan does not support cron jobs.

### Step 7: Monitor Logs

Monitor cron job execution:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Navigate to "Functions" tab
4. Check logs for `/api/cron/update` function

## 📚 Additional Documentation

- **[RELIABLE_NEWS_SOURCES.md](./RELIABLE_NEWS_SOURCES.md)** - Complete source documentation and verification
- **[DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md)** - Deployment guide with troubleshooting
- **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** - Quick deployment guide
- **[VERCEL_CRON_SETUP.md](./VERCEL_CRON_SETUP.md)** - Cron job configuration

## 🧪 Testing & Verification

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test MongoDB connection
npm run test:mongodb-connection

# Verify RSS sources are working
npx ts-node --project tsconfig.scripts.json scripts/verify-rss-sources.ts

# Test Bangladesh categorization
npx ts-node --project tsconfig.scripts.json scripts/test-bangladesh-categorization.ts

# Test with real articles
npx ts-node --project tsconfig.scripts.json scripts/test-real-categorization.ts
```

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

## 🔍 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to MongoDB Atlas

**Solutions**:
1. Verify `MONGODB_URI` is correct in `.env`
2. Check MongoDB Atlas Network Access allows your IP (or `0.0.0.0/0` for Vercel)
3. Verify database user credentials are correct
4. Test connection: `npm run test:mongodb-connection`

### Cron Job Not Running

**Problem**: Automatic updates not occurring

**Solutions**:
1. Verify you have a Vercel Pro plan (Hobby plan doesn't support cron)
2. Check `vercel.json` is committed to repository
3. Verify `CRON_SECRET` is set in Vercel environment variables
4. Check Vercel function logs for errors

### Articles Not Appearing

**Problem**: No articles showing in the UI

**Solutions**:
1. Manually trigger an update: `POST /api/cron/update`
2. Check API response: `GET /api/articles`
3. Verify RSS sources in `config/rss-sources.json` are enabled
4. Check Vercel function logs for errors during update cycle

### Search Not Working

**Problem**: Search returns no results

**Solutions**:
1. Verify MongoDB text indexes are created (check database)
2. Test API directly: `GET /api/articles?search=test`
3. Check browser console for JavaScript errors
4. Verify articles exist in database

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- RSS feeds provided by Prothom Alo, The Daily Star, BBC Bangla, and Deutsche Welle Bangla
- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [MongoDB](https://www.mongodb.com/)
- Deployed on [Vercel](https://vercel.com/)
- Designed for Bangladesh news consumers 🇧🇩

## 📞 Support

For issues and questions:
- Check the [RELIABLE_NEWS_SOURCES.md](./RELIABLE_NEWS_SOURCES.md) for source verification
- Review [DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md) for detailed troubleshooting
- Check Vercel function logs for runtime errors
- Review MongoDB Atlas logs for database issues

---

**Built with ❤️ for Bangladesh 🇧🇩 using Next.js, React, and MongoDB**
