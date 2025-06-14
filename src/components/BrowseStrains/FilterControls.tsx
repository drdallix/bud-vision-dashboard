
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
    <div className="flex flex-wrap gap-3">
      <Select value={filterType} onValueChange={onFilterChange}>
        <SelectTrigger className="w-36">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Indica">Indica</SelectItem>
          <SelectItem value="Sativa">Sativa</SelectItem>
          <SelectItem value="Hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40">
          <TrendingUp className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="name">Name A-Z</SelectItem>
          <SelectItem value="thc">Highest THC</SelectItem>
          <SelectItem value="confidence">Highest Confidence</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterControls;
