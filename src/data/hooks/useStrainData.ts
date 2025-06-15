
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StrainService } from '@/services/strainService';
import { convertDatabaseScansToStrains } from '@/data/converters/strainConverters';
import { Strain } from '@/types/strain';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStrainData = (includeAllStrains = false) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => 
    includeAllStrains ? ['strains-all'] : ['strains-user', user?.id],
    [includeAllStrains, user?.id]
  );

  const { data: strains = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const rawScans = includeAllStrains 
        ? await StrainService.getAllStrains()
        : user 
          ? await StrainService.getUserStrains(user.id)
          : [];
      
      return convertDatabaseScansToStrains(rawScans);
    },
    enabled: includeAllStrains || !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Cleanup function
  const cleanupChannel = useCallback(() => {
    if (channelRef.current && isSubscribedRef.current) {
      console.log('Cleaning up existing channel:', channelRef.current);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!includeAllStrains && !user) return;
    if (isSubscribedRef.current) return; // Prevent multiple subscriptions

    // Clean up any existing channel first
    cleanupChannel();

    // Create a unique channel name to avoid conflicts
    const channelName = includeAllStrains 
      ? `strains-all-${Date.now()}-${Math.random()}` 
      : `strains-user-${user!.id}-${Date.now()}-${Math.random()}`;

    console.log('Creating new channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
          ...(includeAllStrains ? {} : { filter: `user_id=eq.${user!.id}` })
        },
        (payload) => {
          console.log('Real-time strain update:', payload);
          
          // Invalidate and refetch data
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return () => {
      cleanupChannel();
    };
  }, [user?.id, includeAllStrains, cleanupChannel, queryClient, queryKey]);

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

  const updateStrainInCache = (strainId: string, updates: Partial<Strain>) => {
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      return oldData.map(strain => 
        strain.id === strainId ? { ...strain, ...updates } : strain
      );
    });
  };

  const addStrainToCache = (newStrain: Strain) => {
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      return [newStrain, ...oldData];
    });
  };

  const removeStrainFromCache = (strainId: string) => {
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      return oldData.filter(strain => strain.id !== strainId);
    });
  };

  return {
    strains,
    isLoading,
    error,
    updateStrainInCache,
    addStrainToCache,
    removeStrainFromCache,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
};
