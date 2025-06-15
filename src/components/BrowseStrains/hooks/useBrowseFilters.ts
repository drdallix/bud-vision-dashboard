
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

  // Filter and sort strains based on current filter state
  const filteredAndSortedStrains = useMemo(() => {
    // Guard against undefined or null strains array
    if (!strains || !Array.isArray(strains)) {
      return [];
    }

    let filtered = strains.filter(strain => {
      // Search filter
      const effectNames = strain.effectProfiles?.map(e => e.name) || [];
      const flavorNames = strain.flavorProfiles?.map(f => f.name) || [];
      const matchesSearch = !searchTerm || (
        strain.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        effectNames.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
        flavorNames.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      // Type filter
      const matchesType = filterType === 'all' || strain.type === filterType;

      // Price filter (would need price data integration)
      const matchesPrice = !priceFilter; // For now, always true until price integration

      return matchesSearch && matchesType && matchesPrice;
    });

    // Sort the filtered results
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
          // Would integrate with price data here
          return 0;
        case 'price-desc':
          // Would integrate with price data here
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [strains, searchTerm, filterType, sortBy, priceFilter]);

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
    // Current filter state
    searchTerm,
    filterType,
    sortBy,
    priceFilter,
    
    // Individual setters (for backward compatibility)
    setSearchTerm,
    setFilterType,
    setSortBy,
    setPriceFilter,
    
    // Unified update function
    updateFilters,
    
    // Filtered results
    filteredStrains: filteredAndSortedStrains,
    
    // Filter stats
    totalCount: strains.length,
    filteredCount: filteredAndSortedStrains.length,
    hasActiveFilters: searchTerm !== '' || filterType !== 'all' || sortBy !== 'recent' || priceFilter !== null
  };
};
