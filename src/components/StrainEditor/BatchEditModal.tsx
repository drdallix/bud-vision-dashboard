
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Package } from 'lucide-react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';

interface BatchEditModalProps {
  strains: Strain[];
  open: boolean;
  onClose: () => void;
  onBatchUpdate: (updates: BatchUpdateData) => Promise<void>;
}

interface BatchUpdateData {
  stockStatus?: boolean;
  priceUpdate?: {
    nowPrice: number;
    wasPrice?: number | null;
  };
  typeUpdate?: 'Indica' | 'Sativa' | 'Hybrid';
}

const VALID_PRICES = [30, 40, 50, 60, 80, 100, 120, 200, 300];

const BatchEditModal = ({ strains, open, onClose, onBatchUpdate }: BatchEditModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [updateStock, setUpdateStock] = useState(false);
  const [stockStatus, setStockStatus] = useState(true);
  const [updatePrice, setUpdatePrice] = useState(false);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [wasPrice, setWasPrice] = useState<number | null>(null);
  const [updateType, setUpdateType] = useState(false);
  const [strainType, setStrainType] = useState<'Indica' | 'Sativa' | 'Hybrid' | null>(null);
  
  const { toast } = useToast();

  const handleBatchUpdate = async () => {
    const updates: BatchUpdateData = {};
    
    if (updateStock) {
      updates.stockStatus = stockStatus;
    }
    
    if (updatePrice && newPrice) {
      updates.priceUpdate = {
        nowPrice: newPrice,
        wasPrice: wasPrice,
      };
    }
    
    if (updateType && strainType) {
      updates.typeUpdate = strainType;
    }

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No Updates Selected",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onBatchUpdate(updates);
      toast({
        title: "Batch Update Complete",
        description: `Successfully updated ${strains.length} strains.`,
      });
      onClose();
    } catch (error) {
      console.error('Batch update failed:', error);
      toast({
        title: "Batch Update Failed",
        description: "Some updates may have failed. Please check individual strains.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUpdateStock(false);
    setStockStatus(true);
    setUpdatePrice(false);
    setNewPrice(null);
    setWasPrice(null);
    setUpdateType(false);
    setStrainType(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Batch Edit Strains ({strains.length} selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Strains Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected Strains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {strains.slice(0, 10).map((strain) => (
                  <Badge key={strain.id} variant="outline">
                    {strain.name}
                  </Badge>
                ))}
                {strains.length > 10 && (
                  <Badge variant="secondary">+{strains.length - 10} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-stock">Update stock status for all selected strains</Label>
                <Switch
                  id="update-stock"
                  checked={updateStock}
                  onCheckedChange={setUpdateStock}
                  disabled={isLoading}
                />
              </div>
              
              {updateStock && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="stock-status">Set all strains to:</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stockStatus ? 'In Stock' : 'Out of Stock'}</span>
                    <Switch
                      id="stock-status"
                      checked={stockStatus}
                      onCheckedChange={setStockStatus}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-price">Add price point to all selected strains</Label>
                <Switch
                  id="update-price"
                  checked={updatePrice}
                  onCheckedChange={setUpdatePrice}
                  disabled={isLoading}
                />
              </div>
              
              {updatePrice && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Price</Label>
                    <Select
                      value={newPrice?.toString() || ''}
                      onValueChange={(value) => setNewPrice(Number(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_PRICES.map((price) => (
                          <SelectItem key={price} value={price.toString()}>
                            ${price}/oz
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Was Price (optional)</Label>
                    <Select
                      value={wasPrice?.toString() || ''}
                      onValueChange={(value) => setWasPrice(value ? Number(value) : null)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select was price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No previous price</SelectItem>
                        {VALID_PRICES.map((price) => (
                          <SelectItem key={price} value={price.toString()}>
                            ${price}/oz
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strain Type Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strain Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-type">Update strain type for all selected strains</Label>
                <Switch
                  id="update-type"
                  checked={updateType}
                  onCheckedChange={setUpdateType}
                  disabled={isLoading}
                />
              </div>
              
              {updateType && (
                <Select
                  value={strainType || ''}
                  onValueChange={(value) => setStrainType(value as 'Indica' | 'Sativa' | 'Hybrid')}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strain type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indica">🌙 Indica</SelectItem>
                    <SelectItem value="Sativa">☀️ Sativa</SelectItem>
                    <SelectItem value="Hybrid">🌓 Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleBatchUpdate}
              disabled={isLoading || (!updateStock && !updatePrice && !updateType)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Updating...' : `Update ${strains.length} Strains`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchEditModal;
