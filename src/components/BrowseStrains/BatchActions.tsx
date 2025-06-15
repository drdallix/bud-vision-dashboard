
import { Package, PackageX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import BatchPriceModal from './components/BatchPriceModal';
import { BadgeDollarSign } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  onInStock: () => void;
  onOutOfStock: () => void;
  onClear: () => void;
  loading: boolean;
  onBatchPrice: (nowPrice: number, wasPrice?: number | null) => Promise<void>;
}

const BatchActions = ({ selectedCount, onInStock, onOutOfStock, onClear, loading, onBatchPrice }: BatchActionsProps) => {
  const [showBatchPrice, setShowBatchPrice] = useState(false);

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
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={() => setShowBatchPrice(true)}
        disabled={loading}
      >
        <BadgeDollarSign className="h-3 w-3 mr-1" />
        Set Price
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        className="h-7 w-7 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
      <BatchPriceModal
        open={showBatchPrice}
        setOpen={setShowBatchPrice}
        onApply={onBatchPrice}
      />
    </div>
  );
};

export default BatchActions;
