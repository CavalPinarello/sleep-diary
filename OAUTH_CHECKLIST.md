# Google OAuth Setup Checklist

## Your Current Credentials
```
GOOGLE_CLIENT_ID=[Your Client ID from Google Console]
GOOGLE_CLIENT_SECRET=[Your Client Secret from Google Console]
```

## Step-by-Step Verification

### 1. Go to Google Cloud Console
Open: https://console.cloud.google.com

### 2. Select Your Project
Make sure you're in the correct project (top left dropdown)

### 3. Check OAuth Consent Screen
Go to: **APIs & Services** → **OAuth consent screen**

Verify these settings:
- [ ] User Type: **External**
- [ ] Publishing status: **Testing** (NOT Production)
- [ ] App name: Sleep Diary (or your app name)
- [ ] User support email: Your email
- [ ] Developer contact: Your email
- [ ] Authorized domains: **LEAVE EMPTY**
- [ ] Test users: **Add your email address**

### 4. Verify OAuth Credentials
Go to: **APIs & Services** → **Credentials**

Click on your OAuth 2.0 Client ID and verify:

**Application type:** Web application

**EXACT URLs to add (copy and paste these):**

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

⚠️ **IMPORTANT**: 
- Remove ALL other URLs (no Vercel URLs for now)
- Make sure there are NO trailing slashes
- Make sure it's `http` not `https` for localhost

### 5. Double-Check Client Secret
1. In the OAuth 2.0 Client ID page
2. Look for "Client secret"
3. Verify it matches what's in your `.env.local` file
4. If not, click "SHOW" and copy the correct one

### 6. Enable Required APIs
Go to: **APIs & Services** → **Enabled APIs**

Make sure these are enabled:
- [ ] Google+ API (or Google Identity Service)
- [ ] Google OAuth2 API

If not enabled, click "+ ENABLE APIS AND SERVICES" and search for them.

## Common Fixes

### If you see "invalid_client" error:
1. **Wrong Client Secret**: Re-copy the client secret from Google Console
2. **Mismatched URLs**: Ensure the redirect URI is EXACTLY: `http://localhost:3000/api/auth/callback/google`
3. **OAuth not in Testing mode**: Set to Testing mode, not Production

### Quick Test After Fixing:
```bash
# Restart the dev server
npm run dev

# Open in browser
open http://localhost:3000

# Click "Continue with Google"
```

## If Still Not Working

Try creating a NEW OAuth client:
1. Go to **Credentials**
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Web application"
4. Name it: "Sleep Diary Local Dev"
5. Add ONLY these URLs:
   - JavaScript origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the new Client ID and Secret
7. Update your `.env.local` file
8. Restart the dev server