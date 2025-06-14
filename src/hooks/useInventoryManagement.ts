
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useInventoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateStockStatus = async (strainId: string, inStock: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage inventory.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scans')
        .update({ in_stock: inStock })
        .eq('id', strainId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Stock status updated",
        description: `Strain marked as ${inStock ? 'in stock' : 'out of stock'}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast({
        title: "Error updating stock",
        description: "Failed to update stock status. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const batchUpdateStock = async (strainIds: string[], inStock: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage inventory.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scans')
        .update({ in_stock: inStock })
        .in('id', strainIds)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Bulk update completed",
        description: `${strainIds.length} strains marked as ${inStock ? 'in stock' : 'out of stock'}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error batch updating stock:', error);
      toast({
        title: "Error updating stock",
        description: "Failed to update stock status. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStockStatus,
    batchUpdateStock,
    loading,
  };
};
