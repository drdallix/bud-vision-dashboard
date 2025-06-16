
import { useStrainData } from '@/data/hooks/useStrainData';
import { useStrainFiltering } from '@/data/hooks/useStrainFiltering';

export const useBrowseStrains = (searchTerm: string, filterType: string, sortBy: string) => {
  const { 
    strains: allStrains, 
    isLoading, 
    error, 
    updateStrainInCache 
  } = useStrainData(true); // Get all strains for browsing

  const filteredStrains = useStrainFiltering(allStrains, searchTerm, filterType, sortBy);

  return {
    strains: filteredStrains,
    allStrains,
    isLoading,
    error,
    updateStrainInCache,
  };
};
