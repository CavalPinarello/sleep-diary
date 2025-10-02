# Sleep Diary - Vercel Deployment Guide

This guide walks you through deploying your Sleep Diary application to Vercel with full authentication and database integration.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: For OAuth authentication
3. **Database**: PostgreSQL database (recommended: [Neon](https://neon.tech) or [Supabase](https://supabase.com))
4. **Domain** (optional): Custom domain for your application

## 🚀 Quick Deployment

### Step 1: Environment Setup

1. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your environment variables** in `.env.local`:
   ```env
   # Authentication
   NEXTAUTH_URL=http://localhost:3000  # Will be updated after deployment
   NEXTAUTH_SECRET=your_secret_here    # Generate with: openssl rand -base64 32
   
   # GitHub OAuth
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   
   # Database
   DATABASE_URL=your_postgresql_connection_string
   ```

### Step 2: Set Up GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Create a new OAuth App with these settings:
   - **Application name**: Sleep Diary
   - **Homepage URL**: `http://localhost:3000` (temporary)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Save the **Client ID** and **Client Secret** to your `.env.local`

### Step 3: Set Up Database

#### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string to your `.env.local` as `DATABASE_URL`

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. Add to `.env.local` as `DATABASE_URL`

### Step 4: Deploy to Vercel

1. **Using the deployment script** (recommended):
   ```bash
   ./deploy.sh
   ```

2. **Or manually**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to your Vercel account
   - Choose a project name
   - Configure build settings (should auto-detect)

### Step 5: Configure Production Environment

1. **Go to your Vercel dashboard** → Project → Settings → Environment Variables

2. **Add these environment variables**:
   ```
   NEXTAUTH_URL=https://your-app-domain.vercel.app
   NEXTAUTH_SECRET=your_secret_here
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

3. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

### Step 6: Update OAuth Settings

1. **Update GitHub OAuth App**:
   - **Homepage URL**: `https://your-app-domain.vercel.app`
   - **Authorization callback URL**: `https://your-app-domain.vercel.app/api/auth/callback/github`

2. **Test authentication** by visiting your deployed app

## 🔧 Advanced Configuration

### Custom Domain

1. **Go to Vercel dashboard** → Project → Settings → Domains
2. **Add your custom domain**
3. **Update environment variables** and OAuth settings with your custom domain

### Database Migrations

If you need to run database migrations:

```bash
# Using the production schema
npm run db:push:production

# Or if using migrations
npm run db:migrate:deploy
```

### Environment-Specific Builds

- **Local development**: Uses SQLite
- **Production**: Uses PostgreSQL

The build process automatically detects the environment and uses the appropriate schema.

## 📊 Analytics API

Your deployed application includes comprehensive sleep analytics with:

- **Clinical Insights**: Automated health pattern detection
- **Trend Analysis**: Long-term sleep pattern tracking
- **Wellness Correlations**: Sleep-health relationship analysis
- **Personalized Recommendations**: Evidence-based sleep improvement suggestions

API endpoints available:
- `/api/analytics` - Comprehensive analytics
- `/api/programs` - Sleep program management
- `/api/clinical-entries` - Clinical sleep data
- `/api/entries` - Basic sleep entries

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Database Security**: Use connection pooling and SSL connections
3. **Authentication**: NextAuth.js handles secure OAuth flows
4. **API Security**: All endpoints include authentication checks

## 🔍 Troubleshooting

### Build Failures

1. **Prisma Issues**:
   ```bash
   # Clear generated files
   rm -rf src/generated/
   
   # Regenerate for production
   npm run db:generate:production
   ```

2. **Environment Variable Issues**:
   - Ensure all required variables are set in Vercel dashboard
   - Check that NEXTAUTH_URL matches your deployment URL

### Database Connection Issues

1. **Check connection string format**:
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

2. **Verify database accessibility** from Vercel's servers

### Authentication Issues

1. **Check OAuth app settings** match your deployment URL
2. **Verify NEXTAUTH_SECRET** is set and consistent
3. **Test callback URLs** are correct

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon PostgreSQL](https://neon.tech/docs)

## 🆘 Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Ensure your database is accessible
4. Test OAuth settings with the correct URLs

Your Sleep Diary application is now ready for production use with full clinical sleep tracking and analytics capabilities! 🎉