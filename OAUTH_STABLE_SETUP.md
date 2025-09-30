# Stable OAuth Configuration Guide

## Problem
Vercel generates multiple URLs, but OAuth providers only allow specific callback URLs. This causes login to break across different deployments.

## Solution: Use Vercel's Stable Production Domain

Your **stable production domain** is: `sleep-diary-one.vercel.app`

This domain **never changes** and should be used for OAuth configuration.

---

## GitHub OAuth Setup (Production - Vercel)

### Step 1: Update GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **OAuth Apps**
3. Find your Sleep Diary app (or create a new one called "Sleep Diary - Production")
4. Set these values:
   - **Homepage URL**: `https://sleep-diary-one.vercel.app`
   - **Authorization callback URL**: `https://sleep-diary-one.vercel.app/api/auth/callback/github`

5. Copy the **Client ID** and **Client Secret**

### Step 2: Update Vercel Environment Variables
1. Go to https://vercel.com (your Sleep Diary project)
2. Go to **Settings** → **Environment Variables**
3. Update or add:
   ```
   GITHUB_ID=<your_production_client_id>
   GITHUB_SECRET=<your_production_client_secret>
   NEXTAUTH_URL=https://sleep-diary-one.vercel.app
   ```
4. Make sure these are set for **Production** environment
5. **Redeploy** after changing environment variables

---

## GitHub OAuth Setup (Local Development)

For local development, create a **separate** OAuth app:

### Step 1: Create Local Development OAuth App
1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Set these values:
   - **Application name**: `Sleep Diary - Local Development`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

4. Copy the **Client ID** and **Client Secret**

### Step 2: Update Local .env.local
Update `/Users/martinkawalski/sleep-diary/.env.local`:
```bash
GITHUB_ID=<your_local_client_id>
GITHUB_SECRET=<your_local_client_secret>
NEXTAUTH_URL=http://localhost:3000
```

---

## Google OAuth Setup (Already Working)

Google OAuth is more flexible and allows multiple callback URLs, so it should work across all Vercel deployments. If it's not working, update:

**Authorized redirect URIs** in Google Cloud Console:
- `https://sleep-diary-one.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

---

## Important: NEXTAUTH_URL Environment Variable

The `NEXTAUTH_URL` tells NextAuth what base URL to use for callbacks.

**Production (Vercel):**
```
NEXTAUTH_URL=https://sleep-diary-one.vercel.app
```

**Local Development:**
```
NEXTAUTH_URL=http://localhost:3000
```

---

## Testing Checklist

### Local Testing (localhost:3000)
- [ ] Local GitHub OAuth app created
- [ ] `.env.local` has local GitHub credentials
- [ ] `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- [ ] `npm run dev` works
- [ ] GitHub login works at `http://localhost:3000/auth/login`

### Production Testing (Vercel)
- [ ] Production GitHub OAuth app configured with `sleep-diary-one.vercel.app`
- [ ] Vercel environment variables updated with production credentials
- [ ] `NEXTAUTH_URL=https://sleep-diary-one.vercel.app` in Vercel
- [ ] Redeployed after environment variable changes
- [ ] GitHub login works at `https://sleep-diary-one.vercel.app/auth/login`

---

## Why This Works

✅ **Stable URLs**: Using `sleep-diary-one.vercel.app` means the OAuth callback URL never changes
✅ **Separate Environments**: Different OAuth apps for local vs production prevents conflicts
✅ **Explicit NEXTAUTH_URL**: Tells NextAuth exactly which URL to use for callbacks

---

## Quick Fix Commands

If login still doesn't work after setup:

1. **Verify Vercel environment variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Confirm all OAuth variables are set for Production

2. **Force redeploy**:
   ```bash
   git commit --allow-empty -m "Force redeploy for OAuth config"
   git push origin main
   ```

3. **Check Vercel logs**:
   - Go to Vercel Dashboard → Deployments → Click latest deployment
   - Click "Functions" tab to see runtime logs
   - Look for OAuth errors

---

## Common Issues

### "redirect_uri mismatch"
- **Cause**: OAuth app callback URL doesn't match NEXTAUTH_URL
- **Fix**: Ensure callback URL is exactly `https://sleep-diary-one.vercel.app/api/auth/callback/github`

### Login works locally but not on Vercel
- **Cause**: Using local OAuth credentials on Vercel
- **Fix**: Create separate production OAuth app and update Vercel env vars

### Changes don't take effect
- **Cause**: Vercel caches environment variables
- **Fix**: Redeploy after changing environment variables
