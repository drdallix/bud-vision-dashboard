
import { useStrainStore } from './useStrainStore';
import { useRealtimeStrains } from '@/hooks/useRealtimeStrains';

/**
 * Enhanced Strain Store with Real-time Updates
 * 
 * Now configured for shared database model where all users can see all strains
 * and authenticated users can modify any strain.
 */
export const useRealtimeStrainStore = (includeAllStrains = true) => {
  // Always include all strains in the shared database model
  useRealtimeStrains(true);
  
  // Return the base strain store functionality configured for all strains
  return useStrainStore(true);
};
