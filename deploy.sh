#!/bin/bash

echo "🚀 Deploying Sleep Diary to Vercel..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables first."
    echo "Copy from .env.example and fill in your values."
    exit 1
fi

# Load environment variables for local validation
source .env.local

# Validate required environment variables
required_vars=("NEXTAUTH_SECRET" "GITHUB_ID" "GITHUB_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env.local"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build the application locally first to check for errors
echo "🔨 Building application locally..."
npm run build:local

if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Set up your production database (PostgreSQL)"
    echo "2. Configure environment variables in Vercel dashboard"
    echo "3. Update OAuth app URLs to match your Vercel domain"
    echo "4. Run database migrations on production"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Deployment failed"
    exit 1
fi