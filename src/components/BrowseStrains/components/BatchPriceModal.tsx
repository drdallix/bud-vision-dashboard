
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BatchPriceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onApply: (nowPrice: number, wasPrice?: number | null) => Promise<void>;
}

const PRESET_PRICES = [30,40,50,60,80,100,120,200,300];

export default function BatchPriceModal({ open, setOpen, onApply }: BatchPriceModalProps) {
  const [nowPrice, setNowPrice] = useState<number | null>(null);
  const [wasPrice, setWasPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nowPrice) return;
    setLoading(true);
    await onApply(nowPrice, wasPrice);
    setLoading(false);
    setOpen(false);
    setNowPrice(null);
    setWasPrice(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Price for Selected Strains</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <select
            value={nowPrice ?? ''}
            onChange={e => setNowPrice(Number(e.target.value))}
            className="text-xs px-2 py-1 rounded border"
            disabled={loading}
          >
            <option value="">Now</option>
            {PRESET_PRICES.map((val) => (
              <option key={val} value={val}>${val}</option>
            ))}
          </select>
          <select
            value={wasPrice ?? ''}
            onChange={e => setWasPrice(e.target.value === '' ? null : Number(e.target.value))}
            className="text-xs px-2 py-1 rounded border"
            disabled={loading}
          >
            <option value="">No Was</option>
            {PRESET_PRICES.map((val) => (
              <option key={val} value={val}>${val}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !nowPrice}>Apply</Button>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
