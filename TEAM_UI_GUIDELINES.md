# Team UI Development Guidelines

## Origin UI Integration for Sleep Diary App

This document outlines how our team should use Origin UI components to maintain consistency and efficiency across the Sleep Diary application.

## Quick Start for Team Members

### Before You Start Working on UI
1. **Read the component documentation**: Check `ORIGIN_UI_COMPONENTS.md`
2. **Check existing implementations**: See how components are already used
3. **Follow the team workflow**: Create your feature branch as outlined in `TEAM_WORKFLOW.md`

### When Creating New UI Features
1. **Always use Origin UI components first** - Don't create custom components unless absolutely necessary
2. **Check if the component exists** - Review the available components in `ORIGIN_UI_COMPONENTS.md`
3. **Follow consistent patterns** - Use the same import and usage patterns as existing code

## Team Member Responsibilities

### UI Components & Styling (Christophe)
- ✅ **Maintain Origin UI components** in `/src/components/ui/`
- ✅ **Update component documentation** when adding new components
- ✅ **Review UI-related pull requests** from other team members
- ✅ **Ensure design consistency** across the app
- ✅ **Manage global styles** in `globals.css`

### Authentication & User Management (Member 1)
- 🎯 **Use Origin UI forms components** (Input, Label, Button, Card) for login/signup
- 🎯 **Follow authentication UI patterns** established in the app
- 🎯 **Use consistent error handling** with Toast components
- 🎯 **Implement proper loading states** with Progress components

### Sleep Diary Features (Member 2)
- 🎯 **Use Origin UI data components** (Card, Badge, Calendar, Timeline)
- 🎯 **Follow form patterns** with Input, Select, Checkbox components
- 🎯 **Use consistent data visualization** components
- 🎯 **Implement proper navigation** with Breadcrumb components

## Consistent Usage Patterns

### 1. Form Components
**DO THIS:**
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SleepEntryForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sleep Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bedtime">Bedtime</Label>
            <Input id="bedtime" type="time" />
          </div>
          <Button type="submit">Save Entry</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**DON'T DO THIS:**
```tsx
// ❌ Don't create custom input components
export function CustomInput() {
  return <input className="custom-styles" />
}

// ❌ Don't use plain HTML without Origin UI
export function PlainForm() {
  return (
    <form>
      <input type="text" />
      <button>Submit</button>
    </form>
  )
}
```

### 2. Navigation Components
**DO THIS:**
```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

export function NavigationExample() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Sleep Entries</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="ghost">Back</Button>
    </>
  )
}
```

### 3. Data Display Components
**DO THIS:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function SleepStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Quality</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant="outline">7.5 hours</Badge>
          <Progress value={75} />
        </div>
      </CardContent>
    </Card>
  )
}
```

## Design Tokens & Consistency

### Color Usage
Use these semantic colors consistently:
- **Primary**: Main app actions, CTAs
- **Secondary**: Supporting elements
- **Destructive**: Errors, delete actions
- **Muted**: Supporting text, disabled states

### Component Variants
Always use the built-in variants:
```tsx
// Buttons
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>

// Badges
<Badge variant="default">Status</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Info</Badge>
```

### Spacing & Layout
Use consistent spacing with Tailwind classes:
```tsx
<div className="space-y-4">  {/* Vertical spacing */}
<div className="space-x-2">  {/* Horizontal spacing */}
<div className="p-4">        {/* Padding */}
<div className="m-2">        {/* Margin */}
```

## Code Review Guidelines

### For UI Components & Styling (Christophe)
When reviewing PRs, check for:
- ✅ Consistent use of Origin UI components
- ✅ Proper import patterns
- ✅ Correct variant usage
- ✅ Accessibility compliance
- ✅ Design consistency

### For Other Team Members
Before submitting PRs:
- ✅ Ensure you're using Origin UI components
- ✅ Test your UI components in both light and dark modes
- ✅ Check accessibility with keyboard navigation
- ✅ Verify responsive design works
- ✅ Add Christophe as a reviewer for UI-heavy changes

## Communication Protocol

### When Working on UI
1. **Before starting**: Post in team chat about what UI components you'll need
2. **If you need a new component**: Ask Christophe to add it from Origin UI
3. **If you're unsure about styling**: Share screenshots for feedback
4. **When you find a bug**: Report it with component name and expected behavior

### Daily Standups
Mention:
- What UI components you worked with
- Any styling challenges you encountered
- Components you'll need for upcoming work

## Troubleshooting Common Issues

### Component Import Errors
```tsx
// ❌ Wrong
import { Button } from "components/ui/button"

// ✅ Correct
import { Button } from "@/components/ui/button"
```

### Styling Not Working
1. Check if you're using the correct variant
2. Ensure you have the right CSS classes
3. Verify your component is wrapped properly
4. Check `globals.css` for theme variables

### Component Not Found
1. Check if the component exists in `/src/components/ui/`
2. Verify the component name in `ORIGIN_UI_COMPONENTS.md`
3. Ask Christophe to add it if it's missing

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Check for lint errors
npm run lint

# Build the project (should work without errors)
npm run build

# Check component imports
grep -r "from.*@/components/ui" src/
```

## Resources for Team
- 📖 **Component docs**: `ORIGIN_UI_COMPONENTS.md`
- 🔧 **Team workflow**: `TEAM_WORKFLOW.md` 
- 🎨 **Origin UI website**: https://originui.com
- 🛠️ **Tailwind docs**: https://tailwindcss.com/docs

## Questions?
- **UI/Styling questions**: Ask Christophe
- **Component usage**: Check documentation or team chat
- **Design decisions**: Discuss in team meetings

---
*Last updated: [Date] by Christophe*
*Remember: Consistency is key to a professional-looking app!* 🚀