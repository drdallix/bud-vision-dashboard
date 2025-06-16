
import { useState } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import ShowcaseControls from './ShowcaseControls';
import { TransitionMode } from './FullscreenTransitions';
import { useAdvancedFilters } from '@/components/BrowseStrains/hooks/useAdvancedFilters';
import MobileFilters from '@/components/BrowseStrains/MobileFilters';
import { useShowcaseCarousel } from './hooks/useShowcaseCarousel';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import FullscreenView from './components/FullscreenView';
import EmptyState from './components/EmptyState';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({ onStrainSelect }: StrainShowcaseProps) => {
  const { strains, isLoading } = useRealtimeStrainStore(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');

  // Use the same advanced filters as BrowseStrains
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
    filteredStrains,
    clearAllFilters,
    hasActiveFilters
  } = useAdvancedFilters(strains);

  // Use the carousel hook
  const {
    currentIndex,
    setCurrentIndex,
    carouselApi,
    setCarouselApi,
    handleNext,
    handlePrevious,
    handleNavigateToIndex
  } = useShowcaseCarousel({ filteredStrains, isPlaying });

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
        sortBy={sortBy}
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
      />
    );
  }

  return (
    <div className="space-y-6">
      <MobileFilters
        strains={strains}
        filterType={filterType}
        sortBy={sortBy}
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

      <ShowcaseCarousel
        filteredStrains={filteredStrains}
        currentIndex={currentIndex}
        setCarouselApi={setCarouselApi}
        onNavigateToIndex={handleNavigateToIndex}
      />

      <ShowcaseControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFullscreen={handleFullscreen}
        transitionMode={transitionMode}
        onTransitionChange={setTransitionMode}
        disabled={filteredStrains.length <= 1}
        total={filteredStrains.length}
        current={currentIndex}
        onNav={handleNavigateToIndex}
        currentStrain={currentStrain}
      />
    </div>
  );
};

export default StrainShowcase;
