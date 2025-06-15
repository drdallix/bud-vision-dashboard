
import { Filter, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  return (
    <div className="flex items-center gap-2 px-1">
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

      <Select value={priceFilter ?? ''} onValueChange={(val) => onPriceFilterChange(val === '' ? null : val)}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <span className="mr-1">$</span>
          <SelectValue placeholder="Any Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any Price</SelectItem>
          {PRESET_PRICES.map((p) => (
            <SelectItem value={p.toString()} key={p}>
              ${p} / oz
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
    </div>
  );
};

export default FilterControls;
