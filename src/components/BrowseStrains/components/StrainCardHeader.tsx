
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Edit, DollarSign } from 'lucide-react';

interface StrainCardHeaderProps {
  strainName: string;
  strainType: string;
  editMode: boolean;
  isSelected: boolean;
  canEdit: boolean;
  localInStock: boolean;
  inventoryLoading: boolean;
  onSelect: (checked: boolean) => void;
  onStockToggle: () => void;
  onEditClick: (e: React.MouseEvent) => void;
  onQuickPriceClick: (e: React.MouseEvent) => void;
  getTypeColor: (type: string) => string;
}

const StrainCardHeader = ({
  strainName,
  strainType,
  editMode,
  isSelected,
  canEdit,
  localInStock,
  inventoryLoading,
  onSelect,
  onStockToggle,
  onEditClick,
  onQuickPriceClick,
  getTypeColor
}: StrainCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {editMode && canEdit && (
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelect} 
            className="flex-shrink-0" 
          />
        )}
        <h3 className="font-semibold truncate text-lg">{strainName}</h3>
        <Badge className={`${getTypeColor(strainType)} text-xs flex-shrink-0`}>
          {strainType}
        </Badge>
        {!localInStock && (
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            Out of Stock
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
          title="Quick Price Edit"
          onClick={onQuickPriceClick}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
        
        {editMode && canEdit && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Switch 
              checked={localInStock} 
              onCheckedChange={onStockToggle} 
              disabled={inventoryLoading} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StrainCardHeader;
