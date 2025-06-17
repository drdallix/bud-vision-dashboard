import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interface for a single strain
interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thc: number;
  cbd: number;
  effects: string[];
  flavors: string[];
  medicalUses: string[];
  description: string;
  imageUrl: string;
  scannedAt: string;
  confidence: number;
}

// Props for the main ScanHistory component
interface ScanHistoryProps {
  strains: Strain[];
  onStrainSelect: (strain: Strain) => void;
}

// Map of effect names to their corresponding emojis
const effectToEmoji: { [key: string]: string } = {
  'Relaxed': '😌',
  'Happy': '�',
  'Euphoric': '🤩',
  'Uplifted': '⬆️',
  'Creative': '🎨',
  'Focused': '🎯',
  'Sleepy': '😴',
  'Hungry': '🍽️',
};

// --- StrainCard Component ---
// This component now displays emojis for effects instead of badges.
const StrainCard = ({ strain, onStrainSelect }: { strain: Strain, onStrainSelect: (strain: Strain) => void }) => {
  const [shuffledEffects, setShuffledEffects] = useState(strain.effects);

  useEffect(() => {
    const effectsCopy = [...strain.effects];
    for (let i = effectsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [effectsCopy[i], effectsCopy[j]] = [effectsCopy[j], effectsCopy[i]];
    }
    setShuffledEffects(effectsCopy);
  }, [strain.effects]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card
      key={strain.id}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col"
      onClick={() => onStrainSelect(strain)}
    >
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={strain.imageUrl}
            alt={strain.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            onError={(e) => { e.currentTarget.src = `https://placehold.co/64x64/222/fff?text=${strain.name.charAt(0)}`; }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{strain.name}</h3>
              <Badge className={`${getTypeColor(strain.type)} text-xs`}>
                {strain.type}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span>THC: {strain.thc}%</span>
              <span>CBD: {strain.cbd}%</span>
            </div>
            {/* Display emojis for effects */}
            <div className="flex flex-wrap items-center gap-2">
              {shuffledEffects.slice(0, 3).map((effect) => (
                <span
                  key={effect}
                  title={effect} // Tooltip to show the effect name
                  className="text-2xl bg-slate-100 rounded-md p-1 leading-none"
                >
                  {effectToEmoji[effect] || '🌿'}
                </span>
              ))}
              {shuffledEffects.length > 3 && (
                <span className="text-xs text-muted-foreground font-medium">
                  +{shuffledEffects.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-auto">
          {strain.description}
        </p>
      </CardContent>
    </Card>
  );
};

// --- Main ScanHistory Component ---
const ScanHistory = ({ strains, onStrainSelect }: ScanHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredAndSortedStrains = strains
    .filter(strain => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = strain.name.toLowerCase().includes(lowerSearchTerm) ||
                            strain.effects.some(effect => effect.toLowerCase().includes(lowerSearchTerm)) ||
                            strain.flavors.some(flavor => flavor.toLowerCase().includes(lowerSearchTerm));
      const matchesType = filterType === 'all' || strain.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'thc':
          return b.thc - a.thc;
        case 'confidence':
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    });

  if (strains.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scan History</h3>
            <p className="text-muted-foreground max-w-md">
              Your scanned strains will appear here. Start by scanning your first cannabis package!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scan History ({strains.length} scans)
          </CardTitle>
          <CardDescription>
            Browse and search through your previously identified strains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search strains, effects, or flavors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Indica">Indica</SelectItem>
                <SelectItem value="Sativa">Sativa</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="thc">Highest THC</SelectItem>
                <SelectItem value="confidence">Highest Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStrains.map((strain) => (
          <StrainCard key={strain.id} strain={strain} onStrainSelect={onStrainSelect} />
        ))}
      </div>

      {filteredAndSortedStrains.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find more strains.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanHistory;
�