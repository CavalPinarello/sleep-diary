# Google OAuth Domain Error - Troubleshooting Guide

## Common Causes & Solutions

### 1. OAuth Consent Screen Not Configured
**Go to Google Cloud Console → APIs & Services → OAuth consent screen**

Check these settings:
- **User Type**: External
- **Publishing Status**: Should be "Testing" for now
- **App Information**:
  - App name: Sleep Diary
  - User support email: Your email
  - Developer contact: Your email
- **Authorized domains**: Leave empty for now (this might be the issue!)
- **Test users**: Add your email address

### 2. Try Without the HTTPS
In Google OAuth settings, try adding the origins without specifying protocol:
```
Authorized JavaScript origins:
localhost:3000
sleep-diary-one.vercel.app
```

### 3. Verify Domain Ownership (If Required)
Sometimes Google requires domain verification:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://sleep-diary-one.vercel.app`
3. Verify using HTML tag method
4. Add the verification meta tag to your Next.js app

### 4. Use Only localhost First
**Simplest approach - Just get it working locally first:**

In Google OAuth, ONLY add:
```
Authorized JavaScript origins:
http://localhost:3000

Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
```

Then test locally to make sure OAuth works.

## Step-by-Step Fix

### Step 1: Check OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Make sure it's configured with:
   - External user type
   - Your app information filled in
   - Status is "Testing"

### Step 2: Simplify OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. **Remove all entries** and only add:
   ```
   Authorized JavaScript origins:
   http://localhost:3000
   
   Authorized redirect URIs:
   http://localhost:3000/api/auth/callback/google
   ```
4. Click **Save**

### Step 3: Test Locally
```bash
# Make sure you have .env.local with your credentials
cat .env.local

# Should show:
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=RnwwFCHZ4rNWnR/NYp4BmoWIEHuLycx1Sj/POnza4dA=
# GOOGLE_CLIENT_ID=your-id-here
# GOOGLE_CLIENT_SECRET=your-secret-here
# DATABASE_URL=file:./dev.db

# Set up local database
npm run db:generate:local
npm run db:push:local

# Run dev server
npm run dev
```

### Step 4: If Local Works, Add Production Domain
Once local OAuth works, try adding the production domain again:

1. In Google OAuth settings, add:
   ```
   Authorized JavaScript origins:
   http://localhost:3000
   https://sleep-diary-one.vercel.app
   
   Authorized redirect URIs:
   http://localhost:3000/api/auth/callback/google
   https://sleep-diary-one.vercel.app/api/auth/callback/google
   ```

2. If it still fails, try without HTTPS:
   ```
   sleep-diary-one.vercel.app
   ```

## Alternative Solutions

### Option A: Use a Different Auth Provider
While we fix Google OAuth, you could add GitHub auth:
```javascript
// In auth.config.ts
import GitHubProvider from "next-auth/providers/github"

providers: [
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  })
]
```

### Option B: Deploy to a Different Platform
- **Railway**: Provides `*.up.railway.app` domains
- **Render**: Provides `*.onrender.com` domains
- **Netlify**: Provides `*.netlify.app` domains

### Option C: Use ngrok for Testing
```bash
# Install ngrok
brew install ngrok

# Run your app
npm run dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL in Google OAuth
```

## The Nuclear Option: Create New Google Project

If nothing works:
1. Create a NEW project in Google Cloud Console
2. Enable Google+ API
3. Create NEW OAuth credentials
4. Start with just localhost
5. Test thoroughly
6. Then add production domains

## Debug Information Needed

To help debug, check these:
1. What's the EXACT error message from Google?
2. Is your OAuth consent screen in "Testing" or "Production" mode?
3. Are there any "Authorized domains" listed in the consent screen?
4. What happens if you only use localhost URLs?

## Let's Test Locally First!

Before dealing with production domains, let's make sure OAuth works locally:

```bash
# 1. Update .env.local with your Google credentials
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "NEXTAUTH_SECRET=RnwwFCHZ4rNWnR/NYp4BmoWIEHuLycx1Sj/POnza4dA=" >> .env.local
echo "GOOGLE_CLIENT_ID=your-client-id" >> .env.local
echo "GOOGLE_CLIENT_SECRET=your-secret" >> .env.local
echo "DATABASE_URL=file:./dev.db" >> .env.local

# 2. Set up database
npm run db:generate:local
npm run db:push:local

# 3. Run the app
npm run dev

# 4. Open http://localhost:3000 and test login
```