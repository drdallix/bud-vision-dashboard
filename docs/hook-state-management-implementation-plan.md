
# Hook State Management Implementation Plan

## Phase 1: Immediate Fixes (Critical)

### 1.1 Fix Conditional Hook Calls
**Priority**: CRITICAL
**Timeline**: Immediate

#### Current Problem
```typescript
// ❌ WRONG: Hook called inside map
{strains.map((strain) => {
  const { prices } = useStrainPrices(strain.id);
  return <StrainCard ... />
})}
```

#### Solution
```typescript
// ✅ CORRECT: Move hooks to parent component
const StrainGrid = ({ strains }) => {
  // Pre-fetch all prices at component level
  const strainPrices = useBulkStrainPrices(strains.map(s => s.id));
  
  return strains.map((strain) => (
    <StrainCard 
      strain={strain} 
      prices={strainPrices[strain.id] || []}
    />
  ));
};
```

### 1.2 Add Error Boundaries
**Priority**: HIGH
**Timeline**: Immediate

Create React Error Boundaries to catch hook-related crashes and provide fallback UI.

## Phase 2: State Architecture Refactor (Short-term)

### 2.1 Centralized State Management
**Priority**: HIGH
**Timeline**: 1-2 days

#### Create Unified State Store
```typescript
// Central store for all strain-related state
const useStrainStore = () => {
  const [strains, setStrains] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Centralized actions
  const updateStrainStock = (strainId, inStock) => { ... };
  const bulkUpdateStock = (strainIds, inStock) => { ... };
  const updatePrices = (strainId, newPrices) => { ... };
  
  return { strains, prices, updateStrainStock, ... };
};
```

### 2.2 Batch Operations
**Priority**: MEDIUM
**Timeline**: 2-3 days

Replace individual API calls with batch operations:
- Bulk price fetching
- Batch stock updates
- Optimized cache invalidation

## Phase 3: Advanced State Management (Medium-term)

### 3.1 State Machine Implementation
**Priority**: MEDIUM
**Timeline**: 3-5 days

Implement proper state machines for complex flows:
```typescript
// Stock update state machine
const stockUpdateMachine = {
  idle: { UPDATE_STOCK: 'updating' },
  updating: { 
    SUCCESS: 'idle', 
    ERROR: 'error',
    REVERT: 'reverting'
  },
  error: { RETRY: 'updating', DISMISS: 'idle' },
  reverting: { SUCCESS: 'idle', ERROR: 'error' }
};
```

### 3.2 Optimistic Updates with Rollback
**Priority**: MEDIUM
**Timeline**: 2-3 days

Implement robust optimistic updates:
```typescript
const useOptimisticUpdate = (updateFn, revertFn) => {
  const [optimisticState, setOptimisticState] = useState();
  
  const update = async (newState) => {
    // Apply optimistic update
    setOptimisticState(newState);
    
    try {
      await updateFn(newState);
    } catch (error) {
      // Revert on failure
      await revertFn();
      setOptimisticState(null);
      throw error;
    }
  };
  
  return { update, optimisticState };
};
```

## Phase 4: Performance Optimization (Long-term)

### 4.1 Smart Caching Strategy
**Priority**: LOW
**Timeline**: 1 week

- Implement stale-while-revalidate patterns
- Add cache invalidation strategies
- Optimize React Query configurations

### 4.2 Component Optimization
**Priority**: LOW
**Timeline**: 3-5 days

- Implement React.memo for expensive components
- Add useMemo/useCallback for heavy computations
- Virtualize large lists

## Implementation Priority Matrix

| Task | Priority | Impact | Effort | Phase |
|------|----------|--------|--------|-------|
| Fix Conditional Hooks | CRITICAL | HIGH | LOW | 1 |
| Add Error Boundaries | HIGH | HIGH | LOW | 1 |
| Centralized State | HIGH | HIGH | MEDIUM | 2 |
| Batch Operations | MEDIUM | HIGH | MEDIUM | 2 |
| State Machines | MEDIUM | MEDIUM | HIGH | 3 |
| Optimistic Updates | MEDIUM | MEDIUM | MEDIUM | 3 |
| Caching Strategy | LOW | MEDIUM | HIGH | 4 |
| Component Optimization | LOW | LOW | MEDIUM | 4 |

## Success Metrics

### Phase 1 Success Criteria
- ✅ Zero hook-related crashes
- ✅ Stable authentication state transitions
- ✅ Graceful error handling

### Phase 2 Success Criteria
- ✅ Sub-100ms state update response times
- ✅ Consistent state across all components
- ✅ Reduced API call frequency by 60%

### Phase 3 Success Criteria
- ✅ Predictable state transitions
- ✅ Automatic error recovery
- ✅ 99% uptime during user interactions

### Phase 4 Success Criteria
- ✅ <2s initial load time
- ✅ Smooth interactions with 1000+ items
- ✅ Optimized memory usage

## Risk Assessment

### High Risk
- **Breaking existing functionality** during refactor
- **User data loss** during optimistic updates
- **Performance regression** with new architecture

### Mitigation Strategies
1. **Feature flags** for gradual rollout
2. **Comprehensive testing** at each phase
3. **Rollback plans** for each major change
4. **User session backup** before critical operations

## Next Steps

1. **Immediate**: Fix the StrainGrid conditional hook issue
2. **This week**: Implement error boundaries and centralized state
3. **Next week**: Begin batch operations and state machine implementation
4. **Month 2**: Performance optimization and advanced caching
