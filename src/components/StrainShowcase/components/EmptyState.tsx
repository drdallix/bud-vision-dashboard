
import { Strain } from '@/types/strain';
import MobileFilters from '@/components/BrowseStrains/MobileFilters';

interface EmptyStateProps {
  strains: Strain[];
  filterType: string;
  sortBy: 'name' | 'thc' | 'recent';
  selectedEffects: string[];
  selectedFlavors: string[];
  thcRange: [number, number];
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onFilterChange: (type: string) => void;
  onSortChange: (sort: 'name' | 'thc' | 'recent') => void;
  onEffectToggle: (effect: string) => void;
  onFlavorToggle: (flavor: string) => void;
  onThcRangeChange: (range: [number, number]) => void;
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
  onClearAll: () => void;
}

const EmptyState = ({ 
  strains, 
  filterType, 
  sortBy, 
  selectedEffects, 
  selectedFlavors, 
  thcRange, 
  stockFilter,
  onFilterChange,
  onSortChange,
  onEffectToggle,
  onFlavorToggle,
  onThcRangeChange,
  onStockFilterChange,
  onClearAll
}: EmptyStateProps) => {
  return (
    <div className="space-y-4">
      <MobileFilters
        strains={strains}
        filterType={filterType}
        sortBy={sortBy}
        selectedEffects={selectedEffects}
        selectedFlavors={selectedFlavors}
        thcRange={thcRange}
        stockFilter={stockFilter}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        onEffectToggle={onEffectToggle}
        onFlavorToggle={onFlavorToggle}
        onThcRangeChange={onThcRangeChange}
        onStockFilterChange={onStockFilterChange}
        onClearAll={onClearAll}
      />
      <div className="text-center py-12">
        <p className="text-muted-foreground">No strains match your current filters</p>
      </div>
    </div>
  );
};

export default EmptyState;
