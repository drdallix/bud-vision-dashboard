
import { Strain } from '@/types/strain';
import { FilterCriteria, SortCriteria } from '@/core/FilterEngine';
import { SelectionState } from '@/core/SelectionManager';

export interface InventoryGridProps {
  strains: Strain[];
  loading?: boolean;
  onStrainSelect: (strain: Strain) => void;
  onStockToggle: (strainId: string, inStock: boolean) => Promise<void>;
  onPriceEdit: (strainId: string) => void;
  selectionState: SelectionState;
  onSelectionChange: (state: SelectionState) => void;
}

export interface InventoryFiltersProps {
  criteria: FilterCriteria;
  sortCriteria: SortCriteria;
  onCriteriaChange: (criteria: FilterCriteria) => void;
  onSortChange: (sort: SortCriteria) => void;
  availableOptions: {
    types: string[];
    effects: string[];
    flavors: string[];
    thcRange: [number, number];
  };
}

export interface BatchActionsProps {
  selectionState: SelectionState;
  onBatchStockUpdate: (inStock: boolean) => Promise<void>;
  onBatchPriceUpdate: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export interface StrainCardProps {
  strain: Strain;
  selected?: boolean;
  onSelect: () => void;
  onStockToggle: (inStock: boolean) => Promise<void>;
  onPriceEdit: () => void;
  onView: () => void;
  showSelection?: boolean;
}
