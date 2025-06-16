
import { useState } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { useBrowseFilters } from './hooks/useBrowseFilters';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';
import BrowseHeader from './components/BrowseHeader';
import SearchBar from './SearchBar';
import FilterControls from './FilterControls';
import BatchActions from './BatchActions';
import SafeStrainGrid from './components/SafeStrainGrid';

const BrowseStrains = () => {
  // Use real-time enabled strain store
  const { 
    strains, 
    isLoading,
    updateStock,
    pricesMap
  } = useRealtimeStrainStore(false); // User's strains only

  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    filteredStrains
  } = useBrowseFilters(strains);

  const {
    selectedStrains,
    toggleSelection,
    clearSelection,
    selectAll,
    isAllSelected,
    handleStrainSelect
  } = useStrainSelection(filteredStrains);

  const { handleBatchStockUpdate, inventoryLoading } = useInventoryActions(false);

  const [showBatchActions, setShowBatchActions] = useState(false);

  const handleStockToggle = async (strainId: string, currentStock: boolean) => {
    console.log(`Toggling stock for strain ${strainId}: ${currentStock} -> ${!currentStock}`);
    await updateStock(strainId, !currentStock);
  };

  const handleBatchStockChange = async (inStock: boolean) => {
    if (selectedStrains.length === 0) return;
    
    const success = await handleBatchStockUpdate(selectedStrains, inStock);
    if (success) {
      clearSelection();
      setShowBatchActions(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <BrowseHeader />
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <FilterControls
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {selectedStrains.length > 0 && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onInStock={() => handleBatchStockChange(true)}
          onOutOfStock={() => handleBatchStockChange(false)}
          onClear={clearSelection}
          loading={inventoryLoading}
          onBatchPrice={async (nowPrice: number, wasPrice?: number | null) => {
            // Handle batch price update
            console.log('Batch price update:', { nowPrice, wasPrice });
          }}
        />
      )}

      <SafeStrainGrid
        strains={filteredStrains}
        editMode={true}
        selectedStrains={selectedStrains}
        user={null} // Will be properly passed from parent
        onSelect={handleStrainSelect}
        onStockToggle={handleStockToggle}
        onStrainClick={(strain) => console.log('Strain clicked:', strain)}
        inventoryLoading={inventoryLoading}
        pricesMap={pricesMap || {}}
        pricesLoading={isLoading}
      />
    </div>
  );
};

export default BrowseStrains;
