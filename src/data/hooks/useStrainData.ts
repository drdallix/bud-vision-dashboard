
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StrainService } from '@/services/strainService';
import { convertDatabaseScansToStrains } from '@/data/converters/strainConverters';
import { Strain } from '@/types/strain';
import { useEffect, useMemo, useCallback } from 'react';

export const useStrainData = (includeAllStrains = false) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => 
    includeAllStrains ? ['strains-all'] : ['strains-user', user?.id],
    [includeAllStrains, user?.id]
  );

  const { data: strains = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('useStrainData: Fetching strains for user:', user?.id);
      
      if (!includeAllStrains && !user) {
        console.log('useStrainData: No user, returning empty array');
        return [];
      }
      
      try {
        const rawScans = includeAllStrains 
          ? await StrainService.getAllStrains()
          : await StrainService.getUserStrains(user!.id);
        
        console.log('useStrainData: Raw scans fetched:', rawScans.length);
        
        if (rawScans.length === 0) {
          console.log('useStrainData: No scans found in database');
          return [];
        }
        
        const convertedStrains = convertDatabaseScansToStrains(rawScans);
        console.log('useStrainData: Converted strains:', convertedStrains.length);
        
        return convertedStrains;
      } catch (fetchError) {
        console.error('useStrainData: Error fetching strains:', fetchError);
        throw fetchError;
      }
    },
    enabled: includeAllStrains || !!user,
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds (reduced from 30)
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes (reduced from 5)
    retry: 2, // Reduce retry attempts
  });

  // Show error toast only once per error
  useEffect(() => {
    if (error) {
      console.error('useStrainData: Query error:', error);
      toast({
        title: "Error loading strains",
        description: "Failed to load strain information.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const updateStrainInCache = useCallback((strainId: string, updates: Partial<Strain>) => {
    console.log('useStrainData: Updating strain in cache:', strainId);
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      const updated = oldData.map(strain => 
        strain.id === strainId ? { ...strain, ...updates } : strain
      );
      console.log('useStrainData: Cache updated, strain count:', updated.length);
      return updated;
    });
    
    // Also invalidate to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const addStrainToCache = useCallback((newStrain: Strain) => {
    console.log('useStrainData: Adding strain to cache:', newStrain.name);
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      // Check if strain already exists to prevent duplicates
      const exists = oldData.some(strain => 
        strain.id === newStrain.id || 
        (strain.name === newStrain.name && strain.userId === newStrain.userId)
      );
      
      if (exists) {
        console.log('useStrainData: Strain already exists, not adding duplicate');
        return oldData;
      }
      
      const updated = [newStrain, ...oldData];
      console.log('useStrainData: Strain added to cache, new total:', updated.length);
      return updated;
    });
    
    // Force immediate refetch to ensure database consistency
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const removeStrainFromCache = useCallback((strainId: string) => {
    console.log('useStrainData: Removing strain from cache:', strainId);
    queryClient.setQueryData(queryKey, (oldData: Strain[] = []) => {
      return oldData.filter(strain => strain.id !== strainId);
    });
  }, [queryClient, queryKey]);

  const refetch = useCallback(() => {
    console.log('useStrainData: Manual refetch triggered');
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  console.log('useStrainData: Returning data - strains:', strains.length, 'loading:', isLoading, 'error:', !!error);

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
