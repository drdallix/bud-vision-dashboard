
import { useState, useCallback } from 'react';
import { Strain } from '@/types/strain';
import { useToast } from '@/hooks/use-toast';

export const useFavoriteStrains = () => {
  const [favoriteStrains, setFavoriteStrains] = useState<Strain[]>([]);
  const { toast } = useToast();

  const toggleFavorite = useCallback((strain: Strain) => {
    setFavoriteStrains(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === strain.id);
      
      if (isAlreadyFavorite) {
        toast({
          title: "Removed from favorites",
          description: `${strain.name} removed from comparison`,
          duration: 1500,
        });
        return prev.filter(fav => fav.id !== strain.id);
      } else {
        toast({
          title: "Added to favorites",
          description: `${strain.name} added to comparison`,
          duration: 1500,
        });
        return [...prev, strain];
      }
    });
  }, [toast]);

  const isFavorite = useCallback((strainId: string) => {
    return favoriteStrains.some(fav => fav.id === strainId);
  }, [favoriteStrains]);

  const clearFavorites = useCallback(() => {
    setFavoriteStrains([]);
    toast({
      title: "Favorites cleared",
      description: "All strains removed from comparison",
      duration: 1500,
    });
  }, [toast]);

  return {
    favoriteStrains,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
};
