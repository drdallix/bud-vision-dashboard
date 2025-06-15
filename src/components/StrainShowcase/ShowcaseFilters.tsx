
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, SortAsc } from 'lucide-react';

interface ShowcaseFiltersProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  sortBy: 'name' | 'thc' | 'recent';
  setSortBy: (sort: 'name' | 'thc' | 'recent') => void;
  minTHC: number;
  setMinTHC: (thc: number) => void;
  strainCount: number;
}

const ShowcaseFilters = ({
  selectedTypes,
  setSelectedTypes,
  sortBy,
  setSortBy,
  minTHC,
  setMinTHC,
  strainCount,
}: ShowcaseFiltersProps) => {
  const types = ['Indica', 'Sativa', 'Hybrid'];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      default: return '🌿';
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'name': return 'Alphabetical';
      case 'thc': return 'THC Level';
      case 'recent': return 'Recently Added';
      default: return 'Name';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 md:p-6 shadow-lg animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Showcase Filters
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {strainCount} strains
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {/* Strain Types */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>🧬</span> Strain Types
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleType(type)}
                className={`transition-all duration-200 ${
                  selectedTypes.includes(type)
                    ? 'bg-green-600 hover:bg-green-700 scale-105 shadow-md'
                    : 'hover:scale-105'
                }`}
              >
                <span className="mr-1">{getTypeEmoji(type)}</span>
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <SortAsc className="h-4 w-4" /> Sort By
          </label>
          <Select value={sortBy} onValueChange={(value: 'name' | 'thc' | 'recent') => setSortBy(value)}>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">🔤 Alphabetical</SelectItem>
              <SelectItem value="thc">💪 THC Level</SelectItem>
              <SelectItem value="recent">⏰ Recently Added</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Currently: {getSortLabel(sortBy)}
          </p>
        </div>

        {/* THC Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>⚡</span> Min THC Level
          </label>
          <div className="px-2">
            <Slider
              value={[minTHC]}
              onValueChange={([value]) => setMinTHC(value)}
              max={35}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <Badge variant="outline" className="text-green-700 border-green-300">
              {minTHC}%+
            </Badge>
            <span>35%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseFilters;
