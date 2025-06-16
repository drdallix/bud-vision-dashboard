
import { useState, useEffect, useRef } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseControls from './ShowcaseControls';
import ShowcaseFilters from './ShowcaseFilters';
import FullscreenGallery from './FullscreenGallery';
import { TransitionMode } from './FullscreenTransitions';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';

interface StrainShowcaseProps {
  onStrainSelect?: (strain: Strain) => void;
}

const StrainShowcase = ({ onStrainSelect }: StrainShowcaseProps) => {
  const { strains, isLoading } = useRealtimeStrainStore(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'thc'>('recent');
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');
  const [api, setApi] = useState<CarouselApi>();

  // Filter strains based on type
  const filteredStrains = strains.filter(strain => {
    if (filterType === 'all') return true;
    return strain.type === filterType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'thc':
        return (b.thc || 0) - (a.thc || 0);
      case 'recent':
      default:
        return new Date(b.scannedAt || '').getTime() - new Date(a.scannedAt || '').getTime();
    }
  });

  const currentStrain = filteredStrains[currentIndex];

  // Set up carousel API to track active slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect(); // Set initial index

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || filteredStrains.length <= 1 || !api) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % filteredStrains.length;
      api.scrollTo(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, filteredStrains.length, currentIndex, api]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    if (api) {
      api.scrollTo(0);
    }
  }, [filterType, sortBy, api]);

  const handleNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

  const handlePrevious = () => {
    if (api) {
      api.scrollPrev();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleNavigation = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">No strains available for showcase</p>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <FullscreenGallery
        strains={filteredStrains}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        onExit={handleExitFullscreen}
        transitionMode={transitionMode}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ShowcaseFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        strainCount={filteredStrains.length}
      />

      {/* Mobile-First Card Carousel */}
      <div className="relative">
        <Carousel 
          className="w-full"
          setApi={setApi}
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

          {/* Mobile Swipe Indicators */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {filteredStrains.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
                }`}
                onClick={() => handleNavigation(index)}
              />
            ))}
          </div>
        </Carousel>
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
        onNav={handleNavigation}
        currentStrain={currentStrain}
      />
    </div>
  );
};

export default StrainShowcase;
