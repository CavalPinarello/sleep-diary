# GitHub OAuth Setup Guide

## ✅ What You'll Get:
- GitHub login option alongside Google
- Works with ANY Vercel URL (no domain restrictions!)
- Takes 5 minutes to set up

## 🚀 Step-by-Step Setup:

### 1. Create GitHub OAuth App

1. Go to: **https://github.com/settings/developers**
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in the form:

   ```
   Application name: Sleep Diary
   Homepage URL: https://sleep-diary-one.vercel.app
   Application description: Track your sleep patterns (optional)
   Authorization callback URL: https://sleep-diary-one.vercel.app/api/auth/callback/github
   ```

5. Click **"Register application"**

### 2. Get Your Credentials

1. You'll see your **Client ID** (looks like: `Iv1.a1b2c3d4e5f6g7h8`)
2. Click **"Generate a new client secret"**
3. **Copy the secret immediately** (you can only see it once!)
   - Looks like: `1234567890abcdef1234567890abcdef12345678`

### 3. Add to Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these two new variables:

   ```
   GITHUB_ID = [paste your Client ID]
   GITHUB_SECRET = [paste your Client Secret]
   ```

3. Click **Save**

### 4. Add to Local Development

Update your `.env.local` file:

```bash
# GitHub OAuth
GITHUB_ID=Iv1.your-actual-client-id
GITHUB_SECRET=your-actual-client-secret
```

### 5. For Local Development (localhost:3000)

If you want to test locally, create a SECOND OAuth App for local development:

1. Create another OAuth App in GitHub
2. Use these settings:
   ```
   Application name: Sleep Diary (Local Dev)
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```
3. Use these credentials in your `.env.local`

### 6. Redeploy

After adding the environment variables to Vercel:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**

## 🎉 Done!

Your login page will now show BOTH options:
- **Continue with Google** (works on localhost)
- **Continue with GitHub** (works everywhere, including Vercel!)

## 🧪 Test It:

1. Visit: https://sleep-diary-one.vercel.app
2. You'll see both login buttons
3. Click "Continue with GitHub"
4. Authorize the app
5. You're in!

---

## 🍎 About Sign in with Apple:

**Complexity**: ⭐⭐⭐⭐⭐ (Much harder than Google or GitHub)

**Requirements**:
- Apple Developer Account ($99/year)
- Domain verification
- Service ID configuration
- Private key generation and management
- Email relay service setup

**Time to set up**: 30-60 minutes (vs 5 minutes for GitHub)

**Recommendation**: Start with GitHub OAuth. If you need Apple later, we can add it, but it requires a paid Apple Developer account.