
import { useState, useMemo } from 'react';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';
import { useStrainPrices } from '@/hooks/useStrainPrices';

const PRESET_PRICES = [30,40,50,60,80,100,120,200,300];

// Helper to get the lowest price for a strain, or Infinity if no price
export function getLowestPrice(prices: {nowPrice: number}[] | undefined): number {
  if (!prices?.length) return Infinity;
  return prices.reduce((min, cur) => Math.min(min, cur.nowPrice), Infinity);
}

export const useBrowseFilters = (strains: Strain[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  // Map from strainId -> [PricePoints]. Memoized for performance.
  const priceMap = useMemo(() => {
    let obj: Record<string, { nowPrice: number }[]> = {};
    for (const s of strains) {
      const res = useStrainPrices(s.id);
      obj[s.id] = res.prices?.map(({ nowPrice }) => ({ nowPrice })) || [];
    }
    return obj;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strains.map(s => s.id).join(',')]); // Re-run if strain set changes

  const filteredAndSortedStrains = useMemo(() => {
    let filtered = strains
      .filter(strain => {
        const effectNames = strain.effectProfiles.map(e => e.name);
        const flavorNames = strain.flavorProfiles.map(f => f.name);
        const matchesSearch = strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            effectNames.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
            flavorNames.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || strain.type === filterType;
        let matchesPrice = true;
        if (priceFilter) {
          const prices = priceMap?.[strain.id] || [];
          matchesPrice = prices.some(p => Number(p.nowPrice) === Number(priceFilter));
        }
        return matchesSearch && matchesType && matchesPrice;
      });

    filtered.sort((a, b) => {
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
        case 'price-asc':
        case 'price-desc': {
          // Sort by lowest price for each strain, fallback Infinity for those with no price
          const aMin = getLowestPrice(priceMap[a.id]);
          const bMin = getLowestPrice(priceMap[b.id]);
          if (sortBy === 'price-asc') return aMin - bMin;
          else return bMin - aMin;
        }
        default:
          return 0;
      }
    });
    return filtered;
  }, [strains, searchTerm, filterType, sortBy, priceFilter, priceMap]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    priceFilter,
    setPriceFilter,
    filteredStrains: filteredAndSortedStrains
  };
};
