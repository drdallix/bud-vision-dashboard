
import { useState, useCallback, useMemo } from 'react';
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useBulkStrainPrices } from '@/hooks/useBulkStrainPrices';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useToast } from '@/hooks/use-toast';

/**
 * Centralized Strain Store
 * 
 * This store provides a unified interface for all strain-related state and operations.
 * It consolidates data fetching, price management, and inventory operations.
 * 
 * Benefits:
 * - Single source of truth for strain data
 * - Consistent state updates across components
 * - Optimistic updates with rollback capability
 * - Batch operations for better performance
 */
export const useStrainStore = (includeAllStrains = false) => {
  const { toast } = useToast();
  
  // Core data hooks
  const { 
    strains, 
    isLoading: strainsLoading, 
    updateStrainInCache,
    addStrainToCache,
    removeStrainFromCache,
    refetch: refetchStrains
  } = useStrainData(includeAllStrains);

  // Bulk price fetching
  const strainIds = useMemo(() => strains.map(strain => strain.id), [strains]);
  const { 
    pricesMap, 
    isLoading: pricesLoading 
  } = useBulkStrainPrices(strainIds);

  // Inventory management
  const { 
    updateStockStatus, 
    batchUpdateStock, 
    loading: inventoryLoading 
  } = useInventoryManagement();

  // Local optimistic state for immediate UI feedback
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Strain>>>({});

  /**
   * Get strain with optimistic updates applied
   */
  const getStrain = useCallback((strainId: string): Strain | undefined => {
    const baseStrain = strains.find(s => s.id === strainId);
    if (!baseStrain) return undefined;
    
    const optimisticUpdate = optimisticUpdates[strainId];
    return optimisticUpdate ? { ...baseStrain, ...optimisticUpdate } : baseStrain;
  }, [strains, optimisticUpdates]);

  /**
   * Get all strains with optimistic updates applied
   */
  const getStrainsWithUpdates = useCallback(() => {
    return strains.map(strain => {
      const optimisticUpdate = optimisticUpdates[strain.id];
      return optimisticUpdate ? { ...strain, ...optimisticUpdate } : strain;
    });
  }, [strains, optimisticUpdates]);

  /**
   * Apply optimistic update for immediate UI feedback
   */
  const applyOptimisticUpdate = useCallback((strainId: string, updates: Partial<Strain>) => {
    setOptimisticUpdates(prev => ({
      ...prev,
      [strainId]: { ...prev[strainId], ...updates }
    }));
  }, []);

  /**
   * Clear optimistic update (on success or failure)
   */
  const clearOptimisticUpdate = useCallback((strainId: string) => {
    setOptimisticUpdates(prev => {
      const { [strainId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Update stock status with optimistic updates and rollback capability
   */
  const updateStock = useCallback(async (strainId: string, inStock: boolean) => {
    const originalStrain = strains.find(s => s.id === strainId);
    if (!originalStrain) return false;

    // Apply optimistic update immediately
    applyOptimisticUpdate(strainId, { inStock });
    
    try {
      // Attempt the actual update
      const success = await updateStockStatus(strainId, inStock);
      
      if (success) {
        // Update cache and clear optimistic update on success
        updateStrainInCache(strainId, { inStock });
        clearOptimisticUpdate(strainId);
        
        console.log(`Stock updated successfully: ${originalStrain.name} -> ${inStock ? 'in stock' : 'out of stock'}`);
        return true;
      } else {
        // Revert optimistic update on failure
        clearOptimisticUpdate(strainId);
        toast({
          title: "Stock update failed",
          description: `Failed to update stock for ${originalStrain.name}`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Revert optimistic update on error
      clearOptimisticUpdate(strainId);
      console.error('Stock update error:', error);
      toast({
        title: "Stock update error",
        description: `Error updating stock for ${originalStrain.name}`,
        variant: "destructive",
      });
      return false;
    }
  }, [strains, applyOptimisticUpdate, clearOptimisticUpdate, updateStockStatus, updateStrainInCache, toast]);

  /**
   * Batch update stock status for multiple strains
   */
  const updateStockBatch = useCallback(async (strainIds: string[], inStock: boolean) => {
    if (strainIds.length === 0) return false;

    // Apply optimistic updates immediately
    strainIds.forEach(strainId => {
      applyOptimisticUpdate(strainId, { inStock });
    });

    try {
      const success = await batchUpdateStock(strainIds, inStock);
      
      if (success) {
        // Update cache and clear optimistic updates on success
        strainIds.forEach(strainId => {
          updateStrainInCache(strainId, { inStock });
          clearOptimisticUpdate(strainId);
        });
        
        console.log(`Batch stock update successful: ${strainIds.length} strains -> ${inStock ? 'in stock' : 'out of stock'}`);
        return true;
      } else {
        // Revert all optimistic updates on failure
        strainIds.forEach(clearOptimisticUpdate);
        return false;
      }
    } catch (error) {
      // Revert all optimistic updates on error
      strainIds.forEach(clearOptimisticUpdate);
      console.error('Batch stock update error:', error);
      return false;
    }
  }, [applyOptimisticUpdate, clearOptimisticUpdate, batchUpdateStock, updateStrainInCache]);

  /**
   * Get prices for a specific strain
   */
  const getStrainPrices = useCallback((strainId: string): PricePoint[] => {
    return pricesMap[strainId] || [];
  }, [pricesMap]);

  /**
   * Add new strain to the store
   */
  const addStrain = useCallback((strain: Strain) => {
    addStrainToCache(strain);
    console.log('Added strain to store:', strain.name);
  }, [addStrainToCache]);

  /**
   * Remove strain from the store
   */
  const removeStrain = useCallback((strainId: string) => {
    removeStrainFromCache(strainId);
    clearOptimisticUpdate(strainId);
    console.log('Removed strain from store:', strainId);
  }, [removeStrainFromCache, clearOptimisticUpdate]);

  // Loading states
  const isLoading = strainsLoading || pricesLoading || inventoryLoading;

  return {
    // Data
    strains: getStrainsWithUpdates(),
    rawStrains: strains, // Original strains without optimistic updates
    pricesMap,
    
    // Individual strain operations
    getStrain,
    getStrainPrices,
    updateStock,
    addStrain,
    removeStrain,
    
    // Batch operations
    updateStockBatch,
    
    // State
    isLoading,
    strainsLoading,
    pricesLoading,
    inventoryLoading,
    
    // Cache management
    refetchStrains,
    
    // Debug helpers
    optimisticUpdates, // For debugging optimistic state
  };
};
