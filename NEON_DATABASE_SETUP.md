# Neon Database Setup for Sleep Diary

## Step 1: Create Your Neon Account

1. **Go to**: https://neon.tech
2. **Sign up** with GitHub (easiest) or email
3. **Create a new project**:
   - Name: `sleep-diary`
   - Region: Choose closest to you
   - Click "Create project"

## Step 2: Get Your Database URL

After creating the project, you'll see a connection string like:
```
postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**IMPORTANT**: Copy this entire string!

## Step 3: Update Vercel Environment Variables

1. Go to your **Vercel Dashboard**
2. Click on your **sleep-diary** project
3. Go to **Settings** → **Environment Variables**
4. Update the `DATABASE_URL` variable:
   - Replace `file:./dev.db` with your Neon connection string
5. Click **Save**

## Step 4: Initialize Your Database

Once you've added the database URL to Vercel, we need to create the tables. 

Run these commands locally with your Neon database URL:

```bash
# Set your Neon database URL (replace with your actual URL)
export DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Generate Prisma client for PostgreSQL
npx prisma generate

# Push the schema to create tables
npx prisma db push

# Optional: Open Prisma Studio to see your database
npx prisma studio
```

## Step 5: Redeploy on Vercel

After updating the environment variable:
1. Go to your Vercel project
2. Go to the **Deployments** tab
3. Click the three dots on the latest deployment
4. Click **Redeploy**
5. Click **Redeploy** again to confirm

## Your Database Schema

The app will create these tables:
- **User**: For authentication (when we enable it)
- **Account**: OAuth account links
- **Session**: User sessions
- **SleepEntry**: Your sleep diary entries

## Testing the Database

Once deployed with the database:
1. Go to your app
2. Click "Add New Sleep Entry"
3. Fill out the form
4. Submit it
5. Check if it appears in the dashboard

## Troubleshooting

### "Database connection failed"
- Make sure the DATABASE_URL is exactly as provided by Neon
- Ensure `?sslmode=require` is at the end of the URL

### "Table does not exist"
- Run `npx prisma db push` with your Neon DATABASE_URL

### "Invalid DATABASE_URL"
- The URL should start with `postgresql://` not `postgres://`
- Make sure there are no extra spaces or quotes

## Free Tier Limits

Neon's free tier includes:
- 3 GB of storage
- 1 compute hour per day (plenty for a personal app)
- Always-on availability
- Automatic backups

## Next Steps

Once your database is connected:
1. ✅ You can save real sleep entries
2. ✅ Data persists between sessions
3. ✅ Ready to add authentication back
4. ✅ Can add more features like analytics

## Quick Commands Reference

```bash
# View your database in browser
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate migrations (for production)
npx prisma migrate dev --name init
```