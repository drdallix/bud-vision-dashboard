
import { useState, useCallback } from 'react';
import { PricePoint } from '@/types/price';
import { PriceService } from '@/services/priceService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Centralized Price Store
 * 
 * This store handles all price-related operations with optimistic updates,
 * batch operations, and proper error handling.
 * 
 * Features:
 * - Optimistic price updates
 * - Batch price operations
 * - Automatic cache invalidation
 * - Error recovery with rollback
 */
export const usePriceStore = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for optimistic updates
  const [optimisticPrices, setOptimisticPrices] = useState<Record<string, PricePoint[]>>({});
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());

  /**
   * Mark an operation as loading
   */
  const setLoading = useCallback((operationId: string, loading: boolean) => {
    setLoadingOperations(prev => {
      const next = new Set(prev);
      if (loading) {
        next.add(operationId);
      } else {
        next.delete(operationId);
      }
      return next;
    });
  }, []);

  /**
   * Apply optimistic price update
   */
  const applyOptimisticPriceUpdate = useCallback((strainId: string, prices: PricePoint[]) => {
    setOptimisticPrices(prev => ({
      ...prev,
      [strainId]: prices
    }));
  }, []);

  /**
   * Clear optimistic price update
   */
  const clearOptimisticPriceUpdate = useCallback((strainId: string) => {
    setOptimisticPrices(prev => {
      const { [strainId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Invalidate price cache for a strain
   */
  const invalidatePriceCache = useCallback((strainId: string) => {
    queryClient.invalidateQueries({ queryKey: ['prices', strainId] });
    queryClient.invalidateQueries({ queryKey: ['bulk-prices'] });
  }, [queryClient]);

  /**
   * Add price point with optimistic update
   */
  const addPrice = useCallback(async (
    strainId: string, 
    nowPrice: number, 
    wasPrice?: number | null
  ): Promise<boolean> => {
    const operationId = `add-${strainId}-${Date.now()}`;
    setLoading(operationId, true);
    
    try {
      // Get current prices for optimistic update
      const currentQuery = queryClient.getQueryData(['bulk-prices']) as Record<string, PricePoint[]> || {};
      const currentPrices = currentQuery[strainId] || [];
      
      // Create optimistic price point
      const optimisticPrice: PricePoint = {
        id: `temp-${Date.now()}`,
        strainId,
        nowPrice,
        wasPrice,
        createdAt: new Date().toISOString()
      };
      
      // Apply optimistic update
      const optimisticPrices = [...currentPrices, optimisticPrice];
      applyOptimisticPriceUpdate(strainId, optimisticPrices);
      
      // Perform actual operation
      const newPrice = await PriceService.addPricePoint(strainId, nowPrice, wasPrice);
      
      // Clear optimistic update and invalidate cache
      clearOptimisticPriceUpdate(strainId);
      invalidatePriceCache(strainId);
      
      toast({
        title: "Price added successfully",
        description: `Added $${nowPrice}/oz price point`,
      });
      
      console.log('Price added successfully:', newPrice);
      return true;
      
    } catch (error: any) {
      // Revert optimistic update
      clearOptimisticPriceUpdate(strainId);
      
      toast({
        title: "Failed to add price",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      
      console.error('Error adding price:', error);
      return false;
    } finally {
      setLoading(operationId, false);
    }
  }, [queryClient, applyOptimisticPriceUpdate, clearOptimisticPriceUpdate, invalidatePriceCache, toast, setLoading]);

  /**
   * Update price point with optimistic update
   */
  const updatePrice = useCallback(async (
    id: string,
    strainId: string,
    nowPrice: number,
    wasPrice?: number | null
  ): Promise<boolean> => {
    const operationId = `update-${id}-${Date.now()}`;
    setLoading(operationId, true);
    
    try {
      // Get current prices for optimistic update
      const currentQuery = queryClient.getQueryData(['bulk-prices']) as Record<string, PricePoint[]> || {};
      const currentPrices = currentQuery[strainId] || [];
      
      // Apply optimistic update
      const optimisticPrices = currentPrices.map(price => 
        price.id === id 
          ? { ...price, nowPrice, wasPrice }
          : price
      );
      applyOptimisticPriceUpdate(strainId, optimisticPrices);
      
      // Perform actual operation
      await PriceService.updatePricePoint(id, nowPrice, wasPrice);
      
      // Clear optimistic update and invalidate cache
      clearOptimisticPriceUpdate(strainId);
      invalidatePriceCache(strainId);
      
      toast({
        title: "Price updated successfully",
        description: `Updated to $${nowPrice}/oz`,
      });
      
      console.log('Price updated successfully:', id);
      return true;
      
    } catch (error: any) {
      // Revert optimistic update
      clearOptimisticPriceUpdate(strainId);
      
      toast({
        title: "Failed to update price",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      
      console.error('Error updating price:', error);
      return false;
    } finally {
      setLoading(operationId, false);
    }
  }, [queryClient, applyOptimisticPriceUpdate, clearOptimisticPriceUpdate, invalidatePriceCache, toast, setLoading]);

  /**
   * Delete price point with optimistic update
   */
  const deletePrice = useCallback(async (id: string, strainId: string): Promise<boolean> => {
    const operationId = `delete-${id}-${Date.now()}`;
    setLoading(operationId, true);
    
    try {
      // Get current prices for optimistic update
      const currentQuery = queryClient.getQueryData(['bulk-prices']) as Record<string, PricePoint[]> || {};
      const currentPrices = currentQuery[strainId] || [];
      
      // Apply optimistic update (remove the price)
      const optimisticPrices = currentPrices.filter(price => price.id !== id);
      applyOptimisticPriceUpdate(strainId, optimisticPrices);
      
      // Perform actual operation
      await PriceService.deletePricePoint(id);
      
      // Clear optimistic update and invalidate cache
      clearOptimisticPriceUpdate(strainId);
      invalidatePriceCache(strainId);
      
      toast({
        title: "Price deleted successfully",
        description: "Price point removed",
      });
      
      console.log('Price deleted successfully:', id);
      return true;
      
    } catch (error: any) {
      // Revert optimistic update
      clearOptimisticPriceUpdate(strainId);
      
      toast({
        title: "Failed to delete price",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      
      console.error('Error deleting price:', error);
      return false;
    } finally {
      setLoading(operationId, false);
    }
  }, [queryClient, applyOptimisticPriceUpdate, clearOptimisticPriceUpdate, invalidatePriceCache, toast, setLoading]);

  /**
   * Batch set prices for multiple strains
   */
  const batchSetPrices = useCallback(async (
    strainIds: string[], 
    nowPrice: number, 
    wasPrice?: number
  ): Promise<boolean> => {
    const operationId = `batch-${Date.now()}`;
    setLoading(operationId, true);
    
    try {
      await PriceService.batchSetPrices(strainIds, nowPrice, wasPrice);
      
      // Invalidate cache for all affected strains
      strainIds.forEach(strainId => {
        invalidatePriceCache(strainId);
      });
      
      toast({
        title: "Batch price update successful",
        description: `Updated prices for ${strainIds.length} strains`,
      });
      
      console.log('Batch price update successful:', strainIds.length, 'strains');
      return true;
      
    } catch (error: any) {
      toast({
        title: "Batch price update failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
      
      console.error('Batch price update error:', error);
      return false;
    } finally {
      setLoading(operationId, false);
    }
  }, [invalidatePriceCache, toast, setLoading]);

  /**
   * Delete all prices for a strain
   */
  const deleteAllPricesForStrain = useCallback(async (strainId: string): Promise<boolean> => {
    const operationId = `delete-all-${strainId}-${Date.now()}`;
    setLoading(operationId, true);
    
    try {
      // Apply optimistic update (clear all prices)
      applyOptimisticPriceUpdate(strainId, []);
      
      await PriceService.deleteAllForStrain(strainId);
      
      // Clear optimistic update and invalidate cache
      clearOptimisticPriceUpdate(strainId);
      invalidatePriceCache(strainId);
      
      console.log('All prices deleted for strain:', strainId);
      return true;
      
    } catch (error: any) {
      // Revert optimistic update
      clearOptimisticPriceUpdate(strainId);
      
      console.error('Error deleting all prices for strain:', error);
      return false;
    } finally {
      setLoading(operationId, false);
    }
  }, [applyOptimisticPriceUpdate, clearOptimisticPriceUpdate, invalidatePriceCache, setLoading]);

  /**
   * Get optimistic prices for a strain (if any)
   */
  const getOptimisticPrices = useCallback((strainId: string): PricePoint[] | null => {
    return optimisticPrices[strainId] || null;
  }, [optimisticPrices]);

  /**
   * Check if any operation is loading
   */
  const isLoading = loadingOperations.size > 0;

  return {
    // Operations
    addPrice,
    updatePrice,
    deletePrice,
    batchSetPrices,
    deleteAllPricesForStrain,
    
    // State
    isLoading,
    getOptimisticPrices,
    
    // Debug helpers
    loadingOperations: Array.from(loadingOperations),
    optimisticPrices,
  };
};
