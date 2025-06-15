
import { useCallback } from 'react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { useBrowseStrains } from '@/hooks/useBrowseStrains';

export const useInventoryActions = () => {
  const { updateStockStatus, batchUpdateStock, loading: inventoryLoading } = useInventoryManagement();
  const { updateStrainInCache } = useBrowseStrains('', 'all', 'recent');

  const handleStockToggle = useCallback(async (strainId: string, currentStock: boolean) => {
    updateStrainInCache(strainId, { inStock: !currentStock });
    
    const success = await updateStockStatus(strainId, !currentStock);
    if (!success) {
      updateStrainInCache(strainId, { inStock: currentStock });
    }
  }, [updateStockStatus, updateStrainInCache]);

  const handleBatchStockUpdate = useCallback(async (strainIds: string[], inStock: boolean) => {
    if (strainIds.length === 0) return false;
    
    strainIds.forEach(strainId => {
      updateStrainInCache(strainId, { inStock });
    });
    
    const success = await batchUpdateStock(strainIds, inStock);
    return success;
  }, [batchUpdateStock, updateStrainInCache]);

  return {
    handleStockToggle,
    handleBatchStockUpdate,
    inventoryLoading
  };
};
