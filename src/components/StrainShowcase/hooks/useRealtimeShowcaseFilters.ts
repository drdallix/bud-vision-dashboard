
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage real-time showcase filter synchronization
 * Listens for database changes to keep filters in sync across sessions
 */
export const useRealtimeShowcaseFilters = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

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
          // Update timestamp to trigger filter refresh
          setLastUpdateTime(Date.now());
        }
      )
      .subscribe((status) => {
        console.log('Showcase filter subscription status:', status);
      });

    return () => {
      console.log('Cleaning up showcase filter subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    lastUpdateTime
  };
};
