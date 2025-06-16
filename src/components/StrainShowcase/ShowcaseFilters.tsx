
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, ChevronDown, Settings } from 'lucide-react';
import BulkToneManager from './BulkToneManager';

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
  strainCount
}: ShowcaseFiltersProps) => {
  const [showBulkManager, setShowBulkManager] = useState(false);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const strainTypes = ['Indica', 'Sativa', 'Hybrid'];

  return (
    <div className="space-y-4">
      <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              Showcase Filters
            </div>
            <Badge variant="secondary" className="text-sm">
              {strainCount} strains
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strain Types */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Strain Types:</label>
            <div className="flex flex-wrap gap-2">
              {strainTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleType(type)}
                  className="text-sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sort By:</label>
            <Select value={sortBy} onValueChange={(value: 'name' | 'thc' | 'recent') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Alphabetical</SelectItem>
                <SelectItem value="thc">THC Content</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* THC Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Minimum THC:</label>
              <Badge variant="outline">{minTHC}%</Badge>
            </div>
            <Slider
              value={[minTHC]}
              onValueChange={(value) => setMinTHC(value[0])}
              max={35}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Admin Controls */}
          <div className="pt-4 border-t border-border/50">
            <Collapsible open={showBulkManager} onOpenChange={setShowBulkManager}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin Tools</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showBulkManager ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <BulkToneManager />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowcaseFilters;
