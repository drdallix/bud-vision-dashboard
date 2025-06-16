
import React, { memo } from 'react';
import BrowseHeader from './BrowseStrains/components/BrowseHeader';
import FilterControls from './BrowseStrains/FilterControls';
import { SafeStrainGrid } from './BrowseStrains/components/SafeStrainGrid';
import BatchActions from './BrowseStrains/BatchActions';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';

const BrowseStrains = memo(() => {
  const {
    strains,
    totalStrains,
    isLoading,
    pricesMap,
    pricesLoading,
    stats,
    searchTerm,
    typeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    setSearchTerm,
    setTypeFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    selectedStrains,
    editMode,
    setEditMode,
    selectAll,
    clearSelection,
    toggleStrain,
    bulkUpdateStock,
    isUpdating
  } = useBrowseStrains();

  if (process.env.NODE_ENV === 'development') {
    if (isLoading !== undefined && totalStrains > 0) {
      console.log(`BrowseStrains: Loaded ${totalStrains} strains, filtered to ${stats.filteredStrains}`);
    }
  }

  return (
    <div className="space-y-6">
      <BrowseHeader 
        selectedCount={selectedStrains.length}
        totalCount={stats.filteredStrains}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBatchStockUpdate={bulkUpdateStock}
        selectedStrains={selectedStrains}
        inventoryLoading={isUpdating}
      />
      
      <FilterControls
        filterType={typeFilter}
        sortBy={sortBy}
        priceFilter={stockFilter}
        onFilterChange={setTypeFilter}
        onSortChange={setSortBy}
        onPriceFilterChange={setStockFilter}
      />

      {editMode && selectedStrains.length > 0 && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onInStock={() => bulkUpdateStock(true)}
          onOutOfStock={() => bulkUpdateStock(false)}
          onClear={clearSelection}
          loading={isUpdating}
          onBatchPrice={async () => {}} // Placeholder for batch price functionality
        />
      )}

      <SafeStrainGrid
        strains={strains}
        selectedStrains={selectedStrains}
        editMode={editMode}
        pricesMap={pricesMap}
        pricesLoading={pricesLoading}
        onToggleStrain={toggleStrain}
      />
    </div>
  );
});

BrowseStrains.displayName = 'BrowseStrains';

export default BrowseStrains;
