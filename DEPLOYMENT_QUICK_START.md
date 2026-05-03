# Deployment Quick Start Guide

This is a quick reference for deploying the Automated News Aggregator. For detailed instructions, see the full documentation.

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **[README.md](./README.md)** | Main documentation - start here |
| **[DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md)** | Detailed deployment guide with troubleshooting |
| **[VERCEL_CRON_SETUP.md](./VERCEL_CRON_SETUP.md)** | Cron job configuration details |
| **[.env.example](./.env.example)** | Environment variables template |

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas account created
- [ ] Vercel account created
- [ ] Git repository ready

### 2. MongoDB Atlas Setup (5 minutes)

1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Create database user (Database Access → Add New User)
3. Add IP `0.0.0.0/0` to Network Access (for Vercel)
4. Get connection string (Cluster → Connect → Connect your application)

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
```

### 3. Generate Cron Secret

```bash
# Choose one method:
openssl rand -hex 32                                                    # Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" # Any OS
```

### 4. Deploy to Vercel (5 minutes)

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Click "Deploy" (don't configure yet)

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add for **Production**:
     - `MONGODB_URI` = your connection string
     - `CRON_SECRET` = your generated secret
     - `NODE_ENV` = `production`

4. **Redeploy:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### 5. Verify Deployment (2 minutes)

```bash
# Replace YOUR_APP with your Vercel app name

# 1. Check health
curl https://YOUR_APP.vercel.app/api/health

# 2. Trigger first update
curl -X POST https://YOUR_APP.vercel.app/api/cron/update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 3. Check articles
curl https://YOUR_APP.vercel.app/api/articles?limit=5
```

### 6. Verify Cron Job

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on production deployment
3. Look for "Cron Jobs" section
4. Verify job is listed: `/api/cron/update` with schedule `0 * * * *`

**Note:** Cron jobs require Vercel Pro plan ($20/month). Hobby plan doesn't support cron.

## ⚡ Local Development Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd news-aggregator
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and CRON_SECRET

# 3. Test database connection
npm run test:mongodb-connection

# 4. Start development server
npm run dev
# Open http://localhost:3000
```

## 🔧 Configuration Files

### RSS Sources (`config/rss-sources.json`)

```json
{
  "sources": [
    {
      "id": "unique-id",
      "name": "Source Name",
      "url": "https://example.com/feed.xml",
      "category": "Technology",
      "enabled": true
    }
  ]
}
```

**Available Categories:**
- Technology
- Sports
- Business
- Politics
- Entertainment
- General

### Cron Schedule (`vercel.json`)

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

Current schedule: Every hour at minute 0 (1:00, 2:00, 3:00, etc.)

## 🐛 Common Issues

### Database Connection Failed
- ✅ Check `MONGODB_URI` is correct
- ✅ Verify Network Access allows `0.0.0.0/0`
- ✅ Confirm database user credentials

### Cron Not Running
- ✅ Verify Vercel Pro plan (Hobby doesn't support cron)
- ✅ Check `vercel.json` is in repository
- ✅ Confirm `CRON_SECRET` is set in Vercel

### No Articles Showing
- ✅ Manually trigger update: `POST /api/cron/update`
- ✅ Check Vercel function logs
- ✅ Verify RSS sources are enabled in `config/rss-sources.json`

## 📖 Full Documentation

For detailed information, see:

- **Setup & Configuration**: [README.md](./README.md)
- **Deployment Details**: [DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md)
- **Cron Configuration**: [VERCEL_CRON_SETUP.md](./VERCEL_CRON_SETUP.md)
- **Troubleshooting**: [DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md#troubleshooting)

## 🎯 Next Steps After Deployment

1. ✅ Wait for first automatic cron execution (next hour mark)
2. ✅ Monitor Vercel function logs
3. ✅ Check `/api/health` endpoint regularly
4. ✅ Customize RSS sources in `config/rss-sources.json`
5. ✅ Set up monitoring/alerting (optional)

## 📞 Need Help?

- Check [DEPLOYMENT_CONFIGURATION.md](./DEPLOYMENT_CONFIGURATION.md) troubleshooting section
- Review Vercel function logs
- Check MongoDB Atlas logs
- Verify environment variables are set correctly

---

**Total Deployment Time: ~15 minutes**

**Requirements:**
- MongoDB Atlas (free tier OK)
- Vercel Pro plan ($20/month for cron jobs)
- Git repository
