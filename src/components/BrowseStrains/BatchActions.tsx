
import { Package, PackageX } from 'lucide-react';
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
    <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
      <Button
        size="sm"
        variant="outline"
        onClick={onInStock}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Package className="h-4 w-4" />
        In Stock ({selectedCount})
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onOutOfStock}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <PackageX className="h-4 w-4" />
        Out of Stock ({selectedCount})
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
};

export default BatchActions;
