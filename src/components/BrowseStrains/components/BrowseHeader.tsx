
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, Edit3, Package } from 'lucide-react';

interface BrowseHeaderProps {
  user: any;
  editMode: boolean;
  onEditModeChange: (editMode: boolean) => void;
  inStockCount: number;
}

const BrowseHeader = ({ user, editMode, onEditModeChange, inStockCount }: BrowseHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">
            {user ? 'Inventory Management' : 'Today\'s Menu'}
          </h2>
          {!user && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {inStockCount} available
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          {editMode 
            ? 'Manage inventory and stock status for your dispensary' 
            : user 
              ? 'Browse strain database for customer recommendations'
              : 'Browse our current selection of available cannabis strains'
          }
        </p>
      </div>
      
      {user && (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <Switch
            checked={editMode}
            onCheckedChange={onEditModeChange}
            aria-label="Toggle inventory management mode"
          />
          <Edit3 className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {editMode ? 'Inventory Mode' : 'Browse Mode'}
          </span>
        </div>
      )}
    </div>
  );
};

export default BrowseHeader;
