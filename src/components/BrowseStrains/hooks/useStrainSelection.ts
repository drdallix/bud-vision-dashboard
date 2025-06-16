
import { useState, useCallback } from 'react';
import { Strain } from '@/types/strain';

export const useStrainSelection = (strains: Strain[] = []) => {
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);

  const toggleSelection = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  const selectAll = useCallback(() => {
    const allStrainIds = strains.map(strain => strain.id);
    setSelectedStrains(allStrainIds);
  }, [strains]);

  const clearSelection = useCallback(() => {
    setSelectedStrains([]);
  }, []);

  const isAllSelected = strains.length > 0 && selectedStrains.length === strains.length;

  return {
    selectedStrains,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    handleStrainSelect: toggleSelection
  };
};
