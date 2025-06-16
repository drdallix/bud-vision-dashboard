
import { useState, useCallback } from 'react';
import { Strain } from '@/types/strain';

export const useStrainSelection = (filteredStrains: Strain[]) => {
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);

  const toggleSelection = useCallback((strainId: string, checked: boolean) => {
    console.log('Toggling selection for strain:', strainId, checked);
    setSelectedStrains(prev => {
      if (checked) {
        return [...prev, strainId];
      } else {
        return prev.filter(id => id !== strainId);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    console.log('Clearing all selections');
    setSelectedStrains([]);
  }, []);

  const selectAll = useCallback(() => {
    const allSelected = selectedStrains.length === filteredStrains.length;
    console.log('Select all toggled:', !allSelected);
    
    if (allSelected) {
      setSelectedStrains([]);
    } else {
      setSelectedStrains(filteredStrains.map(strain => strain.id));
    }
  }, [selectedStrains.length, filteredStrains]);

  const isAllSelected = selectedStrains.length > 0 && selectedStrains.length === filteredStrains.length;

  // This handles the multi-select checkbox clicks
  const handleStrainSelect = useCallback((strainId: string, checked: boolean) => {
    toggleSelection(strainId, checked);
  }, [toggleSelection]);

  return {
    selectedStrains,
    toggleSelection,
    clearSelection,
    selectAll,
    isAllSelected,
    handleStrainSelect
  };
};
