
import { useStrainStore } from './useStrainStore';
import { useRealtimeStrains } from '@/hooks/useRealtimeStrains';

/**
 * Enhanced Strain Store with Real-time Updates
 * 
 * This wrapper adds real-time functionality to the base strain store,
 * ensuring all inventory changes are instantly reflected across components.
 */
export const useRealtimeStrainStore = (includeAllStrains = false) => {
  // Set up real-time subscriptions
  useRealtimeStrains(includeAllStrains);
  
  // Return the base strain store functionality
  return useStrainStore(includeAllStrains);
};
