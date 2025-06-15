
# DoobieDB Coding Standards

## File Organization
- **Max 100 lines per component**
- **Single responsibility per file**
- **Consistent folder structure**
- **Clear naming conventions**

## Component Structure
```typescript
// 1. Imports (external, internal, types)
// 2. Interface definitions
// 3. Component implementation
// 4. Export

interface ComponentProps {
  // Clear, documented props
}

const Component = ({ prop1, prop2 }: ComponentProps) => {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Event handlers
  // 5. Render logic
};
```

## Naming Conventions
- **Components**: PascalCase (`StrainCard`)
- **Hooks**: camelCase starting with 'use' (`useStrainData`)
- **Types**: PascalCase (`StrainData`)
- **Files**: Match component name
- **Folders**: kebab-case for multi-word (`strain-dashboard`)

## State Management
- **Local state**: Component-specific UI state
- **Custom hooks**: Reusable business logic
- **Context**: Truly global state only
- **No prop drilling**: Use composition patterns

## Error Handling
- **Consistent patterns** across components
- **User-friendly messages**
- **Graceful degradation**
- **Loading states** for all async operations
