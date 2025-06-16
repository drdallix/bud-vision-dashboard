
import { Edit3, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BrowseHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  showBatchActions: boolean;
  onToggleBatchActions: () => void;
}

const BrowseHeader = ({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onClearSelection,
  isAllSelected,
  showBatchActions,
  onToggleBatchActions
}: BrowseHeaderProps) => {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          {totalCount} total strains
        </Badge>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selected
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-3 text-xs"
          >
            Clear Selection
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="h-7 px-3 text-xs"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
    </div>
  );
};

export default BrowseHeader;
