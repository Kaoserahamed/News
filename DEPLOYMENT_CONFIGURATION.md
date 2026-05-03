# Deployment Configuration Guide

This guide provides step-by-step instructions for configuring environment variables for deploying the Automated News Aggregator to Vercel.

## Overview

The application requires specific environment variables to be configured in Vercel for proper operation. These variables control database connectivity, cron job authentication, and application behavior.

## Required Environment Variables

### 1. MONGODB_URI

**Purpose**: MongoDB Atlas connection string for database access

**Format**:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
```

**How to obtain**:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click "Connect" → "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string
6. Replace `<username>` and `<password>` with your database credentials

**Example**:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/?appName=Cluster0
```

**Requirements satisfied**: 4.1 (Data Storage and Persistence)

---

### 2. CRON_SECRET

**Purpose**: Secret key for authenticating Vercel cron job requests to the `/api/cron/update` endpoint

**Security**: This prevents unauthorized access to the automated update endpoint

**How to generate**:

**Option A - Using OpenSSL (Linux/Mac)**:
```bash
openssl rand -hex 32
```

**Option B - Using Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C - Using PowerShell (Windows)**:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Requirements satisfied**: 11.5 (Scheduled Update Execution with Vercel cron)

---

### 3. NODE_ENV (Optional)

**Purpose**: Specifies the application environment

**Values**:
- `production` - For production deployments (recommended)
- `development` - For development/testing

**Default**: If not set, Vercel automatically sets this to `production` for production deployments

**Note**: This affects error message verbosity and logging behavior

---

## RSS Source Configuration

RSS feed sources are configured in `config/rss-sources.json` and do **not** require environment variables.

The application currently includes 8 pre-configured news sources:
- TechCrunch (Technology)
- ESPN (Sports)
- Bloomberg Business (Business)
- Politico (Politics)
- Variety Entertainment (Entertainment)
- Wired (Technology)
- BBC Sport (Sports) - disabled by default
- CNBC Business (Business)

To modify RSS sources, edit `config/rss-sources.json` before deployment.

---

## Setting Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Navigate to your project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Open Environment Variables settings**:
   - Click "Settings" in the top navigation
   - Click "Environment Variables" in the left sidebar

3. **Add each variable**:
   - Click "Add New" button
   - Enter the variable name (e.g., `MONGODB_URI`)
   - Enter the variable value
   - Select which environments to apply to:
     - ✅ **Production** (required)
     - ✅ **Preview** (recommended for testing)
     - ⬜ **Development** (optional, for local development)
   - Click "Save"

4. **Repeat for all required variables**:
   - `MONGODB_URI`
   - `CRON_SECRET`
   - `NODE_ENV` (optional)

5. **Redeploy** (if already deployed):
   - Go to "Deployments" tab
   - Click "..." menu on the latest deployment
   - Click "Redeploy"
   - This ensures the new environment variables are applied

### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_URI production
# Paste your MongoDB URI when prompted

vercel env add CRON_SECRET production
# Paste your generated secret when prompted

vercel env add NODE_ENV production
# Enter: production

# Deploy
vercel --prod
```

---

## Testing MongoDB Connection

After configuring environment variables, verify the MongoDB connection:

### 1. Test via Health Endpoint

Once deployed, test the health endpoint:

```bash
curl https://your-app.vercel.app/api/health
```

**Expected response** (healthy):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "lastUpdate": "2024-01-15T14:00:05.500Z",
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

**Expected response** (before first update):
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "database": "connected",
    "lastUpdate": null,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

**Error response** (connection failed):
```json
{
  "success": true,
  "data": {
    "status": "unhealthy",
    "database": "disconnected",
    "lastUpdate": null,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

### 2. Test via Cron Endpoint (Manual Trigger)

Manually trigger an update cycle to test the full system:

```bash
curl -X POST https://your-app.vercel.app/api/cron/update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the actual secret you configured.

**Expected response** (success):
```json
{
  "success": true,
  "data": {
    "articlesProcessed": 45,
    "articlesStored": 32,
    "duplicatesSkipped": 13,
    "duration": 12500,
    "timestamp": "2024-01-15T14:00:05.500Z"
  }
}
```

### 3. Monitor Vercel Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Navigate to "Functions" tab
4. Look for `/api/health` and `/api/cron/update` functions
5. Check execution logs for errors

---

## Verifying Cron Job Configuration

### Check Cron Job Status

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your production deployment
3. Look for "Cron Jobs" section
4. Verify the cron job is listed:
   - **Path**: `/api/cron/update`
   - **Schedule**: `0 * * * *` (every hour at minute 0)

### Monitor First Automatic Execution

1. Wait for the next hour mark (e.g., 2:00, 3:00, 4:00)
2. Check Vercel function logs for `/api/cron/update`
3. Look for log entries indicating successful execution:
   ```
   [2024-01-15T14:00:00.000Z] POST /api/cron/update - Request received
   [2024-01-15T14:00:00.100Z] [API /cron/update] Authorization successful, starting update cycle
   [2024-01-15T14:00:05.500Z] POST /api/cron/update - Status: 200 - Duration: 5400ms - Articles: 45/50 stored, 5 duplicates skipped
   ```

---

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms**:
- Health endpoint returns `"database": "disconnected"`
- Cron endpoint fails with database errors

**Solutions**:
1. **Verify MONGODB_URI is correct**:
   - Check for typos in username, password, or cluster address
   - Ensure the connection string includes `?appName=` parameter
   
2. **Check MongoDB Atlas Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Ensure `0.0.0.0/0` is allowed (for Vercel's dynamic IPs)
   - Or add Vercel's IP ranges if using IP allowlist

3. **Verify Database User Permissions**:
   - Go to MongoDB Atlas → Database Access
   - Ensure the user has read/write permissions
   - Check that the password is correct

4. **Test connection string locally**:
   ```bash
   # Create a test script
   node -e "const { MongoClient } = require('mongodb'); const client = new MongoClient('YOUR_MONGODB_URI'); client.connect().then(() => { console.log('Connected!'); client.close(); }).catch(err => console.error('Error:', err));"
   ```

### Issue: Cron Job Not Running

**Symptoms**:
- No automatic updates occurring
- No logs in Vercel for `/api/cron/update` at hourly intervals

**Solutions**:
1. **Verify vercel.json is deployed**:
   - Check that `vercel.json` exists in your repository
   - Ensure it contains the cron configuration
   - Redeploy if changes were made

2. **Check Vercel plan limits**:
   - Cron jobs require a paid Vercel plan (Pro or Enterprise)
   - Hobby plan does not support cron jobs
   - Upgrade plan if necessary

3. **Verify deployment is production**:
   - Cron jobs only run on production deployments
   - Preview deployments do not trigger cron jobs

### Issue: Cron Authentication Failures

**Symptoms**:
- Manual cron trigger works, but automatic execution fails
- Logs show "Invalid cron secret" errors

**Solutions**:
1. **Verify CRON_SECRET is set in production environment**:
   ```bash
   vercel env ls
   ```
   - Ensure `CRON_SECRET` is listed for production

2. **Regenerate and update secret**:
   - Generate a new secret using one of the methods above
   - Update in Vercel Dashboard → Settings → Environment Variables
   - Redeploy the application

3. **Check for whitespace in secret**:
   - Ensure no leading/trailing spaces in the secret value
   - Re-enter the secret if necessary

### Issue: Update Cycle Timeout

**Symptoms**:
- Cron endpoint returns timeout errors
- Logs show incomplete update cycles

**Solutions**:
1. **Check Vercel function timeout limits**:
   - Hobby plan: 10 seconds
   - Pro plan: 60 seconds
   - Enterprise plan: 900 seconds

2. **Optimize RSS fetching**:
   - Reduce number of enabled RSS sources in `config/rss-sources.json`
   - Increase timeout values in news collector service

3. **Consider upgrading Vercel plan**:
   - If update cycles consistently exceed 10 seconds, upgrade to Pro plan

---

## Security Best Practices

### 1. Keep Secrets Secure

- ❌ **Never commit** `.env` file to version control
- ✅ **Always use** `.env.example` for documentation
- ✅ **Store secrets** only in Vercel Dashboard
- ✅ **Rotate secrets** periodically (every 90 days recommended)

### 2. MongoDB Security

- ✅ **Use strong passwords** (minimum 16 characters, mixed case, numbers, symbols)
- ✅ **Enable IP allowlist** if possible (though Vercel uses dynamic IPs)
- ✅ **Use least privilege** database user permissions
- ✅ **Enable MongoDB Atlas audit logs** for production

### 3. Cron Secret Security

- ✅ **Generate cryptographically secure** random strings (32+ bytes)
- ✅ **Never expose** the secret in client-side code
- ✅ **Rotate regularly** (every 90 days)
- ✅ **Use different secrets** for production and preview environments

---

## Deployment Checklist

Before deploying to production, verify:

- [ ] MongoDB Atlas cluster is created and running
- [ ] Database user is created with read/write permissions
- [ ] Network access is configured (0.0.0.0/0 for Vercel)
- [ ] `MONGODB_URI` is set in Vercel environment variables (Production)
- [ ] `CRON_SECRET` is generated and set in Vercel environment variables (Production)
- [ ] `NODE_ENV` is set to `production` (optional, auto-set by Vercel)
- [ ] `vercel.json` contains cron configuration
- [ ] `config/rss-sources.json` is configured with desired sources
- [ ] Application is deployed to Vercel
- [ ] Health endpoint returns `"database": "connected"`
- [ ] Manual cron trigger succeeds
- [ ] Cron job appears in Vercel Dashboard
- [ ] First automatic cron execution succeeds (wait for next hour)

---

## Requirements Satisfied

This configuration satisfies the following requirements:

- **Requirement 4.1**: Data Storage and Persistence - MongoDB Atlas connection configured
- **Requirement 11.5**: Scheduled Update Execution - Vercel cron job infrastructure configured with authentication

---

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [MongoDB Atlas Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Cron Expression Format](https://crontab.guru/)

---

## Summary

✅ **Environment Variables Documented**
- `MONGODB_URI` - Database connection string
- `CRON_SECRET` - Cron job authentication
- `NODE_ENV` - Application environment (optional)

✅ **Configuration Instructions Provided**
- Step-by-step Vercel Dashboard setup
- Vercel CLI alternative method
- Secret generation commands

✅ **Testing Procedures Documented**
- Health endpoint verification
- Manual cron trigger testing
- Automatic execution monitoring

✅ **Troubleshooting Guide Included**
- Database connection issues
- Cron job configuration problems
- Authentication failures
- Timeout handling

🚀 **Ready for Production Deployment**
