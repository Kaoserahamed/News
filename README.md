# Automated News Aggregation Web Application

A full-stack news aggregation system that automatically collects, processes, and presents news articles from multiple RSS feed sources.

## Features

- Automated hourly news collection from multiple RSS sources
- Content processing and normalization
- Duplicate detection and prevention
- MongoDB Atlas data storage
- REST API for news retrieval
- Responsive Next.js frontend
- Search and category filtering
- Pagination support

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (with cron jobs)
- **Libraries**: rss-parser, date-fns, fast-levenshtein

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Set a secure `CRON_SECRET` for cron job authentication

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── lib/
│   ├── services/      # Business logic services
│   ├── models/        # TypeScript interfaces and data models
│   └── utils/         # Utility functions
├── pages/
│   ├── api/           # API routes
│   └── index.tsx      # Main page
├── components/        # React components
├── config/            # Configuration files
└── styles/            # Global styles
```

## Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string
- `CRON_SECRET`: Secret key for authenticating cron job requests
- `NODE_ENV`: Environment (development/production)

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## Deployment

Deploy to Vercel:

1. Push code to Git repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy application
5. Configure cron job in `vercel.json`

## License

MIT
