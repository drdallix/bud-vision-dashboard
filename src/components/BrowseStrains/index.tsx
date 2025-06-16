
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
    updateStock
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
    toggleStrainSelection,
    clearSelection,
    selectAll,
    isAllSelected
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
      <BrowseHeader strainCount={filteredStrains.length} />
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
        <FilterControls
          filterType={filterType}
          setFilterType={setFilterType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {selectedStrains.length > 0 && (
        <BatchActions
          selectedCount={selectedStrains.length}
          totalCount={filteredStrains.length}
          onClearSelection={clearSelection}
          onSelectAll={selectAll}
          isAllSelected={isAllSelected}
          onBatchStockUpdate={handleBatchStockChange}
          isLoading={inventoryLoading}
          showBatchActions={showBatchActions}
          setShowBatchActions={setShowBatchActions}
        />
      )}

      <SafeStrainGrid
        strains={filteredStrains}
        isLoading={isLoading}
        selectedStrains={selectedStrains}
        onToggleSelection={toggleStrainSelection}
        onStockToggle={handleStockToggle}
      />
    </div>
  );
};

export default BrowseStrains;
