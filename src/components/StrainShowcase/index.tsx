import React, { useState, useEffect, useCallback } from 'react';
import { Strain } from '@/types/strain';
import { useStrainStore } from '@/stores/useStrainStore';
import { useAuth } from '@/contexts/AuthContext';
import { ShowcaseFilters } from './ShowcaseFilters';
import { ShowcaseCarousel } from './components/ShowcaseCarousel';
import { ShowcaseControls } from './components/ShowcaseControls';
import { FullscreenView } from './components/FullscreenView';
import { EmptyState } from './components/EmptyState';
import { useShowcaseCarousel } from './hooks/useShowcaseCarousel';
import { useRealtimeShowcaseFilters } from './hooks/useRealtimeShowcaseFilters';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({ onStrainSelect }: StrainShowcaseProps) => {
  const { strains } = useStrainStore(true);
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'thc' | 'recent'>('recent');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { lastUpdateTime } = useRealtimeShowcaseFilters();

  const filteredStrains = React.useMemo(() => {
    let filtered = strains;

    if (filterType !== 'all') {
      filtered = filtered.filter(strain => strain.type === filterType);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'thc':
          const thcA = a.thc || 0;
          const thcB = b.thc || 0;
          return thcB - thcA;
        case 'recent':
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [strains, filterType, sortBy, lastUpdateTime]);

  const {
    currentIndex,
    carouselApi,
    setCarouselApi,
    handleNext,
    handlePrevious,
    handleNavigateToIndex
  } = useShowcaseCarousel({ 
    filteredStrains, 
    isPlaying: isPlaying && !isFullscreen 
  });

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const isFavorite = useCallback((strainId: string) => {
    return favorites.includes(strainId);
  }, [favorites]);

  const handleToggleFavorite = (strain: Strain) => {
    const newFavorites = isFavorite(strain.id)
      ? favorites.filter(id => id !== strain.id)
      : [...favorites, strain.id];

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Strain Showcase
        </h2>
        <p className="text-muted-foreground">
          Explore our curated selection of premium strains.
        </p>
      </div>

      <ShowcaseFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        strainCount={filteredStrains.length}
      />

      {filteredStrains.length === 0 ? (
        <EmptyState 
          hasFilters={filterType !== 'all' || sortBy !== 'recent'} 
          onClearFilters={() => {
            setFilterType('all');
            setSortBy('recent');
          }}
        />
      ) : (
        <div className="space-y-6">
          {!isFullscreen ? (
            <>
              <ShowcaseCarousel
                filteredStrains={filteredStrains}
                currentIndex={currentIndex}
                setCarouselApi={setCarouselApi}
                onNavigateToIndex={handleNavigateToIndex}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
              <ShowcaseControls
                currentIndex={currentIndex}
                totalStrains={filteredStrains.length}
                isPlaying={false}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onPlayPause={() => {}}
                onFullscreen={() => setIsFullscreen(true)}
                showPlayback={false}
              />
            </>
          ) : (
            <FullscreenView
              strains={filteredStrains}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              onClose={() => setIsFullscreen(false)}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onStrainSelect={onStrainSelect}
            />
          )}
        </div>
      )}

      <div className="text-center text-muted-foreground mt-4">
        {user ? (
          <>
            Favorited Strains: {favorites.length}
          </>
        ) : (
          <>
            Sign in to save your favorite strains!
          </>
        )}
      </div>
    </div>
  );
};

export default StrainShowcase;
