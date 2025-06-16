
import { useState } from 'react';
import { Filter, X, TrendingUp, Hash, Zap, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Strain } from '@/types/strain';

interface MobileFiltersProps {
  strains: Strain[];
  filterType: string;
  sortBy: string;
  selectedEffects: string[];
  selectedFlavors: string[];
  thcRange: [number, number];
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onFilterChange: (filterType: string) => void;
  onSortChange: (sortBy: string) => void;
  onEffectToggle: (effect: string) => void;
  onFlavorToggle: (flavor: string) => void;
  onThcRangeChange: (range: [number, number]) => void;
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
  onClearAll: () => void;
}

const MobileFilters = ({
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
  onClearAll,
}: MobileFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique effects and flavors from all strains
  const allEffects = Array.from(new Set(
    strains.flatMap(strain => strain.effectProfiles?.map(e => e.name) || [])
  )).sort();

  const allFlavors = Array.from(new Set(
    strains.flatMap(strain => strain.flavorProfiles?.map(f => f.name) || [])
  )).sort();

  const activeFilterCount = [
    filterType !== 'all',
    sortBy !== 'recent',
    selectedEffects.length > 0,
    selectedFlavors.length > 0,
    thcRange[0] > 0 || thcRange[1] < 100,
    stockFilter !== 'all'
  ].filter(Boolean).length;

  const strainTypes = ['all', 'Indica', 'Sativa', 'Hybrid'];
  const sortOptions = [
    { value: 'recent', label: 'Newest' },
    { value: 'name', label: 'A-Z' },
    { value: 'thc', label: 'THC ↓' },
    { value: 'confidence', label: 'Confidence' }
  ];

  const thcPresets = [
    { label: 'Any', range: [0, 100] as [number, number] },
    { label: '15-20%', range: [15, 20] as [number, number] },
    { label: '20-25%', range: [20, 25] as [number, number] },
    { label: '25-30%', range: [25, 30] as [number, number] },
    { label: '30%+', range: [30, 100] as [number, number] }
  ];

  return (
    <div className="space-y-3">
      {/* Quick filters row - always visible */}
      <div className="grid grid-cols-2 gap-2">
        {/* Type filter */}
        <div className="flex flex-wrap gap-1">
          {strainTypes.map((type) => (
            <Button
              key={type}
              onClick={() => onFilterChange(type)}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs flex-1 min-w-0"
            >
              {type === 'all' ? 'All' : type}
            </Button>
          ))}
        </div>

        {/* Sort + Stock filter */}
        <div className="flex gap-1">
          <Button
            onClick={() => onStockFilterChange(stockFilter === 'all' ? 'in-stock' : 'all')}
            variant={stockFilter !== 'all' ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 text-xs"
          >
            {stockFilter === 'in-stock' ? '✓ Stock' : 'Stock'}
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={activeFilterCount > 0 ? "default" : "outline"}
            size="sm" 
            className="h-8 px-2 text-xs relative"
          >
            <Filter className="h-3 w-3" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced filters - collapsible */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="space-y-3">
          {/* Sort options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* THC Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">THC Level</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {thcPresets.map((preset) => (
                <Button
                  key={preset.label}
                  onClick={() => onThcRangeChange(preset.range)}
                  variant={thcRange[0] === preset.range[0] && thcRange[1] === preset.range[1] ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Effects */}
          {allEffects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Effects</span>
                {selectedEffects.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedEffects.length}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {allEffects.slice(0, 8).map((effect) => (
                  <Button
                    key={effect}
                    onClick={() => onEffectToggle(effect)}
                    variant={selectedEffects.includes(effect) ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    {effect}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Flavors */}
          {allFlavors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Flavors</span>
                {selectedFlavors.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedFlavors.length}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {allFlavors.slice(0, 8).map((flavor) => (
                  <Button
                    key={flavor}
                    onClick={() => onFlavorToggle(flavor)}
                    variant={selectedFlavors.includes(flavor) ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    {flavor}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <Button
              onClick={onClearAll}
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all filters
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MobileFilters;
