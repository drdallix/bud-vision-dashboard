
import { useState } from 'react';
import { useStrainPrices } from '@/hooks/useStrainPrices';
import { useToast } from '@/hooks/use-toast';

export function usePriceEditor(strainId: string) {
  const { addPricePoint, updatePricePoint, deletePricePoint, refetch } = useStrainPrices(strainId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addPrice = async (nowPrice: number, wasPrice?: number | null) => {
    setLoading(true);
    try {
      await addPricePoint({ nowPrice, wasPrice });
      toast({ title: "Price added", variant: "default" });
      refetch();
    } catch (e: any) {
      toast({ title: "Could not add price", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const updatePrice = async (id: string, nowPrice: number, wasPrice?: number | null) => {
    setLoading(true);
    try {
      await updatePricePoint({ id, nowPrice, wasPrice });
      toast({ title: "Price updated", variant: "default" });
      refetch();
    } catch (e: any) {
      toast({ title: "Could not update price", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const deletePrice = async (id: string) => {
    setLoading(true);
    try {
      await deletePricePoint(id);
      toast({ title: "Price deleted", variant: "default" });
      refetch();
    } catch (e: any) {
      toast({ title: "Could not delete price", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return { addPrice, updatePrice, deletePrice, loading };
}
