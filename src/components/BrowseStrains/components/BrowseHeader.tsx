
import { Filter, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Strain } from '@/types/strain';
import BulkPrintButton from '@/components/BulkPrintButton';

interface BrowseHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  editMode: boolean;
  onEditModeToggle: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  showMobileFilters: boolean;
  onToggleMobileFilters: () => void;
  strains: Strain[];
}

const BrowseHeader = ({
  searchTerm,
  onSearchChange,
  editMode,
  onEditModeToggle,
  selectedCount,
  onClearSelection,
  showMobileFilters,
  onToggleMobileFilters,
  strains
}: BrowseHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Action buttons only */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleMobileFilters}
          className="sm:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        
        <BulkPrintButton 
          strains={strains}
          variant="outline"
          size="sm"
        />
        
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={onEditModeToggle}
        >
          <Edit className="h-4 w-4 mr-2" />
          {editMode ? "Done" : "Edit"}
        </Button>
      </div>

      {/* Selection status */}
      {editMode && selectedCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <span className="text-sm font-medium">
            {selectedCount} strain{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseHeader;
