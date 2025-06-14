
import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Strain } from '@/types/strain';

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
          
          <img 
            src={strain.imageUrl} 
            alt={strain.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
          
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
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="font-medium">THC: {strain.thc}%</span>
              <span>CBD: {strain.cbd}%</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {strain.effects.slice(0, 3).map((effect, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {effect}
                </Badge>
              ))}
              {strain.effects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{strain.effects.length - 3}
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
