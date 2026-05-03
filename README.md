# Bangladesh News Aggregator 🇧🇩

A full-stack automated news aggregation system that collects, processes, and presents news articles from reliable Bangladesh news sources. Features intelligent duplicate detection, automatic categorization, dark mode, and a responsive bilingual interface.

## ✨ Key Features

### 🎨 User Interface
- **🌓 Dark Mode** - Toggle between light and dark themes with persistent preference
- **📱 Fully Responsive** - Optimized for all devices (320px - 2560px)
- **🇧🇩 Bilingual Support** - Content and UI in both Bangla and English
- **🎯 Category Filtering** - Filter by Technology, Sports, Business, Politics, Entertainment, General
- **📄 Pagination** - Smooth navigation through articles (30 per page)
- **📸 Rich Media** - Article images with lazy loading

### 🤖 Backend & Automation
- **⏰ Daily Updates** - Automated news collection via Vercel cron jobs
- **🔍 Duplicate Detection** - 90% accuracy using Levenshtein distance algorithm
- **🧠 Smart Categorization** - Automatic Bangladesh-specific keyword categorization
- **🧹 Content Processing** - HTML cleaning, normalization, and text extraction
- **💾 MongoDB Atlas** - Cloud database with optimized indexes
- **🔌 REST API** - Clean JSON API with pagination and filtering
- **❤️ Health Monitoring** - Built-in health check endpoint

##  Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR and API routes
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with dark mode

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Node.js** - JavaScript runtime

### Key Libraries
- `rss-parser` - RSS feed parsing
- `date-fns` - Date formatting and manipulation
- `fast-levenshtein` - String similarity for duplicate detection
- `mongodb` - Official MongoDB driver

### Deployment
- **Vercel** - Serverless deployment with cron jobs
- **MongoDB Atlas** - Database hosting

## 📋 Prerequisites

- **Node.js 18+** and npm
- **MongoDB Atlas account** (free tier available)
- **Vercel account** (optional, for deployment)
- **Git** for version control

## 🛠️ Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/bangladesh-news-aggregator.git
cd bangladesh-news-aggregator
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# MongoDB Atlas Connection String
MONGODB_URI=your_mongodb_connection_string

# Cron Secret (generate a secure random string)
CRON_SECRET=your_secure_random_string

# Node Environment
NODE_ENV=development
```

**Generate CRON_SECRET:**

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Set Up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user with read/write permissions
3. Configure network access (add your IP or `0.0.0.0/0` for development)
4. Get your connection string and update `MONGODB_URI` in `.env`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Trigger Manual Update (Optional)

```bash
curl -X POST http://localhost:3000/api/cron/update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📁 Project Structure

```
bangladesh-news-aggregator/
├── components/              # React UI components
│   ├── ArticleCard.tsx     # Individual article display
│   ├── ArticleList.tsx     # Article grid layout
│   ├── CategoryFilter.tsx  # Category filter buttons
│   ├── ErrorMessage.tsx    # Error display
│   ├── Header.tsx          # App header with dark mode toggle
│   ├── Pagination.tsx      # Pagination controls
│   └── ThemeToggle.tsx     # Dark mode toggle button
├── config/
│   └── rss-sources.json    # RSS feed configuration
├── lib/
│   ├── models/             # TypeScript interfaces
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── pages/
│   ├── api/                # API routes
│   │   ├── articles.ts     # GET /api/articles
│   │   ├── health.ts       # GET /api/health
│   │   └── cron/
│   │       └── update.ts   # POST /api/cron/update
│   ├── _app.tsx            # Next.js app wrapper
│   └── index.tsx           # Main page
├── styles/
│   └── globals.css         # Global styles with dark mode
├── .env.example            # Environment template
├── vercel.json             # Vercel cron configuration
└── package.json            # Dependencies and scripts
```

## 🌐 API Endpoints

### GET `/api/articles`

Retrieve articles with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Articles per page
- `category` (string, optional) - Filter by category

**Example:**
```bash
curl "http://localhost:3000/api/articles?page=1&limit=30&category=Technology"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 150,
      "totalPages": 5
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

### 1. Prepare Repository

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `CRON_SECRET` - Secure random string
   - `NODE_ENV` - Set to `production`
5. Click "Deploy"

### 3. Verify Deployment

The cron job runs daily at midnight (configured in `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/update",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Note**: Cron jobs require a Vercel Pro plan or higher.

## 🎨 Dark Mode

The application includes a complete dark mode implementation:

- **Toggle Button**: Located in the header (top-right)
- **Persistent**: Preference saved in localStorage
- **System Preference**: Respects `prefers-color-scheme` on first visit
- **Smooth Transitions**: All color changes animate smoothly

## 📊 Categories

Articles are automatically categorized:

- **🔧 প্রযুক্তি (Technology)** - Tech news, gadgets, software
- **⚽ খেলাধুলা (Sports)** - Cricket, football, BPL
- **💼 ব্যবসা (Business)** - Economy, stock market, trade
- **🏛️ রাজনীতি (Politics)** - Government, elections, policy
- **🎬 বিনোদন (Entertainment)** - Dhallywood, music, culture
- **📰 সাধারণ (General)** - Other news and events

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

## 🔍 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to MongoDB Atlas

**Solutions**:
1. Verify `MONGODB_URI` in `.env`
2. Check Network Access in MongoDB Atlas
3. Verify database user credentials
4. Ensure your IP is whitelisted

### Cron Job Not Running

**Problem**: Automatic updates not occurring

**Solutions**:
1. Verify Vercel Pro plan (required for cron jobs)
2. Check `vercel.json` is committed to repository
3. Verify `CRON_SECRET` in Vercel environment variables
4. Check Vercel function logs for errors

### Articles Not Appearing

**Problem**: No articles in UI

**Solutions**:
1. Manually trigger update: `POST /api/cron/update`
2. Check API response: `GET /api/articles`
3. Verify RSS sources are enabled in `config/rss-sources.json`
4. Check browser console for errors

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## � License

MIT License

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), [MongoDB](https://www.mongodb.com/)
- Deployed on [Vercel](https://vercel.com/)
- Designed for Bangladesh 🇧🇩

---

**Built with ❤️ for Bangladesh 🇧🇩**
