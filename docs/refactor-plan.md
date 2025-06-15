
# DoobieDB Refactoring Plan

## Phase 1: Documentation & Analysis
- [x] Create docs structure
- [ ] Document current component responsibilities
- [ ] Map data flow and dependencies
- [ ] Identify reusable patterns

## Phase 2: Component Breakdown Strategy

### 2.1 BrowseStrains Refactor (Priority: HIGH)
**Current Issues:**
- 219-line monolithic component
- Handles search, filtering, inventory management, and UI rendering
- Complex state management with multiple concerns

**Proposed Structure:**
```
src/components/BrowseStrains/
├── index.tsx (main container - 50 lines max)
├── hooks/
│   ├── useBrowseFilters.ts
│   ├── useStrainSelection.ts
│   └── useInventoryActions.ts
├── components/
│   ├── StrainGrid.tsx
│   ├── InventoryControls.tsx
│   └── BrowseHeader.tsx
└── types.ts
```

### 2.2 StrainDashboard Refactor (Priority: MEDIUM)
**Current Issues:**
- Multiple similar components with repeated patterns
- Inconsistent prop passing
- Visual components mixed with data logic

**Proposed Structure:**
```
src/components/StrainDashboard/
├── index.tsx (layout container)
├── components/
│   ├── StrainOverview/
│   ├── StrainDetails/
│   └── StrainAnalytics/
├── hooks/
│   └── useStrainDisplay.ts
└── types.ts
```

### 2.3 Data Layer Refactor (Priority: HIGH)
**Current Issues:**
- Complex type conversions in multiple places
- Database/UI type mismatch handling scattered
- Legacy support creating confusion

**Proposed Structure:**
```
src/data/
├── types/
│   ├── database.ts (clean database types)
│   ├── ui.ts (clean UI types)
│   └── legacy.ts (legacy support)
├── converters/
│   ├── strainConverter.ts
│   └── profileConverter.ts
├── services/
│   ├── strainService.ts
│   └── inventoryService.ts
└── hooks/
    ├── useStrainData.ts
    └── useInventoryData.ts
```

## Phase 3: Implementation Order

### Step 1: Create Data Layer Foundation
1. Clean up type definitions
2. Create service layers
3. Extract data fetching logic

### Step 2: Refactor Largest Components
1. BrowseStrains breakdown
2. Create focused hooks
3. Extract reusable components

### Step 3: Standardize Patterns
1. Consistent prop patterns
2. Standardized error handling
3. Unified state management

### Step 4: Documentation & Testing
1. Component documentation
2. Hook documentation
3. Type documentation

## Success Metrics
- No component over 100 lines
- Clear separation of concerns
- Consistent patterns across codebase
- Improved developer experience
