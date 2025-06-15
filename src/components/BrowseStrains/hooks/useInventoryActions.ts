
import { useCallback } from 'react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';

export const useInventoryActions = () => {
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();
  const { updateStrainInCache } = useBrowseStrains('', 'all', 'recent');

  const handleStockToggle = useCallback(async (strainId: string, currentStock: boolean) => {
    const newStockStatus = !currentStock;
    
    // Immediately update the cache for instant UI feedback
    updateStrainInCache(strainId, { inStock: newStockStatus });
    
    // Attempt the actual update in the background
    const success = await updateStockStatus(strainId, newStockStatus);
    
    if (!success) {
      // Revert on failure
      updateStrainInCache(strainId, { inStock: currentStock });
    }
  }, [updateStockStatus, updateStrainInCache]);

  const handleBatchStockUpdate = useCallback(async (strainIds: string[], inStock: boolean) => {
    if (strainIds.length === 0) return false;
    
    // Optimistically update all selected strains
    strainIds.forEach(strainId => {
      updateStrainInCache(strainId, { inStock });
    });
    
    const success = await batchUpdateStock(strainIds, inStock);
    
    if (!success) {
      // Revert all on failure
      strainIds.forEach(strainId => {
        updateStrainInCache(strainId, { inStock: !inStock });
      });
    }
    
    return success;
  }, [batchUpdateStock, updateStrainInCache]);

  return {
    handleStockToggle,
    handleBatchStockUpdate,
    inventoryLoading
  };
};
