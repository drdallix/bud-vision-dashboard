
import { Strain } from '@/types/strain';

export interface SelectionState {
  selectedIds: Set<string>;
  isSelectionMode: boolean;
}

export class SelectionManager {
  /**
   * Toggle selection for a strain
   */
  static toggleSelection(
    state: SelectionState, 
    strainId: string
  ): SelectionState {
    const newSelectedIds = new Set(state.selectedIds);
    
    if (newSelectedIds.has(strainId)) {
      newSelectedIds.delete(strainId);
    } else {
      newSelectedIds.add(strainId);
    }

    return {
      selectedIds: newSelectedIds,
      isSelectionMode: state.isSelectionMode || newSelectedIds.size > 0
    };
  }

  /**
   * Select all strains
   */
  static selectAll(strains: Strain[]): SelectionState {
    return {
      selectedIds: new Set(strains.map(s => s.id)),
      isSelectionMode: true
    };
  }

  /**
   * Clear all selections
   */
  static clearSelection(): SelectionState {
    return {
      selectedIds: new Set(),
      isSelectionMode: false
    };
  }

  /**
   * Select strains by criteria
   */
  static selectByCriteria(
    strains: Strain[], 
    criteria: (strain: Strain) => boolean
  ): SelectionState {
    const selectedIds = new Set(
      strains.filter(criteria).map(s => s.id)
    );

    return {
      selectedIds,
      isSelectionMode: selectedIds.size > 0
    };
  }

  /**
   * Get selected strains
   */
  static getSelectedStrains(
    strains: Strain[], 
    selectedIds: Set<string>
  ): Strain[] {
    return strains.filter(strain => selectedIds.has(strain.id));
  }

  /**
   * Get selection statistics
   */
  static getSelectionStats(
    strains: Strain[], 
    selectedIds: Set<string>
  ): {
    total: number;
    selected: number;
    inStock: number;
    outOfStock: number;
  } {
    const selectedStrains = this.getSelectedStrains(strains, selectedIds);
    
    return {
      total: strains.length,
      selected: selectedStrains.length,
      inStock: selectedStrains.filter(s => s.inStock).length,
      outOfStock: selectedStrains.filter(s => !s.inStock).length
    };
  }
}
