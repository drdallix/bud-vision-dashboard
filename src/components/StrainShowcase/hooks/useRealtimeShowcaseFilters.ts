
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeShowcaseFilters = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time filter synchronization for showcase');
    
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
          console.log('Real-time showcase filter change detected:', payload);
          
          // Update timestamp to trigger filter refresh
          setLastUpdateTime(Date.now());
          
          // Invalidate strain queries to refresh carousel
          queryClient.invalidateQueries({ queryKey: ['strains-all'] });
          queryClient.invalidateQueries({ queryKey: ['strains-user'] });
        }
      )
      .subscribe((status) => {
        console.log('Real-time showcase filter subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time showcase filter subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { lastUpdateTime };
};
