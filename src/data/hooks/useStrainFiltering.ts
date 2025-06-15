
import { useMemo } from 'react';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const useStrainFiltering = (
  strains: Strain[],
  searchTerm: string,
  filterType: string,
  sortBy: string
) => {
  const filteredAndSortedStrains = useMemo(() => {
    return strains
      .filter(strain => {
        const effectNames = strain.effectProfiles.map(e => e.name);
        const flavorNames = strain.flavorProfiles.map(f => f.name);
        const matchesSearch = strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            effectNames.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            flavorNames.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || strain.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          case 'thc': {
            const avgA = ((getDeterministicTHCRange(a.name)[0] + getDeterministicTHCRange(a.name)[1]) / 2);
            const avgB = ((getDeterministicTHCRange(b.name)[0] + getDeterministicTHCRange(b.name)[1]) / 2);
            return avgB - avgA;
          }
          case 'confidence':
            return b.confidence - a.confidence;
          default:
            return 0;
        }
      });
  }, [strains, searchTerm, filterType, sortBy]);

  return filteredAndSortedStrains;
};
