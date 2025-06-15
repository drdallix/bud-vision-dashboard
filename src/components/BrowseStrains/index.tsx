
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';
import SmartOmnibar from '@/components/SmartOmnibar';
import FilterControls from './FilterControls';
import BatchActions from './BatchActions';
import BrowseHeader from './components/BrowseHeader';
import StrainGrid from './components/StrainGrid';
import { useBrowseFilters } from './hooks/useBrowseFilters';
import { useStrainSelection } from './hooks/useStrainSelection';
import { useInventoryActions } from './hooks/useInventoryActions';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();
  
  // Data fetching
  const { strains, isLoading } = useBrowseStrains('', 'all', 'recent');
  
  // Filtering and sorting
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    filteredStrains
  } = useBrowseFilters(strains);
  
  // Selection management
  const { selectedStrains, handleStrainSelect, clearSelection } = useStrainSelection();
  
  // Inventory actions
  const { handleStockToggle, handleBatchStockUpdate, inventoryLoading } = useInventoryActions();

  const handleStrainGenerated = useCallback((strain: Strain) => {
    onStrainSelect(strain);
  }, [onStrainSelect]);

  const handleBatchInStock = useCallback(async () => {
    const success = await handleBatchStockUpdate(selectedStrains, true);
    if (success) clearSelection();
  }, [selectedStrains, handleBatchStockUpdate, clearSelection]);

  const handleBatchOutOfStock = useCallback(async () => {
    const success = await handleBatchStockUpdate(selectedStrains, false);
    if (success) clearSelection();
  }, [selectedStrains, handleBatchStockUpdate, clearSelection]);

  // Filter strains for customer view
  const displayStrains = user ? filteredStrains : filteredStrains.filter(strain => strain.inStock);
  const inStockCount = strains.filter(strain => strain.inStock).length;
  const hasResults = displayStrains.length > 0;

  // Loading skeleton
  if (isLoading && strains.length === 0) {
    return (
      <div className="space-y-4 pb-20">
        {/* Search skeleton */}
        <div className="relative">
          <div className="h-12 bg-muted rounded-full animate-pulse" />
        </div>
        
        {/* Filters skeleton */}
        <div className="flex gap-3">
          <div className="w-36 h-10 bg-muted rounded animate-pulse" />
          <div className="w-40 h-10 bg-muted rounded animate-pulse" />
        </div>
        
        {/* Strain cards skeleton */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <SmartOmnibar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStrainGenerated={handleStrainGenerated}
        hasResults={hasResults}
      />

      <BrowseHeader
        user={user}
        editMode={editMode}
        onEditModeChange={setEditMode}
        inStockCount={inStockCount}
      />

      <FilterControls
        filterType={filterType}
        sortBy={sortBy}
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
      />

      {editMode && user && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onInStock={handleBatchInStock}
          onOutOfStock={handleBatchOutOfStock}
          onClear={clearSelection}
          loading={inventoryLoading}
        />
      )}

      <StrainGrid
        strains={displayStrains}
        editMode={editMode}
        selectedStrains={selectedStrains}
        user={user}
        onSelect={handleStrainSelect}
        onStockToggle={handleStockToggle}
        onStrainClick={onStrainSelect}
        inventoryLoading={inventoryLoading}
      />

      {displayStrains.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {user ? 'No Results Found' : 'No Strains Available'}
            </h3>
            <p className="text-muted-foreground">
              {user 
                ? 'Try adjusting your search terms or filters.'
                : 'Check back later for updated inventory.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrowseStrains;
