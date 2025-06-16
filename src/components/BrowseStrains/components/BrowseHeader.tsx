
import { Search, Filter, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      {/* Search and action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search strains..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
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
