
import { Edit3, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BrowseHeaderProps {
  user: any;
  editMode: boolean;
  onEditModeChange: (editMode: boolean) => void;
  inStockCount: number;
}

const BrowseHeader = ({ user, editMode, onEditModeChange, inStockCount }: BrowseHeaderProps) => {
  if (!user) return null;

  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          {inStockCount} in stock
        </Badge>
      </div>
      
      <Button
        variant={editMode ? "default" : "outline"}
        size="sm"
        onClick={() => onEditModeChange(!editMode)}
        className="h-7 px-3 text-xs"
      >
        {editMode ? (
          <>
            <Eye className="h-3 w-3 mr-1" />
            View
          </>
        ) : (
          <>
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </>
        )}
      </Button>
    </div>
  );
};

export default BrowseHeader;
