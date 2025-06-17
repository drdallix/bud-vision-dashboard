import { useStrainStore } from './useStrainStore';
import { useRealtimeStrains } from '@/hooks/useRealtimeStrains';
import { useState, useCallback } from 'react';

/**
 * Enhanced Strain Store with Real-time Updates and UI State Management
 * 
 * This wrapper adds real-time functionality to the base strain store,
 * ensuring all inventory changes are instantly reflected across components
 * with seamless loading states.
 */
export const useRealtimeStrainStore = (includeAllStrains = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Set up real-time subscriptions with refresh callback
  useRealtimeStrains(includeAllStrains, setIsRefreshing);
  
  // Get the base strain store functionality
  const storeData = useStrainStore(includeAllStrains);
  
  // Enhanced refresh function that shows loading state
  const refreshWithLoading = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await storeData.refetchStrains();
    } finally {
      // Keep loading state for a brief moment to show feedback
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [storeData.refetchStrains]);
  
  return {
    ...storeData,
    isRefreshing,
    refreshWithLoading,
    // Combined loading state for seamless UX
    isLoading: storeData.isLoading || isRefreshing
  };
};