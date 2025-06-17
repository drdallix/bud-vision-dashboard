
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import { usePriceEditor } from '../hooks/usePriceEditor';
import { usePriceStore } from '@/stores/usePriceStore';
import { useStrainPrices } from '@/hooks/useStrainPrices';

const PRESET_PRICES = [30, 40, 50, 60, 80, 100, 120, 200, 300];

interface StrainPriceEditorProps {
  strainId: string;
  prices?: any[]; // Legacy prop, now ignored
  disabled?: boolean;
}

const StrainPriceEditor = ({
  strainId,
  disabled
}: StrainPriceEditorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nowPrice, setNowPrice] = useState<number | null>(null);
  const [wasPrice, setWasPrice] = useState<number | null>(null);

  // Use both the centralized price store and hook for maximum reliability
  const { getOptimisticPrices } = usePriceStore();
  const {
    prices: fetchedPrices,
    isLoading: pricesLoading
  } = useStrainPrices(strainId);
  
  // Use optimistic prices if available, otherwise use fetched prices
  const optimisticPrices = getOptimisticPrices(strainId);
  const prices = optimisticPrices || fetchedPrices;

  const {
    addPrice,
    updatePrice,
    deletePrice,
    loading
  } = usePriceEditor(strainId);

  const startAdd = () => {
    setNowPrice(null);
    setWasPrice(null);
    setIsAdding(true);
    setEditingId(null);
  };

  const startEdit = (price: any) => {
    setEditingId(price.id);
    setNowPrice(price.nowPrice);
    setWasPrice(price.wasPrice ?? null);
    setIsAdding(false);
  };

  const cancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNowPrice(null);
    setWasPrice(null);
  };

  const handleSave = async () => {
    if (!nowPrice) return;
    if (editingId) {
      await updatePrice(editingId, nowPrice, wasPrice);
      cancel();
    } else {
      await addPrice(nowPrice, wasPrice);
      cancel();
    }
  };

  return <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {prices.map(p => editingId === p.id ? <div key={p.id} className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
              <select value={nowPrice ?? ''} onChange={e => setNowPrice(Number(e.target.value))} className="text-xs px-1 py-0.5 rounded border mr-1" disabled={loading}>
                <option value="">Now</option>
                {PRESET_PRICES.map(val => <option key={val} value={val}>${val}</option>)}
              </select>
              <select value={wasPrice ?? ''} onChange={e => setWasPrice(e.target.value === '' ? null : Number(e.target.value))} className="text-xs px-1 py-0.5 rounded border mr-1" disabled={loading}>
                <option value="">No Was</option>
                {PRESET_PRICES.map(val => <option key={val} value={val}>${val}</option>)}
              </select>
              <Button size="sm" onClick={handleSave} disabled={loading || !nowPrice} className="px-2 h-6">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={cancel} variant="ghost" className="px-2 h-6">
                Cancel
              </Button>
            </div> : <Badge key={p.id} className="text-xs bg-green-200 text-green-900 border-green-400 flex items-center gap-1">
              {p.wasPrice && <span className="line-through mr-1 text-gray-400">${p.wasPrice}</span>}
              ${p.nowPrice}
              <Button size="icon" variant="ghost" onClick={() => startEdit(p)} disabled={disabled || loading} className="ml-0.5 p-0 h-4 w-4">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deletePrice(p.id)} disabled={disabled || loading} className="ml-0.5 p-0 h-4 w-4">
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </Badge>)}
        {/* New price */}
        {isAdding ? <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
            <select value={nowPrice ?? ''} onChange={e => setNowPrice(Number(e.target.value))} disabled={loading} className="text-xs px-1 py-0.5 rounded border mr-1 text-black ">
              <option value="">Now</option>
              {PRESET_PRICES.map(val => <option key={val} value={val}>${val}</option>)}
            </select>
            <select value={wasPrice ?? ''} onChange={e => setWasPrice(e.target.value === '' ? null : Number(e.target.value))} disabled={loading} className="text-xs px-1 py-0.5 rounded border mr-1 text-black ">
              <option value="">No Was</option>
              {PRESET_PRICES.map(val => <option key={val} value={val}>${val}</option>)}
            </select>
            <Button size="sm" onClick={handleSave} disabled={loading || !nowPrice} className="px-2 h-6">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={cancel} variant="ghost" className="px-2 h-6">
              Cancel
            </Button>
          </div> : <Button size="sm" onClick={startAdd} disabled={disabled || isAdding || loading} className="h-6 px-2 text-xs">
            <Plus className="h-4 w-4" /> Add Price
          </Button>}
      </div>
    </div>;
};

export default StrainPriceEditor;
