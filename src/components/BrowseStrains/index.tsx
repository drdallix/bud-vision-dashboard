
import { useBrowseFilters } from './hooks/useBrowseFilters';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useStrainStore } from '@/stores/useStrainStore';
import { useStrainFiltering } from '@/data/hooks/useStrainFiltering';
import BrowseHeader from './components/BrowseHeader';
import StrainGrid from './components/StrainGrid';
import FilterControls from './FilterControls';
import SmartOmnibar from '@/components/SmartOmnibar';
import { Strain } from '@/types/strain';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

/**
 * Enhanced BrowseStrains Component
 * 
 * Now uses centralized state management with the new strain store.
 * All state operations are handled through the store with optimistic updates.
 * Includes comprehensive search, filtering, and AI-powered strain generation.
 * 
 * Architecture improvements:
 * - Centralized state through useStrainStore
 * - Optimistic updates with rollback
 * - Better error handling and loading states
 * - Consistent data flow patterns
 * - Integrated search and filtering UI
 */
const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  // Centralized strain state management
  const {
    strains: allStrains = [], // Provide default empty array
    pricesMap,
    isLoading,
    pricesLoading,
    addStrain
  } = useStrainStore(true); // Get all strains for browsing

  // Filter and UI state management
  const { 
    searchTerm, 
    filterType, 
    sortBy, 
    priceFilter,
    updateFilters 
  } = useBrowseFilters(allStrains);
  
  const { selectedStrains, toggleSelection, clearSelection, selectAll } = useStrainSelection();
  const { handleStockToggle, handleBatchStockUpdate, inventoryLoading } = useInventoryActions(true);

  // Apply filtering to the centralized strain data
  const filteredStrains = useStrainFiltering(allStrains, searchTerm, filterType, sortBy);

  // Handle AI strain generation
  const handleStrainGenerated = (strain: Strain) => {
    addStrain(strain);
    onStrainSelect(strain);
  };

  const hasResults = filteredStrains && filteredStrains.length > 0;

  console.log('BrowseStrains render:', {
    totalStrains: allStrains?.length || 0,
    filteredStrains: filteredStrains?.length || 0,
    selectedCount: selectedStrains.length,
    isLoading,
    pricesLoading,
    inventoryLoading,
    searchTerm,
    filterType,
    sortBy
  });

  return (
    <div className="space-y-6">
      {/* Smart Omnibar for AI-powered search and generation */}
      <SmartOmnibar
        searchTerm={searchTerm}
        onSearchChange={(term) => updateFilters({ searchTerm: term })}
        onStrainGenerated={handleStrainGenerated}
        hasResults={hasResults}
      />

      {/* Filter controls */}
      <FilterControls
        filterType={filterType}
        sortBy={sortBy}
        priceFilter={priceFilter}
        onFilterChange={(type) => updateFilters({ filterType: type })}
        onSortChange={(sort) => updateFilters({ sortBy: sort })}
        onPriceFilterChange={(price) => updateFilters({ priceFilter: price })}
      />

      {/* Browse header with selection and batch actions */}
      <BrowseHeader
        selectedCount={selectedStrains.length}
        totalCount={filteredStrains?.length || 0}
        onSelectAll={() => selectAll(filteredStrains.map(s => s.id))}
        onClearSelection={clearSelection}
        onBatchStockUpdate={handleBatchStockUpdate}
        selectedStrains={selectedStrains}
        inventoryLoading={inventoryLoading}
      />

      {/* Strain grid */}
      <StrainGrid
        strains={filteredStrains || []}
        editMode={selectedStrains.length > 0}
        selectedStrains={selectedStrains}
        onToggleStrain={toggleSelection}
        pricesMap={pricesMap || {}}
        pricesLoading={pricesLoading}
      />
    </div>
  );
};

export default BrowseStrains;
