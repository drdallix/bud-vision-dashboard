
import { useState, useEffect } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseControls from './ShowcaseControls';
import FullscreenShowcaseSlide from './FullscreenShowcaseSlide';
import { TransitionMode } from './FullscreenTransitions';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';
import { useAdvancedFilters } from '@/components/BrowseStrains/hooks/useAdvancedFilters';
import MobileFilters from '@/components/BrowseStrains/MobileFilters';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({ onStrainSelect }: StrainShowcaseProps) => {
  const { strains, isLoading } = useRealtimeStrainStore(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

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

  const currentStrain = filteredStrains[currentIndex];

  // Sync carousel with current index
  useEffect(() => {
    if (carouselApi && currentIndex !== undefined) {
      carouselApi.scrollTo(currentIndex);
    }
  }, [carouselApi, currentIndex]);

  // Listen to carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const selectedIndex = carouselApi.selectedScrollSnap();
      setCurrentIndex(selectedIndex);
    };

    carouselApi.on('select', onSelect);
    return () => carouselApi.off('select', onSelect);
  }, [carouselApi]);

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || filteredStrains.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % filteredStrains.length;
        if (carouselApi) {
          carouselApi.scrollTo(nextIndex);
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, filteredStrains.length, carouselApi]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    if (carouselApi) {
      carouselApi.scrollTo(0);
    }
  }, [filteredStrains.length, carouselApi]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % filteredStrains.length;
    setCurrentIndex(nextIndex);
    if (carouselApi) {
      carouselApi.scrollTo(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + filteredStrains.length) % filteredStrains.length;
    setCurrentIndex(prevIndex);
    if (carouselApi) {
      carouselApi.scrollTo(prevIndex);
    }
  };

  const handleNavigateToIndex = (index: number) => {
    setCurrentIndex(index);
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

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
      <div className="space-y-4">
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">No strains match your current filters</p>
        </div>
      </div>
    );
  }

  if (isFullscreen && currentStrain) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <FullscreenShowcaseSlide
          strain={currentStrain}
          isActive={true}
          index={currentIndex}
          transitionMode={transitionMode}
        />
        <button
          onClick={handleExitFullscreen}
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10 transition-colors"
          aria-label="Exit fullscreen"
        >
          ✕
        </button>
      </div>
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

      {/* Mobile-First Card Carousel */}
      <div className="relative">
        <Carousel 
          className="w-full"
          setApi={setCarouselApi}
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {filteredStrains.map((strain, index) => (
              <CarouselItem key={strain.id} className="pl-2 md:pl-4 basis-full">
                <div className="min-h-[600px] bg-gradient-to-br from-background to-muted/20 rounded-2xl p-4 md:p-6 shadow-lg">
                  <ShowcaseSlide
                    strain={strain}
                    isActive={index === currentIndex}
                    index={index}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Desktop Navigation Arrows */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-12 top-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2" />
          </div>
        </Carousel>

        {/* Mobile Swipe Indicators/Dots */}
        <div className="flex justify-center mt-4 space-x-2 md:hidden">
          {filteredStrains.slice(0, Math.min(10, filteredStrains.length)).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-green-600 scale-150' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => handleNavigateToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          {filteredStrains.length > 10 && (
            <span className="text-xs text-muted-foreground ml-2">
              +{filteredStrains.length - 10}
            </span>
          )}
        </div>
      </div>

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
