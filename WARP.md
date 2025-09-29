# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sleep Diary is a Next.js 15 application with TypeScript that helps users track their sleep patterns using Google authentication. It uses Prisma with SQLite for data persistence, shadcn/ui components for the UI, and NextAuth for authentication.

## Development Commands

### Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Google OAuth credentials and generate NEXTAUTH_SECRET

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Common Tasks
```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma studio              # Open Prisma Studio GUI
npx prisma db push             # Push schema changes to database
npx prisma migrate dev         # Create and apply migrations
npx prisma generate            # Regenerate Prisma Client

# Run a specific test (when tests are added)
npm test -- path/to/test.spec.ts
```

## Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Database**: SQLite (development) via Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth provider
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4 with stone color scheme
- **Forms**: React Hook Form with Zod validation

### Project Structure
```
/src
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes group
│   │   └── auth/login/      # Login page
│   ├── (diary)/             # Main app routes group
│   │   └── dashboard/       # Dashboard and diary features
│   ├── api/                 # API routes
│   │   └── auth/[...nextauth]/ # NextAuth API handler
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Home page (redirects to login)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/              # Authentication-related components
│   └── diary/             # Sleep diary components
├── lib/
│   ├── auth/
│   │   └── auth.config.ts # NextAuth configuration
│   ├── diary/             # Diary business logic
│   └── utils.ts           # Utility functions
└── generated/
    └── prisma/            # Generated Prisma client
```

### Database Schema
The app uses Prisma with these main models:
- **User**: Managed by NextAuth, stores Google OAuth data
- **Account/Session**: NextAuth authentication tables
- **SleepEntry**: Core model for sleep tracking with fields for date, bedTime, wakeTime, sleepQuality (1-10), and optional notes

### Authentication Flow
1. User lands on `/` which redirects to `/auth/login`
2. Google OAuth authentication via NextAuth
3. Session stored as JWT
4. Protected routes under `/(diary)` group
5. User data linked to sleep entries via userId

### Component System
- Uses shadcn/ui components (New York style, stone color)
- Components are in `/src/components/ui/`
- Form handling with React Hook Form
- Zod for schema validation
- Tailwind CSS for styling with CSS variables

## Environment Variables

Required environment variables (see `.env.example`):
```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=           # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=          # From Google Cloud Console
GOOGLE_CLIENT_SECRET=      # From Google Cloud Console

# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
```

## Team Collaboration

The repository follows a feature branch workflow:
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/[name]/[description]**: Individual feature branches

See `TEAM_WORKFLOW.md` for detailed Git workflow and collaboration guidelines.

## Key Files

- `prisma/schema.prisma`: Database schema definition
- `src/lib/auth/auth.config.ts`: NextAuth configuration with Google provider
- `components.json`: shadcn/ui configuration
- `TEAM_WORKFLOW.md`: Git workflow and team collaboration rules
- `FIGMA_USER_FLOW.md`: Complete UI/UX documentation for designers

## Development Tips

### Adding New Features
1. Create feature branch from develop
2. Update Prisma schema if needed
3. Run `npx prisma generate` after schema changes
4. Use existing shadcn/ui components when possible
5. Follow the established folder structure

### Working with Prisma
- Client is generated in `src/generated/prisma/`
- Always run `npx prisma generate` after schema changes
- Use `npx prisma studio` to browse database during development
- SQLite database file is at `prisma/dev.db`

### Authentication
- NextAuth handles all OAuth flow
- User session available via `useSession()` hook in client components
- Protected routes should be in `(diary)` route group
- User ID accessible in session as `session.user.id`

### UI Development
- Use shadcn/ui CLI to add new components: `npx shadcn@latest add [component]`
- Stone color scheme is configured in `components.json`
- Tailwind v4 with CSS variables for theming
- All UI components should go in `src/components/ui/`

## Important Notes

- Prisma client output is customized to `src/generated/prisma/`
- ESLint ignores generated files and Prisma directories
- The app uses Next.js Turbopack for faster development builds
- Form validation uses Zod schemas with React Hook Form