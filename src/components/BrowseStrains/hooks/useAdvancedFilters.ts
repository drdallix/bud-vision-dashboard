
import { useState, useMemo } from 'react';
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const useAdvancedFilters = (strains: Strain[] = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [thcRange, setThcRange] = useState<[number, number]>([0, 100]);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Enhanced filtering that searches everything
  const filteredAndSortedStrains = useMemo(() => {
    if (!strains || !Array.isArray(strains)) {
      return [];
    }

    let filtered = strains.filter(strain => {
      // Enhanced search - searches ALL text fields
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableFields = [
          strain.name,
          strain.type,
          strain.description || '',
          ...(strain.effectProfiles?.map(e => e.name) || []),
          ...(strain.flavorProfiles?.map(f => f.name) || []),
          ...(strain.terpenes?.map(t => t.name) || []),
          ...(strain.terpenes?.map(t => t.effects) || [])
        ];
        
        const matchesSearch = searchableFields.some(field => 
          field && field.toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }

      // Type filter - now supports all 5 types
      if (filterType !== 'all' && strain.type !== filterType) {
        return false;
      }

      // Stock filter
      if (stockFilter === 'in-stock' && !strain.inStock) return false;
      if (stockFilter === 'out-of-stock' && strain.inStock) return false;

      // Effects filter
      if (selectedEffects.length > 0) {
        const strainEffects = strain.effectProfiles?.map(e => e.name) || [];
        const hasSelectedEffect = selectedEffects.some(effect => 
          strainEffects.includes(effect)
        );
        if (!hasSelectedEffect) return false;
      }

      // Flavors filter
      if (selectedFlavors.length > 0) {
        const strainFlavors = strain.flavorProfiles?.map(f => f.name) || [];
        const hasSelectedFlavor = selectedFlavors.some(flavor => 
          strainFlavors.includes(flavor)
        );
        if (!hasSelectedFlavor) return false;
      }

      // THC range filter
      if (thcRange[0] > 0 || thcRange[1] < 100) {
        const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
        const avgThc = (minThc + maxThc) / 2;
        if (avgThc < thcRange[0] || avgThc > thcRange[1]) {
          return false;
        }
      }

      return true;
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [strains, searchTerm, filterType, sortBy, selectedEffects, selectedFlavors, thcRange, stockFilter]);

  const handleEffectToggle = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) 
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('recent');
    setSelectedEffects([]);
    setSelectedFlavors([]);
    setThcRange([0, 100]);
    setStockFilter('all');
  };

  const hasActiveFilters = (
    searchTerm !== '' || 
    filterType !== 'all' || 
    sortBy !== 'recent' || 
    selectedEffects.length > 0 || 
    selectedFlavors.length > 0 || 
    thcRange[0] > 0 || 
    thcRange[1] < 100 ||
    stockFilter !== 'all'
  );

  return {
    // Search
    searchTerm,
    setSearchTerm,
    
    // Basic filters
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
    
    // Advanced filters
    selectedEffects,
    selectedFlavors,
    thcRange,
    setThcRange,
    handleEffectToggle,
    handleFlavorToggle,
    
    // Results
    filteredStrains: filteredAndSortedStrains,
    
    // Actions
    clearAllFilters,
    
    // Stats
    totalCount: strains.length,
    filteredCount: filteredAndSortedStrains.length,
    hasActiveFilters
  };
};
