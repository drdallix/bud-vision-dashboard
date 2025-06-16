
import { useState, useCallback, useMemo } from 'react';
import { Strain } from '@/types/strain';

export const useStrainSelection = (filteredStrains: Strain[]) => {
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);

  const toggleSelection = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  const selectAll = useCallback(() => {
    const allStrainIds = filteredStrains.map(strain => strain.id);
    setSelectedStrains(allStrainIds);
  }, [filteredStrains]);

  const clearSelection = useCallback(() => {
    setSelectedStrains([]);
  }, []);

  const isAllSelected = useMemo(() => {
    return filteredStrains.length > 0 && selectedStrains.length === filteredStrains.length;
  }, [selectedStrains.length, filteredStrains.length]);

  return {
    selectedStrains,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    handleStrainSelect: toggleSelection
  };
};
