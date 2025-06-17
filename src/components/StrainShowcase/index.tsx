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
import { Skeleton } from '@/components/ui/skeleton';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({
  onStrainSelect
}: StrainShowcaseProps) => {
  const {
    strains,
    isLoading,
    isRefreshing
  } = useRealtimeStrainStore(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');

  // Real-time filter synchronization with forced refresh capability
  const { lastUpdateTime, forceRefresh } = useRealtimeShowcaseFilters();

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

  // Enhanced filtered strains with real-time update trigger and forced refresh on changes
  const filteredStrains = React.useMemo(() => {
    console.log('Refreshing showcase filters due to real-time update:', lastUpdateTime);
    console.log('Current strains count:', strains.length, 'Filtered count:', baseFilteredStrains.length);
    
    // Force a refresh if we detect inconsistencies
    if (strains.length > 0 && baseFilteredStrains.length === 0 && !hasActiveFilters) {
      console.log('Detected potential filter sync issue, forcing refresh');
      setTimeout(() => forceRefresh(), 100);
    }
    
    return baseFilteredStrains;
  }, [baseFilteredStrains, lastUpdateTime, strains.length, hasActiveFilters, forceRefresh]);

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

  // Show skeleton loading during refresh for seamless UX
  if (isLoading || isRefreshing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center gap-2 mb-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-background to-muted/20 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
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