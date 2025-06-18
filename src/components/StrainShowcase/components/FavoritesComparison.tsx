
import { Strain } from '@/types/strain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Trash2 } from 'lucide-react';
import { useStrainTHC } from '@/hooks/useStrainTHC';

interface FavoritesComparisonProps {
  favoriteStrains: Strain[];
  onRemoveFavorite: (strain: Strain) => void;
  onClearAll: () => void;
}

const FavoritesComparison = ({ 
  favoriteStrains, 
  onRemoveFavorite, 
  onClearAll 
}: FavoritesComparisonProps) => {
  if (favoriteStrains.length === 0) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Sativa': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hybrid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compare Favorites ({favoriteStrains.length})</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Strain</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-left py-2 font-medium">THC</th>
                <th className="text-left py-2 font-medium">Top Effects</th>
                <th className="text-left py-2 font-medium">Top Flavors</th>
                <th className="text-center py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {favoriteStrains.map((strain) => (
                <StrainComparisonRow 
                  key={strain.id}
                  strain={strain}
                  onRemove={onRemoveFavorite}
                  getTypeColor={getTypeColor}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const StrainComparisonRow = ({ 
  strain, 
  onRemove, 
  getTypeColor 
}: { 
  strain: Strain; 
  onRemove: (strain: Strain) => void;
  getTypeColor: (type: string) => string;
}) => {
  const { thcDisplay } = useStrainTHC(strain.name);
  
  const topEffects = strain.effectProfiles?.slice(0, 2) || [];
  const topFlavors = strain.flavorProfiles?.slice(0, 2) || [];

  return (
    <tr className="border-b hover:bg-muted/30">
      <td className="py-3">
        <div className="font-medium text-sm">{strain.name}</div>
      </td>
      <td className="py-3">
        <Badge className={`text-xs ${getTypeColor(strain.type)}`}>
          {strain.type}
        </Badge>
      </td>
      <td className="py-3">
        <span className="font-medium text-green-600">{thcDisplay}</span>
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-1">
          {topEffects.map((effect, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <span>{effect.name}</span>
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-1">
          {topFlavors.map((flavor, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <span>{flavor.name}</span>
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-3 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(strain)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default FavoritesComparison;
