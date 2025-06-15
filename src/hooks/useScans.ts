
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useStrainData } from '@/data/hooks/useStrainData';
import { StrainService } from '@/services/strainService';
import { convertStrainToDatabase, convertDatabaseScanToStrain } from '@/data/converters/strainConverters';
import { Strain } from '@/types/strain';

export const useScans = () => {
  const [addingStrain, setAddingStrain] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    strains: scans, 
    isLoading: loading, 
    addStrainToCache,
    refetch 
  } = useStrainData(false); // Get user-specific strains

  const addScan = async (strain: Strain) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your scans.",
        variant: "destructive",
      });
      return;
    }

    setAddingStrain(true);
    try {
      const dbData = convertStrainToDatabase(strain, user.id);
      const newScan = await StrainService.createStrain(dbData);
      const newStrain = convertDatabaseScanToStrain(newScan);
      
      addStrainToCache(newStrain);
      
      toast({
        title: "Scan saved!",
        description: `${strain.name} has been added to your scan history.`,
      });
    } catch (error) {
      console.error('Error saving scan:', error);
      toast({
        title: "Error saving scan",
        description: "Failed to save your scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingStrain(false);
    }
  };

  return {
    scans,
    loading: loading || addingStrain,
    addScan,
    refetch,
  };
};
