
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

interface BrowseStrainsProps {
  onStrainSelect?: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const { strains, isLoading } = useRealtimeStrainStore(false);
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
