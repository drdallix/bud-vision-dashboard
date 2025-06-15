
import { Package, PackageX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BatchActionsProps {
  selectedCount: number;
  onInStock: () => void;
  onOutOfStock: () => void;
  onClear: () => void;
  loading: boolean;
}

const BatchActions = ({ selectedCount, onInStock, onOutOfStock, onClear, loading }: BatchActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-1 py-2 bg-muted/50 rounded-md">
      <span className="text-xs text-muted-foreground font-medium">
        {selectedCount} selected
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={onInStock}
        disabled={loading}
        className="h-7 px-2 text-xs"
      >
        <Package className="h-3 w-3 mr-1" />
        In Stock
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onOutOfStock}
        disabled={loading}
        className="h-7 px-2 text-xs"
      >
        <PackageX className="h-3 w-3 mr-1" />
        Out
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="h-7 w-7 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default BatchActions;
