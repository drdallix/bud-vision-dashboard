
import { Strain } from '@/types/strain';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export interface FilterCriteria {
  searchTerm: string;
  type: string;
  effects: string[];
  flavors: string[];
  thcRange: [number, number];
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
}

export interface SortCriteria {
  sortBy: 'recent' | 'name' | 'thc' | 'confidence' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

export class FilterEngine {
  /**
   * Apply all filters to strain array
   */
  static applyFilters(strains: Strain[], criteria: FilterCriteria): Strain[] {
    return strains.filter(strain => {
      // Search term filter
      if (criteria.searchTerm && !this.matchesSearchTerm(strain, criteria.searchTerm)) {
        return false;
      }

      // Type filter
      if (criteria.type !== 'all' && strain.type !== criteria.type) {
        return false;
      }

      // Effects filter
      if (criteria.effects.length > 0 && !this.matchesEffects(strain, criteria.effects)) {
        return false;
      }

      // Flavors filter
      if (criteria.flavors.length > 0 && !this.matchesFlavors(strain, criteria.flavors)) {
        return false;
      }

      // THC range filter
      if (!this.matchesTHCRange(strain, criteria.thcRange)) {
        return false;
      }

      // Stock filter
      if (criteria.stockFilter === 'in-stock' && !strain.inStock) {
        return false;
      }
      if (criteria.stockFilter === 'out-of-stock' && strain.inStock) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort strains array
   */
  static sortStrains(strains: Strain[], criteria: SortCriteria): Strain[] {
    const sorted = [...strains].sort((a, b) => {
      let comparison = 0;

      switch (criteria.sortBy) {
        case 'recent':
          comparison = new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
          break;
        case 'name':
        case 'alphabetical':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'thc': {
          const [aMin, aMax] = getDeterministicTHCRange(a.name);
          const [bMin, bMax] = getDeterministicTHCRange(b.name);
          const aAvg = (aMin + aMax) / 2;
          const bAvg = (bMin + bMax) / 2;
          comparison = bAvg - aAvg;
          break;
        }
        case 'confidence':
          comparison = b.confidence - a.confidence;
          break;
        default:
          comparison = 0;
      }

      return criteria.sortOrder === 'desc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Check if strain matches search term
   */
  private static matchesSearchTerm(strain: Strain, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    const effectNames = strain.effectProfiles?.map(e => e.name.toLowerCase()) || [];
    const flavorNames = strain.flavorProfiles?.map(f => f.name.toLowerCase()) || [];

    return (
      strain.name.toLowerCase().includes(term) ||
      strain.description?.toLowerCase().includes(term) ||
      effectNames.some(effect => effect.includes(term)) ||
      flavorNames.some(flavor => flavor.includes(term))
    );
  }

  /**
   * Check if strain matches selected effects
   */
  private static matchesEffects(strain: Strain, selectedEffects: string[]): boolean {
    const strainEffects = strain.effectProfiles?.map(e => e.name) || [];
    return selectedEffects.every(effect => strainEffects.includes(effect));
  }

  /**
   * Check if strain matches selected flavors
   */
  private static matchesFlavors(strain: Strain, selectedFlavors: string[]): boolean {
    const strainFlavors = strain.flavorProfiles?.map(f => f.name) || [];
    return selectedFlavors.every(flavor => strainFlavors.includes(flavor));
  }

  /**
   * Check if strain matches THC range
   */
  private static matchesTHCRange(strain: Strain, thcRange: [number, number]): boolean {
    const [minThc, maxThc] = getDeterministicTHCRange(strain.name);
    const avgThc = (minThc + maxThc) / 2;
    return avgThc >= thcRange[0] && avgThc <= thcRange[1];
  }

  /**
   * Get available filter options from strains
   */
  static getFilterOptions(strains: Strain[]): {
    types: string[];
    effects: string[];
    flavors: string[];
    thcRange: [number, number];
  } {
    const types = [...new Set(strains.map(s => s.type))];
    const effects = [...new Set(strains.flatMap(s => s.effectProfiles?.map(e => e.name) || []))];
    const flavors = [...new Set(strains.flatMap(s => s.flavorProfiles?.map(f => f.name) || []))];
    
    // Calculate THC range
    const thcValues = strains.flatMap(s => {
      const [min, max] = getDeterministicTHCRange(s.name);
      return [min, max];
    });
    const minThc = Math.min(...thcValues, 0);
    const maxThc = Math.max(...thcValues, 35);

    return {
      types: types.sort(),
      effects: effects.sort(),
      flavors: flavors.sort(),
      thcRange: [minThc, maxThc]
    };
  }
}
