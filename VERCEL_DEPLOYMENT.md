# Vercel Deployment Guide for SeedSlingers

## Prerequisites

1. Vercel account (free at vercel.com)
2. GitHub account with this repository
3. Required environment variables (see below)

## Quick Start

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Authorize GitHub and select `EWilliamHertz/SeedSlingers`
5. Vercel will auto-detect the configuration

### 2. Set Environment Variables

In the Vercel dashboard, go to **Project Settings → Environment Variables** and add:

**Required Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string (Neon database)
- `AUTH_SECRET` - Generate a random secret (32+ characters)
- `AUTH_URL` - Your Vercel deployment URL (https://your-project.vercel.app)
- `ANYTHING_PROJECT_TOKEN` - Your Anything project token

**Optional OAuth Variables (if using social login):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

**Other:**
- `NEXT_PUBLIC_CREATE_ENV=PRODUCTION`
- `STRIPE_SECRET_KEY` (if using Stripe)

### 3. Configure Vercel Settings

The `vercel.json` file in the root directory specifies:
- **Build Command:** `cd anything/apps/web && npm run build`
- **Output Directory:** `anything/apps/web/build`
- **Framework:** React Router
- **Node Version:** 20.x

### 4. Deploy

Once variables are set:
1. Click "Deploy" in Vercel
2. Watch the build logs for any errors
3. Deployment will take 2-5 minutes

## Troubleshooting

### Build Fails with "DATABASE_URL not set"
- Ensure `DATABASE_URL` is set in Vercel Environment Variables
- The variable must be available at build time

### "AUTH_SECRET is missing"
- Generate a secure random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to Environment Variables

### "Build command not found"
- Verify `package.json` is in the root directory
- Check that npm packages are installed correctly

## Custom Domain

1. In Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as per Vercel instructions
4. Update `AUTH_URL` environment variable to your custom domain

## Monitoring

- View logs: Vercel Dashboard → Deployments
- Check performance: Vercel Analytics
- Monitor errors: Vercel Error Tracking

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to test locally before deploying.
