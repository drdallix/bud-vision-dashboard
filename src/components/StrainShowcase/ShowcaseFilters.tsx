
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, SortAsc } from 'lucide-react';

interface ShowcaseFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  sortBy: 'name' | 'thc' | 'recent';
  onSortChange: (sort: 'name' | 'thc' | 'recent') => void;
  strainCount: number;
}

const ShowcaseFilters = ({
  filterType,
  onFilterChange,
  sortBy,
  onSortChange,
  strainCount,
}: ShowcaseFiltersProps) => {
  const types = ['all', 'Indica', 'Sativa', 'Hybrid'];

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      case 'all': return '🌿';
      default: return '🌿';
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'name': return 'Alphabetical';
      case 'thc': return 'THC Level';
      case 'recent': return 'Recently Added';
      default: return 'Recent';
    }
  };

  return (
    <div className="bg-theme-card backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6 shadow-lg animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Showcase Filters
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {strainCount} strains
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Strain Types */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span>🧬</span> Strain Types
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(type)}
                className={`transition-all duration-200 ${
                  filterType === type
                    ? 'bg-primary hover:bg-primary/90 scale-105 shadow-md'
                    : 'hover:scale-105'
                }`}
              >
                <span className="mr-1">{getTypeEmoji(type)}</span>
                {type === 'all' ? 'All' : type}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <SortAsc className="h-4 w-4" /> Sort By
          </label>
          <Select value={sortBy} onValueChange={(value: 'name' | 'thc' | 'recent') => onSortChange(value)}>
            <SelectTrigger className="border-border focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">🔤 Alphabetical</SelectItem>
              <SelectItem value="thc">💪 THC Level</SelectItem>
              <SelectItem value="recent">⏰ Recently Added</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Currently: {getSortLabel(sortBy)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseFilters;
