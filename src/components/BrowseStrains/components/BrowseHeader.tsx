
import { Edit3, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BrowseHeaderProps {
  strainCount: number;
  editMode: boolean;
  onEditModeToggle: () => void;
}

const BrowseHeader = ({ 
  strainCount, 
  editMode, 
  onEditModeToggle
}: BrowseHeaderProps) => {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          {strainCount} strains
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditModeToggle}
          className="h-7 px-3 text-xs"
        >
          {editMode ? <Eye className="h-3 w-3 mr-1" /> : <Edit3 className="h-3 w-3 mr-1" />}
          {editMode ? 'View' : 'Edit'}
        </Button>
      </div>
    </div>
  );
};

export default BrowseHeader;
