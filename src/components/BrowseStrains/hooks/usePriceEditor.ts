
import { usePriceStore } from '@/stores/usePriceStore';

/**
 * Enhanced Price Editor Hook
 * 
 * Now uses the centralized price store for better state management,
 * optimistic updates, and batch operations.
 */
export function usePriceEditor(strainId: string) {
  const { 
    addPrice: addPriceOperation,
    updatePrice: updatePriceOperation,
    deletePrice: deletePriceOperation,
    isLoading 
  } = usePriceStore();

  /**
   * Add price with optimistic update
   */
  const addPrice = async (nowPrice: number, wasPrice?: number | null) => {
    console.log(`Adding price for strain ${strainId}: $${nowPrice}${wasPrice ? ` (was $${wasPrice})` : ''}`);
    return await addPriceOperation(strainId, nowPrice, wasPrice);
  };

  /**
   * Update price with optimistic update
   */
  const updatePrice = async (id: string, nowPrice: number, wasPrice?: number | null) => {
    console.log(`Updating price ${id} for strain ${strainId}: $${nowPrice}${wasPrice ? ` (was $${wasPrice})` : ''}`);
    return await updatePriceOperation(id, strainId, nowPrice, wasPrice);
  };

  /**
   * Delete price with optimistic update
   */
  const deletePrice = async (id: string) => {
    console.log(`Deleting price ${id} for strain ${strainId}`);
    return await deletePriceOperation(id, strainId);
  };

  return { 
    addPrice, 
    updatePrice, 
    deletePrice, 
    loading: isLoading 
  };
}
