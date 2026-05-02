# Vercel Cron Job Setup Guide

This document provides instructions for configuring and deploying the automated news aggregator with Vercel cron jobs.

## Configuration Overview

The application uses Vercel's cron job infrastructure to automatically trigger news updates every hour.

### Files Configured

1. **`vercel.json`** - Defines the cron job schedule and endpoint
2. **`.env.example`** - Documents required environment variables
3. **`pages/api/cron/update.ts`** - API endpoint that executes the update cycle

## Cron Job Configuration

The cron job is configured in `vercel.json`:

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

- **Path**: `/api/cron/update` - The API endpoint to call
- **Schedule**: `0 * * * *` - Runs at minute 0 of every hour (hourly)

### Cron Schedule Format

The schedule uses standard cron syntax:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Our configuration `0 * * * *` means:
- Minute: 0 (at the start of the hour)
- Hour: * (every hour)
- Day of month: * (every day)
- Month: * (every month)
- Day of week: * (every day of the week)

**Result**: Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)

## Environment Variables

### Required Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**:

1. **`MONGODB_URI`** - MongoDB Atlas connection string
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   ```

2. **`CRON_SECRET`** - Secret key for authenticating cron requests
   - Generate a strong random string (e.g., using `openssl rand -hex 32`)
   - This prevents unauthorized access to the cron endpoint
   - Vercel automatically includes this in the `Authorization` header when calling cron endpoints

3. **`NODE_ENV`** (optional) - Set to `production` for production deployments

### Setting Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `CRON_SECRET`)
   - **Value**: Variable value
   - **Environments**: Select Production, Preview, and/or Development as needed
4. Click **Save**

## Security

The `/api/cron/update` endpoint implements authentication:

1. Vercel automatically sends the `CRON_SECRET` in the `Authorization` header as `Bearer <secret>`
2. The endpoint verifies the secret before executing the update cycle
3. Unauthorized requests receive a 401 Unauthorized response

### Authentication Flow

```
Vercel Cron → Authorization: Bearer <CRON_SECRET>
              ↓
         /api/cron/update
              ↓
         Verify secret matches process.env.CRON_SECRET
              ↓
         Execute update cycle
```

## Deployment Steps

### 1. Prepare Environment Variables

Generate a secure cron secret:
```bash
# Using OpenSSL (Linux/Mac)
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add MONGODB_URI production
vercel env add CRON_SECRET production
```

#### Option B: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel dashboard
3. Configure environment variables in the dashboard
4. Deploy

### 3. Verify Deployment

After deployment:

1. **Check cron job status** in Vercel dashboard:
   - Go to **Deployments → [Your Deployment] → Cron Jobs**
   - Verify the cron job is listed and scheduled

2. **Test the endpoint manually**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/cron/update \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. **Check logs**:
   - Go to **Deployments → [Your Deployment] → Logs**
   - Look for cron execution logs
   - Verify update cycles are running successfully

4. **Monitor the first automatic run**:
   - Wait for the next hour mark (e.g., 2:00, 3:00)
   - Check logs to confirm automatic execution
   - Verify articles are being fetched and stored

## Monitoring

### Viewing Cron Execution Logs

1. Go to Vercel dashboard → **Deployments**
2. Click on your deployment
3. Navigate to **Functions** tab
4. Find `/api/cron/update` function
5. View execution logs and metrics

### Log Messages to Look For

Successful execution:
```
[2024-01-15T14:00:00.000Z] POST /api/cron/update - Request received
[2024-01-15T14:00:00.100Z] [API /cron/update] Authorization successful, starting update cycle
[2024-01-15T14:00:05.500Z] POST /api/cron/update - Status: 200 - Duration: 5400ms - Articles: 45/50 stored, 5 duplicates skipped
```

Failed authentication:
```
[2024-01-15T14:00:00.000Z] POST /api/cron/update - Request received
[2024-01-15T14:00:00.050Z] [API /cron/update] Invalid cron secret provided
[2024-01-15T14:00:00.051Z] POST /api/cron/update - Status: 401 - Duration: 51ms - Error: Invalid secret
```

### Health Check Endpoint

Use the `/api/health` endpoint to verify system status:

```bash
curl https://your-app.vercel.app/api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "lastUpdate": "2024-01-15T14:00:05.500Z"
  }
}
```

## Troubleshooting

### Cron Job Not Running

1. **Verify cron job is configured**:
   - Check `vercel.json` exists and has correct configuration
   - Redeploy if changes were made

2. **Check environment variables**:
   - Verify `CRON_SECRET` is set in Vercel dashboard
   - Ensure it matches the value used for manual testing

3. **Review logs**:
   - Look for error messages in function logs
   - Check for authentication failures

### Authentication Failures

1. **Verify CRON_SECRET is set**:
   ```bash
   vercel env ls
   ```

2. **Regenerate and update secret**:
   - Generate a new secret
   - Update in Vercel dashboard
   - Redeploy

### Update Cycle Failures

1. **Check MongoDB connection**:
   - Verify `MONGODB_URI` is correct
   - Test connection using `/api/health` endpoint

2. **Review RSS sources**:
   - Check `config/rss-sources.json`
   - Verify RSS feed URLs are accessible

3. **Check function timeout**:
   - Vercel has a 10-second timeout for Hobby plan
   - Consider upgrading plan if needed
   - Optimize RSS fetching if timeout occurs

## Requirements Satisfied

This configuration satisfies the following requirements:

- **Requirement 11.1**: The News_Aggregator executes the Update_Cycle every 1 hour
- **Requirement 11.5**: The News_Aggregator executes Update_Cycles using Vercel cron job infrastructure

## Additional Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Cron Expression Format](https://crontab.guru/)

## Summary

✅ **Configuration Complete**
- `vercel.json` configured with hourly cron schedule
- `/api/cron/update` endpoint implemented with authentication
- `CRON_SECRET` environment variable documented
- Security measures in place

🚀 **Ready for Deployment**
- Set environment variables in Vercel dashboard
- Deploy to Vercel
- Monitor first automatic execution
- Verify hourly updates are working
