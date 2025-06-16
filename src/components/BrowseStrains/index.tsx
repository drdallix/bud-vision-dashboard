
import { useState } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import BrowseHeader from './components/BrowseHeader';
import SafeStrainGrid from './components/SafeStrainGrid';
import SearchBar from './SearchBar';
import FilterControls from './FilterControls';
import BatchActions from './BatchActions';
import { useBrowseFilters } from './hooks/useBrowseFilters';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';
import SmartOmnibar from '@/components/SmartOmnibar';

interface BrowseStrainsProps {
  onStrainSelect?: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const { strains, isLoading } = useRealtimeStrainStore(false);
  const [editMode, setEditMode] = useState(false);
  
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
    <div className="space-y-6">
      <BrowseHeader 
        strainCount={filteredStrains.length}
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
      />
      
      <SmartOmnibar onStrainGenerated={handleStrainGenerated} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <FilterControls
            filterType={filterType}
            onFilterChange={setFilterType}
            sortBy={sortBy}
            onSortChange={setSortBy}
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
        </div>
        
        <div className="lg:col-span-3">
          <SafeStrainGrid 
            strains={filteredStrains}
            isLoading={isLoading}
            editMode={editMode}
            selectedStrains={selectedStrains}
            onStrainSelect={handleStrainSelect}
            onStockToggle={handleStockToggle}
            onStrainClick={handleStrainClick}
            inventoryLoading={inventoryLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default BrowseStrains;
