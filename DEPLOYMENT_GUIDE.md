# Sleep Diary - Google OAuth & Vercel Deployment Guide

## Step 1: Google OAuth Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it: `sleep-diary-app` (or your preference)
4. Click "Create"

### 1.2 Enable Google+ API

1. In your project, go to "APIs & Services" → "Enabled APIs"
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for "Google+ API" or "Google Identity"
4. Enable it

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Sleep Diary`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in development

### 1.4 Configure OAuth Client

1. Application type: "Web application"
2. Name: `Sleep Diary Web Client`
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app-name.vercel.app
   https://your-custom-domain.com (if you have one)
   ```

4. **Authorized redirect URIs:** (IMPORTANT - must be exact)
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app-name.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google
   ```

5. Click "Create"
6. Save your credentials:
   - **Client ID**: Something like: `123456789-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: Something like: `GOCSPX-xxxxxxxxxxxxxxxxx`

## Step 2: Local Environment Setup

### 2.1 Update .env.local
```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-from-google
GOOGLE_CLIENT_SECRET=your-client-secret-from-google

# Database
DATABASE_URL="file:./dev.db"
```

### 2.2 Generate NEXTAUTH_SECRET
```bash
# Run this command to generate a secure secret:
openssl rand -base64 32
```

## Step 3: Prepare for Deployment

### 3.1 Required Files Check
Ensure these files exist and are properly configured:
- [x] `.env.example` (with empty values)
- [x] `package.json` with all dependencies
- [x] `prisma/schema.prisma`
- [x] `next.config.ts`
- [ ] `.gitignore` (ensure .env.local is ignored)

### 3.2 Database for Production
For Vercel deployment, you need a cloud database. Options:
- **Recommended**: [Neon](https://neon.tech) (Postgres, free tier)
- **Alternative**: [PlanetScale](https://planetscale.com) (MySQL, free tier)
- **Alternative**: [Supabase](https://supabase.com) (Postgres, free tier)

#### Using Neon (Recommended):
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Your production DATABASE_URL will look like:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### 3.3 Update Prisma Schema for PostgreSQL
If using PostgreSQL (Neon/Supabase), update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 4: GitHub Repository Setup

### 4.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Sleep Diary app"
```

### 4.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `sleep-diary`
4. Keep it public or private (your choice)
5. Don't initialize with README (you already have files)
6. Click "Create repository"

### 4.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR-USERNAME/sleep-diary.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy to Vercel

### 5.1 Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login (use GitHub for easy integration)
3. Click "Add New" → "Project"
4. Import your `sleep-diary` repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `prisma generate && next build`
   - Output Directory: (leave default)

### 5.2 Environment Variables in Vercel
Add these environment variables in Vercel project settings:

```bash
# Production values
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret-32-characters
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-production-database-url
```

### 5.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://your-app-name.vercel.app`

## Step 6: Post-Deployment

### 6.1 Update Google OAuth Redirect URIs
After deployment, update your Google OAuth settings with your actual Vercel URL:
1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel URLs to authorized origins and redirect URIs
4. Save changes

### 6.2 Initialize Production Database
```bash
# Run these commands locally with production DATABASE_URL
export DATABASE_URL="your-production-database-url"
npx prisma generate
npx prisma db push
```

Or use Vercel CLI:
```bash
vercel env pull .env.production.local
npx prisma db push
```

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Ensure the redirect URI in Google Console matches EXACTLY
   - Must include `/api/auth/callback/google`
   - Check for trailing slashes

2. **Database Connection Issues**
   - Ensure DATABASE_URL is correctly set in Vercel
   - PostgreSQL requires SSL: add `?sslmode=require`
   - Check firewall/IP restrictions on database

3. **NEXTAUTH_SECRET Issues**
   - Must be the same in all environments
   - Should be at least 32 characters
   - Don't include quotes in Vercel env vars

4. **Build Failures**
   - Add `prisma generate` to build command
   - Ensure all dependencies are in `package.json`
   - Check build logs in Vercel dashboard

## Environment Variables Summary

### Local Development (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[32-char-secret]
GOOGLE_CLIENT_ID=[from-google]
GOOGLE_CLIENT_SECRET=[from-google]
DATABASE_URL=file:./dev.db
```

### Production (Vercel)
```
NEXTAUTH_URL=https://[your-app].vercel.app
NEXTAUTH_SECRET=[same-32-char-secret]
GOOGLE_CLIENT_ID=[from-google]
GOOGLE_CLIENT_SECRET=[from-google]
DATABASE_URL=postgresql://[connection-string]
```

## Security Checklist

- [ ] Never commit `.env.local` or `.env`
- [ ] NEXTAUTH_SECRET is unique and secure
- [ ] Database has SSL enabled
- [ ] OAuth redirect URIs are exact
- [ ] Production database is backed up
- [ ] Google OAuth is in production mode (not test)

## Next Steps

After successful deployment:
1. Test OAuth login in production
2. Monitor error logs in Vercel dashboard
3. Set up custom domain (optional)
4. Enable Vercel Analytics (optional)
5. Set up error tracking (Sentry, etc.)