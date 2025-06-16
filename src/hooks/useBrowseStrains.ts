
import { useMemo } from 'react';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useBrowseFilters } from '@/components/BrowseStrains/hooks/useBrowseFilters';
import { useStrainSelection } from '@/components/BrowseStrains/hooks/useStrainSelection';
import { useInventoryActions } from '@/components/BrowseStrains/hooks/useInventoryActions';
import { useBulkStrainPrices } from './useBulkStrainPrices';
import { Strain } from '@/types/strain';

export const useBrowseStrains = () => {
  const { strains, isLoading, refetch } = useStrainData(false);
  const { data: pricesMap = {}, isLoading: pricesLoading } = useBulkStrainPrices();

  const {
    searchTerm,
    typeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    setSearchTerm,
    setTypeFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    clearFilters
  } = useBrowseFilters();

  const {
    selectedStrains,
    editMode,
    setEditMode,
    selectStrain,
    deselectStrain,
    selectAll,
    clearSelection,
    toggleStrain
  } = useStrainSelection();

  const {
    bulkUpdateStock,
    isUpdating
  } = useInventoryActions(selectedStrains, clearSelection, refetch);

  // Memoize filtered and sorted strains to prevent infinite re-renders
  const filteredAndSortedStrains = useMemo(() => {
    let filtered = [...strains];

    // Apply filters
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(strain =>
        strain.name.toLowerCase().includes(searchLower) ||
        strain.description?.toLowerCase().includes(searchLower) ||
        strain.effectProfiles?.some(effect => 
          effect.name.toLowerCase().includes(searchLower)
        ) ||
        strain.flavorProfiles?.some(flavor => 
          flavor.name.toLowerCase().includes(searchLower)
        )
      );
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(strain => strain.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (stockFilter && stockFilter !== 'all') {
      filtered = filtered.filter(strain => 
        stockFilter === 'in-stock' ? strain.inStock : !strain.inStock
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'type':
            aValue = a.type.toLowerCase();
            bValue = b.type.toLowerCase();
            break;
          case 'thc':
            aValue = a.thc || 0;
            bValue = b.thc || 0;
            break;
          case 'date':
            aValue = new Date(a.scannedAt);
            bValue = new Date(b.scannedAt);
            break;
          case 'confidence':
            aValue = a.confidence || 0;
            bValue = b.confidence || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [strains, searchTerm, typeFilter, stockFilter, sortBy, sortOrder]);

  // Memoize stats to prevent recalculation
  const stats = useMemo(() => ({
    totalStrains: strains.length,
    filteredStrains: filteredAndSortedStrains.length,
    selectedCount: selectedStrains.length,
    inStockCount: strains.filter(s => s.inStock).length,
    outOfStockCount: strains.filter(s => !s.inStock).length
  }), [strains.length, filteredAndSortedStrains.length, selectedStrains.length, strains]);

  return {
    // Data
    strains: filteredAndSortedStrains,
    totalStrains: stats.totalStrains,
    isLoading,
    pricesMap,
    pricesLoading,
    
    // Stats
    stats,
    
    // Filters
    searchTerm,
    typeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    setSearchTerm,
    setTypeFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    
    // Selection
    selectedStrains,
    editMode,
    setEditMode,
    selectStrain,
    deselectStrain,
    selectAll: () => selectAll(filteredAndSortedStrains),
    clearSelection,
    toggleStrain,
    
    // Actions
    bulkUpdateStock,
    isUpdating,
    refetch
  };
};
