
import React, { memo } from 'react';
import BrowseHeader from './BrowseStrains/components/BrowseHeader';
import FilterControls from './BrowseStrains/FilterControls';
import { SafeStrainGrid } from './BrowseStrains/components/SafeStrainGrid';
import BatchActions from './BrowseStrains/BatchActions';
import SmartOmnibar from '@/components/SmartOmnibar';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';

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

  // Wrapper function to match expected signature
  const handleBatchStockUpdate = async (strainIds: string[], inStock: boolean) => {
    return await bulkUpdateStock(inStock);
  };

  // Handle AI strain generation
  const handleStrainGenerated = (strain: Strain) => {
    // For now, just clear the search term - could be enhanced to handle the generated strain
    setSearchTerm('');
  };

  const hasResults = strains && strains.length > 0;

  return (
    <div className="space-y-6">
      {/* Smart Omnibar for AI-powered search and generation */}
      <SmartOmnibar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStrainGenerated={handleStrainGenerated}
        hasResults={hasResults}
      />

      <BrowseHeader 
        selectedCount={selectedStrains.length}
        totalCount={stats.filteredStrains}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBatchStockUpdate={handleBatchStockUpdate}
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
