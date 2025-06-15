
import { useState, useMemo } from 'react';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

const PRESET_PRICES = [30,40,50,60,80,100,120,200,300];

// Helper to get the lowest price for a strain, or Infinity if no price
export function getLowestPrice(prices: {nowPrice: number}[] | undefined): number {
  if (!prices?.length) return Infinity;
  return prices.reduce((min, cur) => Math.min(min, cur.nowPrice), Infinity);
}

export const useBrowseFilters = (strains: Strain[] = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  // Only filter by search, type, etc. Don't call hooks in here!
  const filteredAndSortedStrains = useMemo(() => {
    // Guard against undefined or null strains array
    if (!strains || !Array.isArray(strains)) {
      return [];
    }

    let filtered = strains
      .filter(strain => {
        const effectNames = strain.effectProfiles?.map(e => e.name) || [];
        const flavorNames = strain.flavorProfiles?.map(f => f.name) || [];
        const matchesSearch = strain.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            effectNames.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
            flavorNames.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || strain.type === filterType;
        return matchesSearch && matchesType;
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
        default:
          return 0;
      }
    });
    return filtered;
  }, [strains, searchTerm, filterType, sortBy]);

  const updateFilters = (updates: {
    searchTerm?: string;
    filterType?: string;
    sortBy?: string;
    priceFilter?: string | null;
  }) => {
    if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
    if (updates.filterType !== undefined) setFilterType(updates.filterType);
    if (updates.sortBy !== undefined) setSortBy(updates.sortBy);
    if (updates.priceFilter !== undefined) setPriceFilter(updates.priceFilter);
  };

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    priceFilter,
    setPriceFilter,
    updateFilters,
    filteredStrains: filteredAndSortedStrains
  };
};
