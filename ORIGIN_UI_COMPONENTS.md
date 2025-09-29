# Origin UI Components Documentation

## Overview
This project now uses Origin UI components, which provide a comprehensive set of beautiful, accessible UI components built with Tailwind CSS and React. Origin UI is an extension of shadcn/ui with additional components and improved styling.

## Available Components

### Basic Components
- **Button** (`@/components/ui/button`) - Various button styles and sizes
- **Input** (`@/components/ui/input`) - Form input fields
- **Label** (`@/components/ui/label`) - Form labels
- **Badge** (`@/components/ui/badge`) - Status badges and tags
- **Avatar** (`@/components/ui/avatar`) - User profile pictures

### Layout Components
- **Card** (`@/components/ui/card`) - Content containers
- **Accordion** (`@/components/ui/accordion`) - Collapsible content sections
- **Breadcrumb** (`@/components/ui/breadcrumb`) - Navigation breadcrumbs
- **Tabs** (`@/components/ui/tabs`) - Tab navigation
- **Timeline** (`@/components/ui/timeline`) - Chronological content display

### Form Components
- **Checkbox** (`@/components/ui/checkbox`) - Checkbox inputs
- **Radio Group** (`@/components/ui/radio-group`) - Radio button groups
- **Select** (`@/components/ui/select`) - Dropdown selectors
- **Switch** (`@/components/ui/switch`) - Toggle switches
- **Slider** (`@/components/ui/slider`) - Range sliders
- **Textarea** (`@/components/ui/textarea`) - Multi-line text inputs

### Navigation Components
- **Navigation Menu** (`@/components/ui/navigation-menu`) - Main navigation
- **Dropdown Menu** (`@/components/ui/dropdown-menu`) - Context menus
- **Pagination** (`@/components/ui/pagination`) - Page navigation

### Feedback Components
- **Alert Dialog** (`@/components/ui/alert-dialog`) - Confirmation dialogs
- **Dialog** (`@/components/ui/dialog`) - Modal dialogs
- **Toast** (`@/components/ui/toast`) - Notification toasts
- **Progress** (`@/components/ui/progress`) - Progress indicators
- **Hover Card** (`@/components/ui/hover-card`) - Hover tooltips
- **Tooltip** (`@/components/ui/tooltip`) - Interactive tooltips

### Advanced Components
- **Calendar** (`@/components/ui/calendar`) - Date picker calendar
- **Command** (`@/components/ui/command`) - Command palette
- **Popover** (`@/components/ui/popover`) - Floating content
- **Scroll Area** (`@/components/ui/scroll-area`) - Custom scrollbars
- **Table** (`@/components/ui/table`) - Data tables
- **Toggle** (`@/components/ui/toggle`) - Toggle buttons
- **Toggle Group** (`@/components/ui/toggle-group`) - Toggle button groups
- **Tree** (`@/components/ui/tree`) - Hierarchical data display
- **Stepper** (`@/components/ui/stepper`) - Multi-step processes

## Usage Examples

### Button Component
```tsx
import { Button } from "@/components/ui/button"

// Basic button
<Button>Click me</Button>

// Button variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Menu</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">⚙️</Button>
```

### Input Component
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

### Card Component
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Sleep Entry</CardTitle>
    <CardDescription>Record your sleep data</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

## Theming
Origin UI components use CSS variables for theming. The colors are defined in `src/app/globals.css`:

- `--primary` - Primary brand color
- `--secondary` - Secondary color
- `--accent` - Accent color
- `--destructive` - Error/danger color
- `--muted` - Muted text color
- `--border` - Border color

## Team Guidelines

### 1. **Component Consistency**
Always use Origin UI components instead of creating custom ones from scratch.

### 2. **Import Pattern**
Always import components from `@/components/ui/[component-name]`:
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
```

### 3. **Styling**
- Use the built-in variants first before adding custom styles
- If custom styling is needed, use the `className` prop with Tailwind classes
- Follow the existing design tokens in `globals.css`

### 4. **Accessibility**
Origin UI components are built with accessibility in mind. Always:
- Use semantic HTML elements
- Include proper ARIA labels
- Maintain keyboard navigation
- Ensure color contrast compliance

### 5. **File Organization**
When working on UI components:
- Keep component logic in `/src/components/ui/`
- Create feature-specific components in `/src/components/[feature]/`
- Import UI components in feature components

## Development Notes

### Adding New Components
If you need a component that's not available:
1. Check if Origin UI has it in their registry
2. Copy from Origin UI's official repository
3. Update import paths to match our project structure
4. Test thoroughly
5. Update this documentation

### Customization
To customize a component:
1. Copy the component from `@/components/ui/`
2. Rename it (e.g., `CustomButton`)
3. Make your modifications
4. Document the changes

## Resources
- [Origin UI Website](https://originui.com)
- [Origin UI GitHub](https://github.com/origin-space/originui)
- [Radix UI Primitives](https://radix-ui.com/primitives) (underlying components)
- [Tailwind CSS](https://tailwindcss.com) (styling framework)