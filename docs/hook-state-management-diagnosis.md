
# Hook State Management Diagnosis

## Current Issues

### 1. Conditional Hook Calls
The primary issue causing "Rendered more/fewer hooks than expected" errors is **conditional hook calls** in components, particularly in `StrainGrid.tsx`:

```typescript
// PROBLEMATIC: Hook called inside map/conditional rendering
{strains.map((strain) => {
  const { prices } = useStrainPrices(strain.id); // ❌ Hook called conditionally
  return <StrainCard ... />
})}
```

### 2. Root Cause Analysis
- **React's Rules of Hooks**: Hooks must be called in the same order every render
- **Dynamic Lists**: When strain lists change (add/remove items), hook call count changes
- **Authentication State Changes**: User login/logout triggers re-renders with different component trees
- **Optimistic Updates**: Stock status changes cause immediate UI updates that can desync hook calls

### 3. Specific Trigger Points
1. **Stock Toggle**: When marking strains in/out of stock
2. **User Authentication**: Login/logout state changes
3. **List Filtering**: Search/filter operations that change visible items
4. **Component Mounting/Unmounting**: Tab switches, route changes

## Impact Assessment

### Immediate Issues
- Application crashes with blank screen
- Inconsistent state management
- Poor user experience during state transitions

### Long-term Risks
- Unpredictable behavior during scaling
- Difficult debugging and maintenance
- State corruption in complex user flows

## Technical Debt Analysis

### Architecture Problems
1. **Tight Coupling**: Components directly calling hooks for individual items
2. **No Centralized State**: Multiple components managing overlapping state
3. **Inconsistent Patterns**: Different state management approaches across components
4. **Missing Error Boundaries**: No fallback for hook-related crashes

### Performance Issues
1. **Over-fetching**: Individual price queries for each strain
2. **Unnecessary Re-renders**: State changes trigger widespread re-rendering
3. **Memory Leaks**: Uncleared subscriptions and timers
