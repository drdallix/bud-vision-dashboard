
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
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Cleanup function
  const cleanupChannel = useCallback(() => {
    if (channelRef.current && isSubscribedRef.current) {
      console.log('Cleaning up existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  // Set up real-time subscription - with proper cleanup to prevent duplicates
  useEffect(() => {
    if (!includeAllStrains && !user) return;
    if (isSubscribedRef.current) return; // Prevent duplicate subscriptions

    // Clean up any existing channel first
    cleanupChannel();

    console.log('Setting up real-time subscription for:', includeAllStrains ? 'all strains' : `user ${user!.id}`);

    // Create a unique channel name to avoid conflicts
    const channelName = includeAllStrains ? 'scans-all-changes' : `scans-user-${user!.id}-changes`;

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
          console.log('Real-time strain update:', payload.eventType, payload);
          
          // Invalidate and refetch data immediately
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

    return cleanupChannel;
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

  const updateStrainInCache = useCallback((strainId: string, updates: Partial<Strain>) => {
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      const updated = oldData.map(strain => 
        strain.id === strainId ? { ...strain, ...updates } : strain
      );
      console.log('Updated strain in cache:', strainId, updated.length);
      return updated;
    });
    
    // Also invalidate to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addStrainToCache = useCallback((newStrain: Strain) => {
    console.log('Adding strain to cache:', newStrain.name);
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      // Check if strain already exists to prevent duplicates
      const exists = oldData.some(strain => strain.id === newStrain.id || strain.name === newStrain.name);
      if (exists) {
        console.log('Strain already exists in cache, not adding duplicate');
        return oldData;
      }
      const updated = [newStrain, ...oldData];
      console.log('Added strain to cache, new total:', updated.length);
      return updated;
    });
    
    // Also invalidate to ensure consistency
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const removeStrainFromCache = useCallback((strainId: string) => {
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      return oldData.filter(strain => strain.id !== strainId);
    });
  }, [queryClient, queryKey]);

  const refetch = useCallback(() => {
    console.log('Manual refetch triggered');
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    strains,
    isLoading,
    error,
    updateStrainInCache,
    addStrainToCache,
    removeStrainFromCache,
    refetch,
  };
};
