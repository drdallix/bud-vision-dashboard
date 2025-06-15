
# DoobieDB Theming System Guide

## Current Theme Architecture

### Theme Provider Setup
- Uses shadcn/ui's theme provider with dark/light/system modes
- Default theme is set to "dark" in App.tsx
- Theme state is stored in localStorage with key "cannabis-app-theme"

### CSS Variables System
The project uses CSS custom properties (variables) defined in `src/index.css`:

```css
:root {
  /* Light theme variables */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}

.dark {
  /* Dark theme variables */
  --background: 142 84% 4%;
  --foreground: 210 40% 98%;
  /* ... other variables */
}
```

### Tailwind Integration
- Variables are consumed via `hsl(var(--variable-name))` in Tailwind config
- Custom cannabis-themed colors are defined as utilities

## Current Issues Identified

### 1. Incomplete Dark Theme Variables
- Missing `--card` definition in dark theme (line break issue)
- Some variables may not have proper fallbacks

### 2. Theme Application Problems
- Components may be using hardcoded colors instead of theme variables
- Inconsistent use of theme-aware classes

### 3. Cannabis-Specific Theming
- Custom cannabis colors are defined but not fully integrated
- Missing theme-aware variants for brand colors

## Components Affected
- StrainShowcase components (recently refactored)
- Card components using hardcoded backgrounds
- Text elements not using theme-aware classes

## Recommended Solutions

### Immediate Fixes
1. Fix CSS variable definitions in index.css
2. Update components to use theme-aware classes
3. Ensure proper fallback colors

### Long-term Improvements
1. Create theme-aware utility classes
2. Implement cannabis brand color system
3. Add theme validation and testing
4. Document theming patterns for consistency

## Best Practices
- Always use theme variables via Tailwind classes
- Test both light and dark themes
- Use semantic color names (background, foreground, etc.)
- Avoid hardcoded color values in components
