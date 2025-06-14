
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Strain } from '@/types/strain';
import { convertDatabaseScanToStrain, convertStrainForDatabase } from '@/utils/strainConverters';

export const useScans = () => {
  const [scans, setScans] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScans = async () => {
    if (!user) {
      setScans([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false });

      if (error) throw error;

      const strains = (data || []).map(convertDatabaseScanToStrain);
      setScans(strains);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error loading scans",
        description: "Failed to load your scan history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addScan = async (strain: Strain) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your scans.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dbData = convertStrainForDatabase(strain, user.id);
      
      const { data, error } = await supabase
        .from('scans')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      const newStrain = convertDatabaseScanToStrain(data);
      setScans(prev => [newStrain, ...prev]);
      
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
    }
  };

  useEffect(() => {
    fetchScans();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('scans-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scans',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time scan update:', payload);
            fetchScans(); // Refetch data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    scans,
    loading,
    addScan,
    refetch: fetchScans,
  };
};
