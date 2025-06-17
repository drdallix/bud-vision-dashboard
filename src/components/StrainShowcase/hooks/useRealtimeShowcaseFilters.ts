
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to manage real-time showcase filter synchronization
 * Listens for database changes to keep filters in sync across sessions
 */
export const useRealtimeShowcaseFilters = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time showcase filter subscription');
    
    const channel = supabase
      .channel('showcase-filter-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          console.log('Real-time showcase filter change detected:', payload.eventType);
          
          // Force invalidate all strain queries to trigger immediate refresh
          queryClient.invalidateQueries({ queryKey: ['strains-all'] });
          queryClient.invalidateQueries({ queryKey: ['strains-user'] });
          
          // Update timestamp to trigger filter refresh
          const newTime = Date.now();
          console.log('Refreshing showcase filters due to real-time update:', newTime);
          setLastUpdateTime(newTime);
        }
      )
      .subscribe((status) => {
        console.log('Showcase filter subscription status:', status);
      });

    return () => {
      console.log('Cleaning up showcase filter subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const forceRefresh = useCallback(() => {
    const newTime = Date.now();
    console.log('Manual showcase filter refresh triggered:', newTime);
    setLastUpdateTime(newTime);
    queryClient.invalidateQueries({ queryKey: ['strains-all'] });
    queryClient.invalidateQueries({ queryKey: ['strains-user'] });
  }, [queryClient]);

  return {
    lastUpdateTime,
    forceRefresh
  };
};
