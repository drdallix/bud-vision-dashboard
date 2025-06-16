
import React, { useState } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import { TransitionMode } from './FullscreenTransitions';
import { useAdvancedFilters } from '@/components/BrowseStrains/hooks/useAdvancedFilters';
import MobileFilters from '@/components/BrowseStrains/MobileFilters';
import { useShowcaseCarousel } from './hooks/useShowcaseCarousel';
import { useRealtimeShowcaseFilters } from './hooks/useRealtimeShowcaseFilters';
import { useFavoriteStrains } from '@/hooks/useFavoriteStrains';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import FullscreenView from './components/FullscreenView';
import EmptyState from './components/EmptyState';
import FavoritesComparison from './components/FavoritesComparison';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({
  onStrainSelect
}: StrainShowcaseProps) => {
  const {
    strains,
    isLoading
  } = useRealtimeStrainStore(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');

  // Real-time filter synchronization
  const { lastUpdateTime } = useRealtimeShowcaseFilters();

  // Favorites management
  const {
    favoriteStrains,
    toggleFavorite,
    isFavorite,
    clearFavorites
  } = useFavoriteStrains();

  // Use the same advanced filters as BrowseStrains with real-time sync
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
    selectedEffects,
    selectedFlavors,
    thcRange,
    setThcRange,
    handleEffectToggle,
    handleFlavorToggle,
    filteredStrains: baseFilteredStrains,
    clearAllFilters,
    hasActiveFilters
  } = useAdvancedFilters(strains);

  // Enhanced filtered strains with real-time update trigger
  const filteredStrains = React.useMemo(() => {
    console.log('Refreshing showcase filters due to real-time update:', lastUpdateTime);
    return baseFilteredStrains;
  }, [baseFilteredStrains, lastUpdateTime]);

  // Use the carousel hook with real-time synchronized strains
  const {
    currentIndex,
    setCurrentIndex,
    carouselApi,
    setCarouselApi,
    handleNext,
    handlePrevious,
    handleNavigateToIndex
  } = useShowcaseCarousel({
    filteredStrains,
    isPlaying
  });

  const currentStrain = filteredStrains[currentIndex];

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (filteredStrains.length === 0) {
    return (
      <EmptyState
        strains={strains}
        filterType={filterType}
        sortBy={sortBy as 'name' | 'thc' | 'recent'}
        selectedEffects={selectedEffects}
        selectedFlavors={selectedFlavors}
        thcRange={thcRange}
        stockFilter={stockFilter}
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
        onEffectToggle={handleEffectToggle}
        onFlavorToggle={handleFlavorToggle}
        onThcRangeChange={setThcRange}
        onStockFilterChange={setStockFilter}
        onClearAll={clearAllFilters}
      />
    );
  }

  if (isFullscreen && currentStrain) {
    return (
      <FullscreenView
        currentStrain={currentStrain}
        currentIndex={currentIndex}
        transitionMode={transitionMode}
        onExitFullscreen={handleExitFullscreen}
        filteredStrains={filteredStrains}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onNavigateToIndex={handleNavigateToIndex}
        setTransitionMode={setTransitionMode}
      />
    );
  }

  return (
    <div className="space-y-4">
      <MobileFilters
        strains={strains}
        filterType={filterType}
        sortBy={sortBy as 'name' | 'thc' | 'recent'}
        selectedEffects={selectedEffects}
        selectedFlavors={selectedFlavors}
        thcRange={thcRange}
        stockFilter={stockFilter}
        onFilterChange={setFilterType}
        onSortChange={setSortBy}
        onEffectToggle={handleEffectToggle}
        onFlavorToggle={handleFlavorToggle}
        onThcRangeChange={setThcRange}
        onStockFilterChange={setStockFilter}
        onClearAll={clearAllFilters}
      />

      {/* Real-time synchronized ShowcaseCarousel with favorites integration */}
      <div className="space-y-4">
        <ShowcaseCarousel
          filteredStrains={filteredStrains}
          currentIndex={currentIndex}
          setCarouselApi={setCarouselApi}
          onNavigateToIndex={handleNavigateToIndex}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

        {/* Compact mobile-first controls */}
        <div className="flex items-center justify-center gap-3 p-3 backdrop-blur-sm rounded-lg bg-teal-800">
          <button
            onClick={handlePrevious}
            disabled={filteredStrains.length <= 1}
            className="p-2 rounded-full transition-colors active:scale-95 min-h-[44px] min-w-[44px] bg-sky-600 hover:bg-sky-500"
          >
            ←
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={filteredStrains.length <= 1}
            className="p-2 rounded-full text-white transition-colors active:scale-95 min-h-[44px] min-w-[44px] bg-green-600 hover:bg-green-500"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={filteredStrains.length <= 1}
            className="p-2 rounded-full transition-colors active:scale-95 min-h-[44px] min-w-[44px] bg-sky-600 hover:bg-sky-500"
          >
            →
          </button>
          
          <button
            onClick={handleFullscreen}
            className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors active:scale-95 min-h-[44px] min-w-[44px]"
            disabled={filteredStrains.length <= 1}
          >
            ⛶
          </button>
          
          <span className="text-sm ml-2 text-slate-50">
            {currentIndex + 1} / {filteredStrains.length}
          </span>
        </div>
      </div>

      {/* Favorites Comparison Table */}
      <FavoritesComparison
        favoriteStrains={favoriteStrains}
        onRemoveFavorite={toggleFavorite}
        onClearAll={clearFavorites}
      />
    </div>
  );
};

export default StrainShowcase;
