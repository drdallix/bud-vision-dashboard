
import { useState, useCallback } from 'react';

export const useStrainSelection = () => {
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);

  const handleStrainSelect = useCallback((strainId: string, checked: boolean) => {
    setSelectedStrains(prev => 
      checked 
        ? [...prev, strainId]
        : prev.filter(id => id !== strainId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStrains([]);
  }, []);

  return {
    selectedStrains,
    handleStrainSelect,
    clearSelection
  };
};
