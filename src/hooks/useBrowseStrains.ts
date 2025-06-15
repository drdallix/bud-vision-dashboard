import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { convertDatabaseScanToStrain } from '@/utils/strainConverters';
import { Strain, DatabaseScan } from '@/types/strain';
import { useEffect, useMemo } from 'react';
import { getDeterministicTHCRange } from '@/utils/thcGenerator';

export const useBrowseStrains = (searchTerm: string, filterType: string, sortBy: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch strains with React Query
  const { data: strains = [], isLoading, error } = useQuery({
    queryKey: ['browse-strains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertDatabaseScanToStrain);
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('strains-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          console.log('Real-time strain update:', payload);
          
          // Update cache optimistically
          queryClient.setQueryData(['browse-strains'], (oldData: Strain[] = []) => {
            if (payload.eventType === 'INSERT') {
              const newStrain = convertDatabaseScanToStrain(payload.new as DatabaseScan);
              return [newStrain, ...oldData];
            } else if (payload.eventType === 'UPDATE') {
              const updatedStrain = convertDatabaseScanToStrain(payload.new as DatabaseScan);
              return oldData.map(strain => 
                strain.id === updatedStrain.id ? updatedStrain : strain
              );
            } else if (payload.eventType === 'DELETE') {
              return oldData.filter(strain => strain.id !== (payload.old as DatabaseScan).id);
            }
            return oldData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Show error toast only once per error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading strains",
        description: "Failed to load strain information.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Memoize filtered and sorted results
  const filteredAndSortedStrains = useMemo(() => {
    return strains
      .filter(strain => {
        const effectNames = strain.effectProfiles.map(e => e.name);
        const flavorNames = strain.flavorProfiles.map(f => f.name);
        const matchesSearch = strain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            effectNames.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            flavorNames.some(flavor => flavor.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || strain.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          case 'thc': {
            // Sort by the average of the deterministic range!
            const avgA = ((getDeterministicTHCRange(a.name)[0] + getDeterministicTHCRange(a.name)[1]) / 2);
            const avgB = ((getDeterministicTHCRange(b.name)[0] + getDeterministicTHCRange(b.name)[1]) / 2);
            return avgB - avgA; // highest average THC first
          }
          case 'confidence':
            return b.confidence - a.confidence;
          default:
            return 0;
        }
      });
  }, [strains, searchTerm, filterType, sortBy]);

  const updateStrainInCache = (strainId: string, updates: Partial<Strain>) => {
    queryClient.setQueryData(['browse-strains'], (oldData: Strain[] = []) => {
      return oldData.map(strain => 
        strain.id === strainId ? { ...strain, ...updates } : strain
      );
    });
  };

  return {
    strains: filteredAndSortedStrains,
    allStrains: strains,
    isLoading,
    error,
    updateStrainInCache,
  };
};
