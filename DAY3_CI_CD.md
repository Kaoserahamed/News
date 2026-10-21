# Day 3 CI/CD: Build / Test / Deploy Pipeline

## Repository
`News` — Bangladesh News Aggregator (Next.js 14, MongoDB Atlas)

## Pipeline Overview
GitHub Actions CI/CD for Next.js 14 serverless application.

### Trigger
- Push/Pull Request to `main`
- Manual workflow dispatch

### Stages

#### 1. Lint & Format
- ESLint + Prettier (TypeScript)
- Code style enforcement

#### 2. Typecheck
- `tsc --noEmit` (TypeScript strict mode)

#### 3. Test
- `npm test` (Jest)
- Unit tests for components (ArticleCard, CategoryFilter, SearchBar)
- Integration tests for API routes (articles, health, cron)
- Coverage: Jest coverage

#### 4. Build
- `npm run build` (Next.js production build)
- Output: `.next/` directory
- Vercel build optimization

#### 5. Security Scan
- `npm audit`
- Secret detection (no `MONGODB_URI`, no `CRON_SECRET` committed)
- Dependency vulnerability check

#### 6. Deploy (on merge to `main`)
- Deploy to Vercel (production)
- Configure environment variables (`MONGODB_URI`, `CRON_SECRET`, `NODE_ENV`)
- Vercel cron job activation (daily at midnight)
- Health check: `GET /api/health`

### Quality Gates
- All tests pass
- TypeScript strict mode clean
- Build succeeds (`npm run build`)
- No secrets committed
- Linting clean

### Artifacts
- Next.js build output (`.next/`)
- Test reports
- Coverage reports
- Vercel deployment URL
- Cron job configuration

## Day 3 Outcome
CI/CD pipeline documented. No code changes. 0 PRs. Ready for Day 4 (project restructuring).
<!-- Feature branch commit for PR -->
