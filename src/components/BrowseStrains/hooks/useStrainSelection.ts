import { useState, useCallback } from 'react';

export const useStrainSelection = () => {
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);

  const toggleSelection = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  const selectAll = useCallback((strainIds: string[]) => {
    setSelectedStrains(strainIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStrains([]);
  }, []);

  return {
    selectedStrains,
    toggleSelection,
    selectAll,
    clearSelection,
    handleStrainSelect: toggleSelection
  };
};
