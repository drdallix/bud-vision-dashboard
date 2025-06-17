import { useState } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import BrowseHeader from './components/BrowseHeader';
import SafeStrainGrid from './components/SafeStrainGrid';
import BatchActions from './BatchActions';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useAdvancedFilters } from './hooks/useAdvancedFilters';
import SmartOmnibar from '@/components/SmartOmnibar';
import MobileFilters from './MobileFilters';
import { Skeleton } from '@/components/ui/skeleton';

interface BrowseStrainsProps {
  onStrainSelect?: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const { strains, isLoading, isRefreshing } = useRealtimeStrainStore(false);
  const [editMode, setEditMode] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
    selectedEffects,
    selectedFlavors,
    thcRange,
    setThcRange,
    handleEffectToggle,
    handleFlavorToggle,
    filteredStrains,
    clearAllFilters,
    hasActiveFilters
  } = useAdvancedFilters(strains);
  
  const {
    selectedStrains,
    clearSelection,
    selectAll,
    isAllSelected,
    handleStrainSelect
  } = useStrainSelection(filteredStrains);
  
  const { handleStockToggle, handleBatchStockUpdate, inventoryLoading } = useInventoryActions();

  const handleStrainGenerated = (strain: Strain) => {
    console.log('Strain generated in BrowseStrains:', strain.name);
    if (onStrainSelect) {
      onStrainSelect(strain);
    }
  };

  const handleStrainClick = (strain: Strain) => {
    console.log('Strain clicked in BrowseStrains:', strain.name);
    if (onStrainSelect) {
      onStrainSelect(strain);
    }
  };

  // Show skeleton loading during refresh for seamless UX
  if (isRefreshing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-11 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BrowseHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
        selectedCount={selectedStrains.length}
        onClearSelection={clearSelection}
        showMobileFilters={showMobileFilters}
        onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
        strains={strains}
      />
      
      <SmartOmnibar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStrainGenerated={handleStrainGenerated}
        hasResults={filteredStrains.length > 0}
      />
      
      <MobileFilters
        strains={strains}
        filterType={filterType}
        sortBy={sortBy}
        selectedEffects={selectedEffects}
        selectedFlavors={selectedFlavors}
        thcRange={thcRange}
        stockFilter={stockFilter}
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
        onEffectToggle={handleEffectToggle}
        onFlavorToggle={handleFlavorToggle}
        onThcRangeChange={setThcRange}
        onStockFilterChange={setStockFilter}
        onClearAll={clearAllFilters}
      />
      
      {editMode && selectedStrains.length > 0 && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onClearSelection={clearSelection}
          onSelectAll={selectAll}
          isAllSelected={isAllSelected}
          onBatchStockUpdate={handleBatchStockUpdate}
          selectedStrainIds={selectedStrains}
        />
      )}
      
      <SafeStrainGrid 
        strains={filteredStrains}
        editMode={editMode}
        selectedStrains={selectedStrains}
        onStrainSelect={handleStrainSelect}
        onStockToggle={handleStockToggle}
        onStrainClick={handleStrainClick}
        inventoryLoading={inventoryLoading}
      />
    </div>
  );
};

export default BrowseStrains;