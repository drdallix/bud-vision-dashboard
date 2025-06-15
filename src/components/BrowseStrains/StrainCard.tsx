import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Strain } from '@/types/strain';
import { getDeterministicTHC, getDeterministicTHCRange } from '@/utils/thcGenerator';

interface StrainCardProps {
  strain: Strain;
  editMode: boolean;
  isSelected: boolean;
  canEdit: boolean;
  onSelect: (strainId: string, checked: boolean) => void;
  onStockToggle: (strainId: string, currentStock: boolean) => void;
  onStrainClick: (strain: Strain) => void;
  inventoryLoading: boolean;
}

const StrainCard = ({
  strain,
  editMode,
  isSelected,
  canEdit,
  onSelect,
  onStockToggle,
  onStrainClick,
  inventoryLoading
}: StrainCardProps) => {
  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Indica': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300';
      case 'Sativa': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'Hybrid': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const getStrainEmoji = (type: string) => {
    switch (type) {
      case 'Indica': return '🌙';
      case 'Sativa': return '☀️';
      case 'Hybrid': return '🌓';
      default: return '🌿';
    }
  };

  const getGradientColor = (type: string) => {
    switch (type) {
      case 'Indica': return 'from-purple-500 to-purple-700';
      case 'Sativa': return 'from-green-500 to-green-700';
      case 'Hybrid': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const [thcMin, thcMax] = getDeterministicTHCRange(strain.name);

  return (
    <Card 
      className={`transition-all duration-200 ${
        !editMode ? 'cursor-pointer hover:shadow-md' : ''
      } ${!strain.inStock ? 'opacity-60' : ''}`}
      onClick={() => !editMode && onStrainClick(strain)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {editMode && canEdit && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(strain.id, checked as boolean)}
              className="mt-1 flex-shrink-0"
            />
          )}
          
          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getGradientColor(strain.type)} flex items-center justify-center flex-shrink-0 relative`}>
            <div className="text-2xl opacity-20 absolute">🌿</div>
            <div className="text-xl z-10">{getStrainEmoji(strain.type)}</div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate text-lg">{strain.name}</h3>
              <Badge className={`${getTypeColor(strain.type)} text-xs`}>
                {strain.type}
              </Badge>
              {!strain.inStock && (
                <Badge variant="secondary" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <div className="mb-2">
              <div className="text-xs text-muted-foreground">
                THC: {thcMin}%–{thcMax}%
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {strain.effectProfiles.slice(0, 3).map((effect, index) => (
                <Badge key={index} variant="outline" className="text-xs flex items-center gap-1"
                       style={{ backgroundColor: `${effect.color}20`, color: effect.color, borderColor: effect.color }}>
                  <span>{effect.emoji}</span>
                  {effect.name}
                </Badge>
              ))}
              {strain.effectProfiles.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{strain.effectProfiles.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(strain.scannedAt).toLocaleDateString()}
              </p>
              
              {editMode && canEdit && (
                <Switch
                  checked={strain.inStock}
                  onCheckedChange={() => onStockToggle(strain.id, strain.inStock)}
                  disabled={inventoryLoading}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrainCard;
