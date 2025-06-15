
import { useCallback } from 'react';
import { useStrainStore } from '@/stores/useStrainStore';

/**
 * Enhanced Inventory Actions Hook
 * 
 * Now uses the centralized strain store for better state management
 * and optimistic updates with rollback capability.
 */
export const useInventoryActions = (includeAllStrains = false) => {
  const { 
    updateStock, 
    updateStockBatch, 
    inventoryLoading 
  } = useStrainStore(includeAllStrains);

  /**
   * Handle individual stock toggle with optimistic updates
   */
  const handleStockToggle = useCallback(async (strainId: string, currentStock: boolean) => {
    const newStockStatus = !currentStock;
    console.log(`Toggling stock for strain ${strainId}: ${currentStock} -> ${newStockStatus}`);
    
    return await updateStock(strainId, newStockStatus);
  }, [updateStock]);

  /**
   * Handle batch stock update with optimistic updates
   */
  const handleBatchStockUpdate = useCallback(async (strainIds: string[], inStock: boolean) => {
    if (strainIds.length === 0) {
      console.warn('No strains selected for batch update');
      return false;
    }
    
    console.log(`Batch updating ${strainIds.length} strains to ${inStock ? 'in stock' : 'out of stock'}`);
    return await updateStockBatch(strainIds, inStock);
  }, [updateStockBatch]);

  return {
    handleStockToggle,
    handleBatchStockUpdate,
    inventoryLoading
  };
};
