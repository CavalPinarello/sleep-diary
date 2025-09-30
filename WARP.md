# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sleep Diary is a Next.js 15 application for tracking sleep patterns with Google OAuth authentication. Built with TypeScript, Prisma ORM, and shadcn/ui components.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Auth**: NextAuth.js with Google OAuth provider
- **Database**: SQLite with Prisma ORM
- **UI**: shadcn/ui components (New York style, Stone theme)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Directory Structure
```
src/
├── app/
│   ├── (auth)/           # Authentication route group
│   ├── (diary)/          # Protected diary features
│   │   └── dashboard/    # Main dashboard, analytics, new entry
│   ├── globals.css       # Global styles and CSS variables
│   └── layout.tsx        # Root layout with fonts
├── components/
│   └── ui/               # shadcn/ui component library
└── lib/
    ├── auth/             # NextAuth configuration
    └── utils.ts          # Shared utilities
```

### Key Components Architecture
- **Route Groups**: `(auth)` for public routes, `(diary)` for protected routes
- **Layout Hierarchy**: Root layout → Dashboard layout → Page
- **Database Models**: User, Account, Session (NextAuth) + SleepEntry (custom)
- **Prisma Output**: Generated client in `src/generated/prisma`

## Development Commands

### Core Development
```bash
# Start development server with Turbopack
npm run dev

# Build application
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# View database in browser
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Development Workflow
```bash
# Check build before committing
npm run build

# Verify linting passes
npm run lint

# View component documentation
# Check ORIGIN_UI_COMPONENTS.md
```

## Team Collaboration Rules

### Branch Strategy
- `main`: Production-ready code (protected)
- `develop`: Integration branch
- Feature branches: `feature/name/description`

### Responsibilities by Area
- **Authentication**: `/src/app/(auth)`, `/src/lib/auth`
- **Diary Features**: `/src/app/(diary)`, diary components
- **UI Components**: `/src/components/ui`, global styling

### Before Working on UI
1. Always use shadcn/ui components from `/src/components/ui/`
2. Check `TEAM_UI_GUIDELINES.md` for component patterns
3. Use consistent import patterns: `@/components/ui/component-name`
4. Follow established variants and styling patterns

## Environment Variables

Required in `.env.local`:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Authentication Flow
- Home `/` redirects to `/auth/login`
- Google OAuth handles authentication
- Protected routes use `(diary)` route group
- Session strategy: JWT with Prisma adapter

## Database Schema
- **NextAuth tables**: Account, Session, User, VerificationToken
- **Sleep tracking**: SleepEntry with bedTime, wakeTime, sleepQuality (1-10), notes
- **Relations**: User → SleepEntry (one-to-many)

## Component Patterns

### shadcn/ui Usage
```tsx
// Always use the established import pattern
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Use consistent variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Layout Structure
- Dashboard uses persistent header with navigation
- Consistent spacing with `space-y-*` and `space-x-*`
- Responsive grid layouts with `md:grid-cols-*`

## Build Configuration
- **Turbopack**: Enabled for dev and build
- **TypeScript**: Strict mode with custom paths
- **ESLint**: Next.js + TypeScript rules
- **Tailwind**: v4 with CSS variables, Stone base color

## Troubleshooting

### Common Issues
- **Prisma client not found**: Run `npx prisma generate`
- **Import path errors**: Use `@/` prefix for src imports
- **Component styling**: Ensure proper shadcn/ui variant usage
- **Database connection**: Check DATABASE_URL in `.env.local`

### Build Failures
1. Run `npm run lint` to check for code issues
2. Ensure Prisma client is generated
3. Verify all environment variables are set
4. Check for TypeScript errors in components

## Development Resources
- **Team Guidelines**: `TEAM_UI_GUIDELINES.md`, `TEAM_WORKFLOW.md`
- **User Flow**: `FIGMA_USER_FLOW.md`
- **shadcn/ui docs**: https://ui.shadcn.com
- **Prisma docs**: https://prisma.io/docs
- **NextAuth docs**: https://next-auth.js.org