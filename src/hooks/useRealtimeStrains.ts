import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { convertDatabaseScansToStrains } from '@/data/converters/strainConverters';
import { DatabaseScan } from '@/types/strain';

export const useRealtimeStrains = (
  includeAllStrains = false, 
  onRefresh?: (isRefreshing: boolean) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up enhanced real-time subscription for strains');
    
    const channel = supabase
      .channel('strain-changes-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          console.log('Real-time strain change detected:', payload.eventType, payload);
          
          // Show refresh indicator
          if (onRefresh) {
            onRefresh(true);
          }
          
          const queryKeys = includeAllStrains 
            ? [['strains-all'], ['strains-user']]
            : [['strains-user']];

          // For immediate updates, update the cache directly first
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedScan = payload.new as DatabaseScan;
            const updatedStrain = convertDatabaseScansToStrains([updatedScan])[0];
            
            console.log('Applying real-time update to cache:', updatedStrain.name);
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                
                return oldData.map((strain: any) => 
                  strain.id === updatedStrain.id ? updatedStrain : strain
                );
              });
            });
          }

          // Handle DELETE events
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            
            console.log('Applying real-time deletion to cache:', deletedId);
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.filter((strain: any) => strain.id !== deletedId);
              });
            });
          }

          // Handle INSERT events
          if (payload.eventType === 'INSERT' && payload.new) {
            const newScan = payload.new as DatabaseScan;
            const newStrain = convertDatabaseScansToStrains([newScan])[0];
            
            console.log('Applying real-time insertion to cache:', newStrain.name);
            
            queryKeys.forEach(queryKey => {
              queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                // Check if strain already exists to prevent duplicates
                const exists = oldData.some((strain: any) => strain.id === newStrain.id);
                if (exists) return oldData;
                return [newStrain, ...oldData];
              });
            });
          }

          // Invalidate queries to ensure consistency (but cache updates provide immediate feedback)
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });

          // Hide refresh indicator after a brief delay
          if (onRefresh) {
            setTimeout(() => onRefresh(false), 500);
          }
        }
      )
      .subscribe((status) => {
        console.log('Enhanced real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up enhanced real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, includeAllStrains, onRefresh]);
};