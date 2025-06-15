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
import { useStrainPrices } from '@/hooks/useStrainPrices';
import { useToast } from '@/hooks/use-toast';

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

  // Batch price logic
  const [batchPriceState, setBatchPriceState] = useState<{nowPrice: number, wasPrice?: number | null} | null>(null);
  const { addPricePoint } = useStrainPrices('DUMMY'); // dummy to expose .addPricePoint

  const { toast } = useToast();

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

  const handleBatchPrice = useCallback(async (nowPrice: number, wasPrice?: number | null) => {
    if (!selectedStrains.length) return;
    let errors = 0;
    for (let strainId of selectedStrains) {
      try {
        await addPricePoint.call({ strainId }, { nowPrice, wasPrice }); // Need correct context for each
      } catch (e) {
        errors++;
      }
    }
    if (errors === 0) {
      toast({ title: "Batch price updated for all strains.", variant: "default" });
    } else {
      toast({ title: "Some strains failed to update price.", variant: "destructive" });
    }
    clearSelection();
  }, [selectedStrains, addPricePoint, clearSelection, toast]);

  // Filter strains for customer view
  const displayStrains = user ? filteredStrains : filteredStrains.filter(strain => strain.inStock);
  const inStockCount = strains.filter(strain => strain.inStock).length;
  const hasResults = displayStrains.length > 0;

  // Loading skeleton
  if (isLoading && strains.length === 0) {
    return (
      <div className="space-y-3 pb-20">
        {/* Search skeleton */}
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        
        {/* Filters skeleton */}
        <div className="flex gap-2">
          <div className="w-28 h-8 bg-muted rounded animate-pulse" />
          <div className="w-32 h-8 bg-muted rounded animate-pulse" />
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
    <div className="space-y-3 pb-20">
      <SmartOmnibar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onStrainGenerated={handleStrainGenerated}
        hasResults={hasResults}
      />

      <div className="flex items-center justify-between">
        <FilterControls
          filterType={filterType}
          sortBy={sortBy}
          onFilterChange={setFilterType}
          onSortChange={setSortBy}
        />
        
        <BrowseHeader
          user={user}
          editMode={editMode}
          onEditModeChange={setEditMode}
          inStockCount={inStockCount}
        />
      </div>

      {editMode && user && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onInStock={handleBatchInStock}
          onOutOfStock={handleBatchOutOfStock}
          onClear={clearSelection}
          loading={inventoryLoading}
          onBatchPrice={handleBatchPrice}
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
