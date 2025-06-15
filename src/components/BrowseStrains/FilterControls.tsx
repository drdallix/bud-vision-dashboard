
import { Filter, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterControlsProps {
  filterType: string;
  sortBy: string;
  onFilterChange: (type: string) => void;
  onSortChange: (sort: string) => void;
}

const FilterControls = ({ filterType, sortBy, onFilterChange, onSortChange }: FilterControlsProps) => {
  return (
    <div className="flex items-center gap-2 px-1">
      <Select value={filterType} onValueChange={onFilterChange}>
        <SelectTrigger className="h-8 w-28 text-xs">
          <Filter className="h-3 w-3 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Indica">Indica</SelectItem>
          <SelectItem value="Sativa">Sativa</SelectItem>
          <SelectItem value="Hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recent</SelectItem>
          <SelectItem value="name">A-Z</SelectItem>
          <SelectItem value="thc">THC ↓</SelectItem>
          <SelectItem value="confidence">Confidence</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterControls;
