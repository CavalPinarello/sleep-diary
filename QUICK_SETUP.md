# Sleep Diary - Quick Setup Guide

## Your Vercel Domain
```
https://sleep-diary-ed1cbk7uy-cavalapps-gmailcoms-projects.vercel.app
```

## 1. Google OAuth Configuration

### Go to Google Cloud Console and set these EXACT URLs:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://sleep-diary-ed1cbk7uy-cavalapps-gmailcoms-projects.vercel.app
```

**Authorized redirect URIs:** (⚠️ MUST BE EXACT - Copy/Paste these!)
```
http://localhost:3000/api/auth/callback/google
https://sleep-diary-ed1cbk7uy-cavalapps-gmailcoms-projects.vercel.app/api/auth/callback/google
```

## 2. Your Environment Variables

### Local Development (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=RnwwFCHZ4rNWnR/NYp4BmoWIEHuLycx1Sj/POnza4dA=
GOOGLE_CLIENT_ID=[paste from Google Console]
GOOGLE_CLIENT_SECRET=[paste from Google Console]
DATABASE_URL=file:./dev.db
```

### Production (Vercel Dashboard)
```
NEXTAUTH_URL=https://sleep-diary-ed1cbk7uy-cavalapps-gmailcoms-projects.vercel.app
NEXTAUTH_SECRET=RnwwFCHZ4rNWnR/NYp4BmoWIEHuLycx1Sj/POnza4dA=
GOOGLE_CLIENT_ID=[paste from Google Console]
GOOGLE_CLIENT_SECRET=[paste from Google Console]
DATABASE_URL=[your PostgreSQL connection string from Neon/Supabase]
```

## 3. Quick Commands

### Push to GitHub
```bash
# Authenticate with GitHub (one time)
gh auth login

# Push your code
git push origin develop
```

### Local Development (with SQLite)
```bash
# Set up local database
npm run db:generate:local
npm run db:push:local

# Start development server
npm run dev
```

### Production Database Setup (after getting Neon URL)
```bash
# Set the production database URL
export DATABASE_URL="postgresql://..."

# Initialize production database
npx prisma generate
npx prisma db push
```

## 4. Testing Checklist

- [ ] Google OAuth Client ID created
- [ ] Google OAuth Client Secret saved
- [ ] Redirect URIs added to Google Console (copy exact URLs above)
- [ ] Neon/Supabase database created
- [ ] Environment variables set in Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] OAuth login works locally
- [ ] OAuth login works in production

## 5. Troubleshooting

### "Redirect URI mismatch" error
- Copy the EXACT redirect URI from the error message
- Add it to Google Console (must include `/api/auth/callback/google`)
- Wait 5 minutes for changes to propagate

### Database connection errors
- For PostgreSQL, ensure `?sslmode=require` is at the end of your DATABASE_URL
- Example: `postgresql://user:pass@host/db?sslmode=require`

### Build fails on Vercel
- Make sure Build Command is: `prisma generate && next build`
- Check that all environment variables are set

## Your Next Steps

1. **Set up Google OAuth** - Add the URLs above to Google Console
2. **Create Neon Database** - Sign up at neon.tech (free)
3. **Push to GitHub** - Use `gh auth login` then `git push`
4. **Configure Vercel** - Add all environment variables
5. **Test Login** - Try OAuth in production

## Important Links

- Your Vercel App: https://sleep-diary-ed1cbk7uy-cavalapps-gmailcoms-projects.vercel.app
- Google Console: https://console.cloud.google.com
- Neon (Database): https://neon.tech
- Vercel Dashboard: https://vercel.com/dashboard