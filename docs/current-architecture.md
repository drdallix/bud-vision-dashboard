
# Current Architecture Analysis

## Component Hierarchy
```
App
├── Index (main page container)
├── BrowseStrains (219 lines - TOO LARGE)
│   ├── SmartOmnibar
│   ├── FilterControls
│   ├── BatchActions
│   └── StrainCard
├── StrainDashboard
│   ├── StrainHeader
│   ├── StrainVisualCard
│   ├── StrainEffectsVisual
│   ├── StrainFlavorsVisual
│   ├── StrainTerpenes
│   └── StrainCannabinoids
└── Layout Components
```

## Data Flow Issues
1. **Type Conversions**: Database → UI conversions happen in multiple places
2. **State Management**: Mixed local state and global state patterns
3. **Props Drilling**: Complex prop passing through component tree
4. **Business Logic**: Scattered across components instead of centralized

## File Organization Issues
1. **Mixed Concerns**: UI, business logic, and data handling in same files
2. **Inconsistent Structure**: Some components in folders, others standalone
3. **Re-export Files**: Unnecessary indirection with index.ts re-exports
4. **Utility Scattered**: Helper functions spread across multiple files

## Priority Refactoring Targets
1. `src/components/BrowseStrains/index.tsx` (219 lines)
2. `src/utils/strainConverters.ts` (complex type handling)
3. `src/hooks/useBrowseStrains.ts` (data fetching complexity)
4. Component prop interfaces (inconsistent patterns)
