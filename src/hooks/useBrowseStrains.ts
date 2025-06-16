
import { useMemo } from 'react';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useBrowseFilters } from '@/components/BrowseStrains/hooks/useBrowseFilters';
import { useStrainSelection } from '@/components/BrowseStrains/hooks/useStrainSelection';
import { useInventoryActions } from '@/components/BrowseStrains/hooks/useInventoryActions';
import { useBulkStrainPrices } from './useBulkStrainPrices';

export const useBrowseStrains = () => {
  const { strains, isLoading, refetch } = useStrainData(false);
  
  // Extract strain IDs for price fetching
  const strainIds = useMemo(() => strains.map(strain => strain.id), [strains]);
  const { pricesMap = {}, isLoading: pricesLoading } = useBulkStrainPrices(strainIds);

  const {
    searchTerm,
    filterType,
    sortBy,
    priceFilter,
    setSearchTerm,
    setFilterType,
    setSortBy,
    setPriceFilter,
    updateFilters,
    filteredStrains: filteredAndSortedStrains
  } = useBrowseFilters(strains);

  // Create aliases for backward compatibility
  const typeFilter = filterType;
  const stockFilter = priceFilter;
  const setTypeFilter = setFilterType;
  const setStockFilter = setPriceFilter;

  // Create sortOrder from sortBy for backward compatibility
  const sortOrder = sortBy === 'recent' ? 'desc' : 'asc';
  const setSortOrder = (order: string) => {
    // Convert sort order back to sortBy format
    if (order === 'desc') setSortBy('recent');
    else setSortBy('name');
  };

  const clearFilters = () => {
    updateFilters({
      searchTerm: '',
      filterType: 'all',
      sortBy: 'recent',
      priceFilter: null
    });
  };

  const {
    selectedStrains,
    toggleSelection,
    selectAll: selectAllStrains,
    clearSelection
  } = useStrainSelection();

  // Create editMode based on selection
  const editMode = selectedStrains.length > 0;
  const setEditMode = (mode: boolean) => {
    if (!mode) clearSelection();
  };

  const {
    handleBatchStockUpdate,
    inventoryLoading
  } = useInventoryActions();

  // Memoize stats to prevent recalculation
  const stats = useMemo(() => ({
    totalStrains: strains.length,
    filteredStrains: filteredAndSortedStrains.length,
    selectedCount: selectedStrains.length,
    inStockCount: strains.filter(s => s.inStock).length,
    outOfStockCount: strains.filter(s => !s.inStock).length
  }), [strains.length, filteredAndSortedStrains.length, selectedStrains.length, strains]);

  const selectAll = () => selectAllStrains(filteredAndSortedStrains.map(s => s.id));
  const toggleStrain = (strainId: string) => {
    const isSelected = selectedStrains.includes(strainId);
    toggleSelection(strainId, !isSelected);
  };

  const bulkUpdateStock = async (inStock: boolean) => {
    return await handleBatchStockUpdate(selectedStrains, inStock);
  };

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
    selectAll,
    clearSelection,
    toggleStrain,
    
    // Actions
    bulkUpdateStock,
    isUpdating: inventoryLoading,
    refetch
  };
};
