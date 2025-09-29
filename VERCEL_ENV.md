# Vercel Environment Variables

## For Initial Testing (Without Auth)

Add these environment variables in your Vercel dashboard:

```
NEXTAUTH_URL=https://sleep-diary-one.vercel.app
NEXTAUTH_SECRET=RnwwFCHZ4rNWnR/NYp4BmoWIEHuLycx1Sj/POnza4dA=
GOOGLE_CLIENT_ID=temp
GOOGLE_CLIENT_SECRET=temp
DATABASE_URL=file:./dev.db
```

## Important Notes

1. **Current Setup**: The app is configured to bypass authentication and go straight to the dashboard
2. **Database**: Currently using SQLite (file-based) - this won't persist data in Vercel
3. **Next Steps**: Once deployed, we'll add a proper PostgreSQL database

## How to Deploy

1. Open GitHub Desktop
2. Commit and push all changes to the `develop` branch
3. In Vercel:
   - Import the repository
   - Set the environment variables above
   - Deploy!

## After Deployment

The app will be accessible at your Vercel URL without needing login. You can test:
- Dashboard view
- UI components
- Navigation

Once this works, we'll:
1. Set up a PostgreSQL database (Neon/Supabase)
2. Re-enable authentication
3. Configure proper OAuth URLs