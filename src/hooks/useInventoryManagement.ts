
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StrainService } from '@/services/strainService';

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
      console.log(`Updating stock status: ${strainId} -> ${inStock ? 'in stock' : 'out of stock'}`);
      
      // Perform the database update - real-time will handle UI updates
      await StrainService.updateStockStatus(strainId, user.id, inStock);

      console.log('Stock status updated successfully, real-time will sync UI');
      
      // Show immediate feedback toast
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
    if (!user || strainIds.length === 0) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage inventory.",
          variant: "destructive",
        });
      }
      return false;
    }

    setLoading(true);
    try {
      console.log(`Batch updating ${strainIds.length} strains to ${inStock ? 'in stock' : 'out of stock'}`);
      
      // Perform the database update - real-time will handle UI updates
      await StrainService.batchUpdateStock(strainIds, user.id, inStock);

      console.log('Batch stock update successful, real-time will sync UI');

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
