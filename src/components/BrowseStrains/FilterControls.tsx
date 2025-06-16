
import { Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const PRESET_PRICES = [30, 40, 50, 60, 80, 100, 120, 200, 300];

interface FilterControlsProps {
  filterType: string;
  sortBy: string;
  priceFilter: string | null;
  onFilterChange: (type: string) => void;
  onSortChange: (sort: string) => void;
  onPriceFilterChange: (price: string | null) => void;
}

const FilterControls = ({
  filterType,
  sortBy,
  priceFilter,
  onFilterChange,
  onSortChange,
  onPriceFilterChange,
}: FilterControlsProps) => {
  const activeFilters = [
    filterType !== 'all' && filterType,
    priceFilter && `$${priceFilter}/oz`,
    sortBy !== 'recent' && sortBy
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {/* Strain type filter */}
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Indica">Indica</SelectItem>
            <SelectItem value="Sativa">Sativa</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        {/* Price filter */}
        <Select
          value={priceFilter || 'all'}
          onValueChange={(val) => onPriceFilterChange(val === 'all' ? null : val)}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            {PRESET_PRICES.map((p) => (
              <SelectItem value={p.toString()} key={p}>
                ${p} / oz
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort filter */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest</SelectItem>
            <SelectItem value="name">A-Z</SelectItem>
            <SelectItem value="thc">THC ↓</SelectItem>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="price-asc">Lowest price</SelectItem>
            <SelectItem value="price-desc">Highest price</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {activeFilters.length > 0 && (
          <button
            onClick={() => {
              onFilterChange('all');
              onSortChange('recent');
              onPriceFilterChange(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 px-1">
          <span className="text-xs text-muted-foreground mr-2">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterControls;
