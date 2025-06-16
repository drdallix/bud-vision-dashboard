
import { Package, PackageX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import BatchPriceModal from './components/BatchPriceModal';
import { BadgeDollarSign } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onBatchStockUpdate: (strainIds: string[], inStock: boolean) => Promise<boolean>;
  selectedStrainIds: string[];
}

const BatchActions = ({ 
  selectedCount, 
  onClearSelection, 
  onSelectAll, 
  isAllSelected, 
  onBatchStockUpdate, 
  selectedStrainIds 
}: BatchActionsProps) => {
  const [showBatchPrice, setShowBatchPrice] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleInStock = async () => {
    setLoading(true);
    await onBatchStockUpdate(selectedStrainIds, true);
    setLoading(false);
  };

  const handleOutOfStock = async () => {
    setLoading(true);
    await onBatchStockUpdate(selectedStrainIds, false);
    setLoading(false);
  };

  const handleBatchPrice = async (nowPrice: number, wasPrice?: number | null) => {
    console.log('Batch price update:', { nowPrice, wasPrice, selectedStrainIds });
    // This would need integration with price service
  };

  return (
    <div className="flex items-center gap-2 px-1 py-2 bg-muted/50 rounded-md">
      <span className="text-xs text-muted-foreground font-medium">
        {selectedCount} selected
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={handleInStock}
        disabled={loading}
        className="h-7 px-2 text-xs"
      >
        <Package className="h-3 w-3 mr-1" />
        In Stock
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOutOfStock}
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
        variant="outline"
        onClick={onSelectAll}
        className="h-7 px-2 text-xs"
      >
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="h-7 w-7 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
      <BatchPriceModal
        open={showBatchPrice}
        setOpen={setShowBatchPrice}
        onApply={handleBatchPrice}
      />
    </div>
  );
};

export default BatchActions;
