
import { useBrowseFilters } from './hooks/useBrowseFilters';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useStrainStore } from '@/stores/useStrainStore';
import { useStrainFiltering } from '@/data/hooks/useStrainFiltering';
import BrowseHeader from './components/BrowseHeader';
import StrainGrid from './components/StrainGrid';
import { Strain } from '@/types/strain';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

/**
 * Enhanced BrowseStrains Component
 * 
 * Now uses centralized state management with the new strain store.
 * All state operations are handled through the store with optimistic updates.
 * 
 * Architecture improvements:
 * - Centralized state through useStrainStore
 * - Optimistic updates with rollback
 * - Better error handling and loading states
 * - Consistent data flow patterns
 */
const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  // Centralized strain state management
  const {
    strains: allStrains,
    pricesMap,
    isLoading,
    pricesLoading
  } = useStrainStore(true); // Get all strains for browsing

  // Filter and UI state management
  const { searchTerm, filterType, sortBy, updateFilters } = useBrowseFilters();
  const { selectedStrains, toggleSelection, clearSelection, selectAll } = useStrainSelection();
  const { handleStockToggle, handleBatchStockUpdate, inventoryLoading } = useInventoryActions(true);

  // Apply filtering to the centralized strain data
  const filteredStrains = useStrainFiltering(allStrains, searchTerm, filterType, sortBy);

  console.log('BrowseStrains render:', {
    totalStrains: allStrains.length,
    filteredStrains: filteredStrains.length,
    selectedCount: selectedStrains.length,
    isLoading,
    pricesLoading,
    inventoryLoading
  });

  return (
    <div className="space-y-6">
      <BrowseHeader
        searchTerm={searchTerm}
        filterType={filterType}
        sortBy={sortBy}
        selectedCount={selectedStrains.length}
        totalCount={filteredStrains.length}
        onFiltersChange={updateFilters}
        onSelectAll={() => selectAll(filteredStrains.map(s => s.id))}
        onClearSelection={clearSelection}
        onBatchStockUpdate={handleBatchStockUpdate}
        selectedStrains={selectedStrains}
        inventoryLoading={inventoryLoading}
      />

      <StrainGrid
        strains={filteredStrains}
        editMode={selectedStrains.length > 0}
        selectedStrains={selectedStrains}
        user={null} // Will be populated by auth context
        onSelect={toggleSelection}
        onStockToggle={handleStockToggle}
        onStrainClick={onStrainSelect}
        inventoryLoading={inventoryLoading}
        pricesMap={pricesMap}
        pricesLoading={pricesLoading}
      />
    </div>
  );
};

export default BrowseStrains;
