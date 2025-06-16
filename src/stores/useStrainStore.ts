
import { useCallback, useMemo } from 'react';
import { Strain } from '@/types/strain';
import { PricePoint } from '@/types/price';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useBulkStrainPrices } from '@/hooks/useBulkStrainPrices';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useToast } from '@/hooks/use-toast';

/**
 * Centralized Strain Store with Real-time Support
 * 
 * This store provides a unified interface for all strain-related state and operations.
 * Real-time updates are handled by the useRealtimeStrains hook, so no optimistic updates needed.
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

  /**
   * Get strain by ID
   */
  const getStrain = useCallback((strainId: string): Strain | undefined => {
    return strains.find(s => s.id === strainId);
  }, [strains]);

  /**
   * Update stock status - real-time will handle UI updates
   */
  const updateStock = useCallback(async (strainId: string, inStock: boolean) => {
    const strain = strains.find(s => s.id === strainId);
    if (!strain) return false;

    console.log(`Updating stock for ${strain.name}: ${strain.inStock} -> ${inStock}`);
    
    try {
      const success = await updateStockStatus(strainId, inStock);
      
      if (success) {
        console.log(`Stock updated successfully: ${strain.name} -> ${inStock ? 'in stock' : 'out of stock'}`);
        // Real-time subscription will update UI automatically
        return true;
      } else {
        toast({
          title: "Stock update failed",
          description: `Failed to update stock for ${strain.name}`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Stock update error:', error);
      toast({
        title: "Stock update error",
        description: `Error updating stock for ${strain.name}`,
        variant: "destructive",
      });
      return false;
    }
  }, [strains, updateStockStatus, toast]);

  /**
   * Batch update stock status for multiple strains
   */
  const updateStockBatch = useCallback(async (strainIds: string[], inStock: boolean) => {
    if (strainIds.length === 0) return false;

    try {
      const success = await batchUpdateStock(strainIds, inStock);
      
      if (success) {
        console.log(`Batch stock update successful: ${strainIds.length} strains -> ${inStock ? 'in stock' : 'out of stock'}`);
        // Real-time subscription will update UI automatically
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Batch stock update error:', error);
      return false;
    }
  }, [batchUpdateStock]);

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
    console.log('Removed strain from store:', strainId);
  }, [removeStrainFromCache]);

  // Loading states
  const isLoading = strainsLoading || pricesLoading || inventoryLoading;

  return {
    // Data
    strains,
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
    updateStrainInCache,
  };
};
