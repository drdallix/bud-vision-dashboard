
# DoobieDB Refactoring Plan

## Phase 1: Documentation & Analysis
- [x] Create docs structure
- [x] Document current component responsibilities
- [x] Map data flow and dependencies
- [x] Identify reusable patterns

## Phase 2: Component Breakdown Strategy

### 2.1 BrowseStrains Refactor (Priority: HIGH) - ✅ COMPLETED
**Previous Issues:**
- ~~219-line monolithic component~~
- ~~Handles search, filtering, inventory management, and UI rendering~~
- ~~Complex state management with multiple concerns~~

**✅ Completed Structure:**
```
src/components/BrowseStrains/
├── index.tsx (main container - 89 lines)
├── hooks/
│   ├── useBrowseFilters.ts ✅
│   ├── useStrainSelection.ts ✅
│   └── useInventoryActions.ts ✅
├── components/
│   ├── StrainGrid.tsx ✅
│   ├── BrowseHeader.tsx ✅
│   ├── InventoryControls.tsx (existing as BatchActions)
│   └── FilterControls.tsx (existing)
└── StrainCard.tsx (existing)
```

**✅ Improvements Made:**
- Separated filtering logic into `useBrowseFilters` hook
- Extracted selection management to `useStrainSelection` hook
- Moved inventory actions to `useInventoryActions` hook
- Created focused `StrainGrid` and `BrowseHeader` components
- Main component reduced from 219 to 89 lines
- Clear separation of concerns achieved

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

### ✅ Step 1: Refactor Largest Components - COMPLETED
1. ✅ BrowseStrains breakdown
2. ✅ Create focused hooks
3. ✅ Extract reusable components

### Step 2: Create Data Layer Foundation
1. Clean up type definitions
2. Create service layers
3. Extract data fetching logic

### Step 3: Refactor Remaining Components
1. StrainDashboard breakdown
2. Create focused display hooks
3. Extract reusable visualization components

### Step 4: Standardize Patterns
1. Consistent prop patterns
2. Standardized error handling
3. Unified state management

### Step 5: Documentation & Testing
1. Component documentation
2. Hook documentation
3. Type documentation

## Success Metrics
- ✅ BrowseStrains component under 100 lines (89 lines achieved)
- ✅ Clear separation of concerns in BrowseStrains
- ✅ Focused, reusable hooks created
- [ ] No component over 100 lines
- [ ] Consistent patterns across codebase
- [ ] Improved developer experience

## Next Priority: Data Layer Refactor
The next highest priority is cleaning up the data layer and type conversions to make the codebase more maintainable.
