#!/bin/bash

echo "Sleep Diary Database Initialization"
echo "===================================="
echo ""
echo "Please enter your Neon DATABASE_URL:"
echo "(It should start with postgresql:// and include ?sslmode=require at the end)"
echo ""
read -p "DATABASE_URL: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "Error: No DATABASE_URL provided"
    exit 1
fi

# Export the DATABASE_URL
export DATABASE_URL="$DB_URL"

echo ""
echo "Using database: ${DB_URL:0:30}..."
echo ""

# Generate Prisma Client
echo "Step 1: Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "Error: Failed to generate Prisma Client"
    exit 1
fi

echo ""
echo "Step 2: Pushing schema to database..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "Error: Failed to push schema to database"
    exit 1
fi

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "You can now:"
echo "1. Redeploy on Vercel to use the real database"
echo "2. Run 'npx prisma studio' to view your database"
echo ""