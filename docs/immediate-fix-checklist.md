
# Immediate Fix Checklist for Hook Issues

## 🚨 Critical Fixes Needed Now

### 1. StrainGrid Hook Issue
- [ ] Move `useStrainPrices` hook calls out of map function
- [ ] Create bulk price fetching hook
- [ ] Update StrainCard to receive prices as props

### 2. Error Boundary Implementation
- [ ] Create `StrainErrorBoundary` component
- [ ] Wrap StrainGrid with error boundary
- [ ] Add fallback UI for crashes

### 3. Auth State Cleanup
- [ ] Ensure consistent hook calls in Index.tsx
- [ ] Add loading state guards
- [ ] Implement proper cleanup in useEffect

## 🔧 Implementation Files to Create/Modify

### New Files Needed
1. `src/components/ErrorBoundaries/StrainErrorBoundary.tsx`
2. `src/hooks/useBulkStrainPrices.ts`
3. `src/components/BrowseStrains/components/SafeStrainGrid.tsx`

### Files to Modify
1. `src/components/BrowseStrains/components/StrainGrid.tsx`
2. `src/components/BrowseStrains/StrainCard.tsx`
3. `src/components/BrowseStrains/index.tsx`

## 🎯 Success Criteria
- ✅ No more "Rendered more/fewer hooks" errors
- ✅ Smooth stock status updates
- ✅ Stable authentication transitions
- ✅ Graceful error handling with user-friendly messages

## ⚡ Quick Test Cases
1. Toggle multiple strains in/out of stock rapidly
2. Login/logout while on browse page
3. Filter strains while toggling stock status
4. Switch tabs during stock updates

Each test should pass without crashes or blank screens.
