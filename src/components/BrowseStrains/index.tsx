
import { useState, useCallback } from 'react';
import { Search, Eye, Edit3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';
import { Strain } from '@/types/strain';
import SearchBar from './SearchBar';
import FilterControls from './FilterControls';
import BatchActions from './BatchActions';
import StrainCard from './StrainCard';

interface BrowseStrainsProps {
  onStrainSelect: (strain: Strain) => void;
}

const BrowseStrains = ({ onStrainSelect }: BrowseStrainsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [editMode, setEditMode] = useState(false);
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();
  
  // Use the optimized hook
  const { strains, isLoading, updateStrainInCache } = useBrowseStrains(searchTerm, filterType, sortBy);

  const handleStockToggle = useCallback(async (strainId: string, currentStock: boolean) => {
    // Optimistic update
    updateStrainInCache(strainId, { inStock: !currentStock });
    
    const success = await updateStockStatus(strainId, !currentStock);
    if (!success) {
      // Revert on failure
      updateStrainInCache(strainId, { inStock: currentStock });
    }
  }, [updateStockStatus, updateStrainInCache]);

  const handleBatchStockUpdate = useCallback(async (inStock: boolean) => {
    if (selectedStrains.length === 0) return;
    
    // Optimistic updates
    selectedStrains.forEach(strainId => {
      updateStrainInCache(strainId, { inStock });
    });
    
    const success = await batchUpdateStock(selectedStrains, inStock);
    if (success) {
      setSelectedStrains([]);
    }
  }, [selectedStrains, batchUpdateStock, updateStrainInCache]);

  const handleStrainSelect = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  // Show skeleton loading only on first load, not on navigation
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
      {/* Omnibar Search */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Header with mode toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Browse Strains</h2>
          <p className="text-muted-foreground text-sm">
            {editMode ? 'Manage inventory and stock status' : 'Explore available cannabis strains'}
          </p>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Switch
              checked={editMode}
              onCheckedChange={setEditMode}
              aria-label="Toggle edit mode"
            />
            <Edit3 className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Filters */}
      <FilterControls
        filterType={filterType}
        sortBy={sortBy}
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
      />

      {/* Batch actions for edit mode */}
      {editMode && (
        <BatchActions
          selectedCount={selectedStrains.length}
          onInStock={() => handleBatchStockUpdate(true)}
          onOutOfStock={() => handleBatchStockUpdate(false)}
          onClear={() => setSelectedStrains([])}
          loading={inventoryLoading}
        />
      )}

      {/* Strain Grid */}
      <div className="grid grid-cols-1 gap-4">
        {strains.map((strain) => (
          <StrainCard
            key={strain.id}
            strain={strain}
            editMode={editMode}
            isSelected={selectedStrains.includes(strain.id)}
            canEdit={user !== null && strain.userId === user.id}
            onSelect={handleStrainSelect}
            onStockToggle={handleStockToggle}
            onStrainClick={onStrainSelect}
            inventoryLoading={inventoryLoading}
          />
        ))}
      </div>

      {strains.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrowseStrains;
