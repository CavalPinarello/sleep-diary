# Sleep Diary App - Team Collaboration Workflow

## Git Workflow Rules

### Branch Strategy
We use a feature branch workflow to prevent conflicts:

1. **Main Branch (`main`)**: Protected branch, contains production-ready code
2. **Development Branch (`develop`)**: Integration branch for features
3. **Feature Branches**: Individual work branches

### Branch Naming Convention
- Feature: `feature/your-name/feature-description`
- Bugfix: `bugfix/your-name/issue-description`
- Hotfix: `hotfix/your-name/critical-fix`

Example: `feature/martin/google-auth-setup`

## Daily Workflow

### Before Starting Work
```bash
# Always pull latest changes
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-name/what-you-are-working-on
```

### While Working
```bash
# Commit frequently with clear messages
git add .
git commit -m "feat: add login button component"

# Push to your branch regularly
git push origin feature/your-name/what-you-are-working-on
```

### When Ready to Merge
1. Push your latest changes
2. Create a Pull Request (PR) on GitHub
3. Request review from team members
4. After approval, merge to `develop`

## Team Member Responsibilities

### Code Areas (To prevent conflicts)
- **Member 1**: Authentication & User Management
  - `/src/app/(auth)`
  - `/src/components/auth`
  - `/src/lib/auth`

- **Member 2**: Sleep Diary Features
  - `/src/app/(diary)`
  - `/src/components/diary`
  - `/src/lib/diary`

- **Member 3**: UI Components & Styling
  - `/src/components/ui`
  - `/src/styles`
  - Global layouts

## Communication Rules

1. **Before starting work**: Check team chat/GitHub issues
2. **When creating a PR**: Tag team members for review
3. **If changing shared files**: Notify team immediately
4. **Daily standup**: Share what you're working on

## Shared Files Protocol

For files that multiple people need to edit:
- `package.json`: Coordinate installations in team chat
- `globals.css`: Create separate CSS modules when possible
- `.env.local`: Use `.env.example` and share changes

## Conflict Resolution

If you encounter a merge conflict:
1. Don't panic!
2. Pull the latest `develop` branch
3. Resolve conflicts locally
4. Test thoroughly
5. If unsure, ask for help

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout your-feature-branch
git merge develop
# Resolve conflicts, then:
git add .
git commit -m "fix: resolve merge conflicts with develop"
git push origin your-feature-branch
```

## Environment Variables

Never commit `.env.local`. Instead:
1. Update `.env.example` with new variables (without values)
2. Share actual values via secure team channel
3. Each team member updates their local `.env.local`

## Testing Before Merge

Before creating a PR:
- [ ] Run `npm run build` - must pass
- [ ] Run `npm run lint` - must pass
- [ ] Test your feature manually
- [ ] Check for console errors

## Project Structure

```
sleep-diary/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (diary)/       # Diary feature pages
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── auth/          # Auth components
│   │   └── diary/         # Diary components
│   └── lib/
│       ├── auth/          # Auth utilities
│       ├── diary/         # Diary utilities
│       └── utils.ts       # Shared utilities
├── public/                # Static assets
└── ...config files
```

## Quick Commands Reference

```bash
# See your current branch
git branch

# See all branches (including remote)
git branch -a

# Switch branches
git checkout branch-name

# Update your branch with latest changes
git pull origin branch-name

# See what files you've changed
git status

# See actual changes in files
git diff

# Stash changes temporarily
git stash
git stash pop  # to restore

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

## Getting Started Checklist

- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add environment variables from team
- [ ] Create your feature branch
- [ ] Start coding!

## Questions?

Contact the team lead or post in the team chat. We're here to help!