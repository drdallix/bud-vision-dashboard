
import React from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStrainPrices } from '@/hooks/useStrainPrices';
import { usePriceEditor } from '@/components/BrowseStrains/hooks/usePriceEditor';

interface StrainPricingFormProps {
  strainId: string;
  isLoading: boolean;
}

const VALID_PRICES = [30, 40, 50, 60, 80, 100, 120, 200, 300];

const StrainPricingForm = ({ strainId, isLoading }: StrainPricingFormProps) => {
  const { data: prices = [], isLoading: pricesLoading } = useStrainPrices(strainId);
  const { addPrice, updatePrice, deletePrice, loading: priceActionLoading } = usePriceEditor(strainId);

  const [newPriceNow, setNewPriceNow] = React.useState<number | null>(null);
  const [newPriceWas, setNewPriceWas] = React.useState<number | null>(null);

  const handleAddPrice = async () => {
    if (!newPriceNow) return;
    
    const success = await addPrice(newPriceNow, newPriceWas);
    if (success) {
      setNewPriceNow(null);
      setNewPriceWas(null);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this price point?');
    if (confirmed) {
      await deletePrice(priceId);
    }
  };

  const isFormLoading = isLoading || pricesLoading || priceActionLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Pricing Management</h3>
      </div>

      {/* Current Prices */}
      {prices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Price Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prices.map((price) => (
              <div key={price.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      ${price.nowPrice}/oz
                    </Badge>
                    {price.wasPrice && (
                      <Badge variant="outline" className="text-red-700 border-red-300 line-through">
                        was ${price.wasPrice}/oz
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePrice(price.id)}
                  disabled={isFormLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add New Price */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Price Point</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Price</label>
              <Select
                value={newPriceNow?.toString() || ''}
                onValueChange={(value) => setNewPriceNow(Number(value))}
                disabled={isFormLoading}
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
              <label className="text-sm font-medium">Was Price (optional)</label>
              <Select
                value={newPriceWas?.toString() || ''}
                onValueChange={(value) => setNewPriceWas(value ? Number(value) : null)}
                disabled={isFormLoading}
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

          <Button
            onClick={handleAddPrice}
            disabled={!newPriceNow || isFormLoading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {priceActionLoading ? 'Adding...' : 'Add Price Point'}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium text-blue-900 mb-2">Pricing Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Prices are per ounce (oz)</li>
            <li>• Use "Was Price" to show discounts or sales</li>
            <li>• Multiple price points can represent different quantities or quality grades</li>
            <li>• Changes are saved automatically</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrainPricingForm;
