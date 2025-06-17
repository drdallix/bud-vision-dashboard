
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { convertDatabaseScansToStrains } from '@/data/converters/strainConverters';
import { DatabaseScan } from '@/types/strain';

export const useRealtimeStrains = (includeAllStrains = false) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time subscription for strains');
    
    const channel = supabase
      .channel('strain-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          console.log('Real-time strain change detected:', payload);
          
          const queryKeys = includeAllStrains 
            ? [['strains-all'], ['strains-user']]
            : [['strains-user']];

          // Invalidate relevant queries to trigger refetch
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });

          // For immediate updates, we can also update the cache directly
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedScan = payload.new as DatabaseScan;
            const updatedStrain = convertDatabaseScansToStrains([updatedScan])[0];
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                
                return oldData.map((strain: any) => 
                  strain.id === updatedStrain.id ? updatedStrain : strain
                );
              });
            });
          }

          // Handle DELETE events
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.filter((strain: any) => strain.id !== deletedId);
              });
            });
          }

          // Handle INSERT events
          if (payload.eventType === 'INSERT' && payload.new) {
            const newScan = payload.new as DatabaseScan;
            const newStrain = convertDatabaseScansToStrains([newScan])[0];
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return [newStrain, ...oldData];
              });
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, includeAllStrains]);
};
