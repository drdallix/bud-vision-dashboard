
import { useRef, useEffect, useCallback, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { useStrainData } from '@/data/hooks/useStrainData';
import { useAuth } from '@/contexts/AuthContext';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseControls from './ShowcaseControls';
import ShowcaseFilters from './ShowcaseFilters';
import FullscreenShowcaseSlide from './FullscreenShowcaseSlide';
import FullscreenControls from './FullscreenControls';
import { Strain } from '@/types/strain';

const StrainShowcase = () => {
  const { strains, isLoading } = useStrainData(true);
  const { user } = useAuth();
  const [filteredStrains, setFilteredStrains] = useState<Strain[]>([]);
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-play by default for signed-out users, paused for signed-in users
  const [paused, setPaused] = useState(!!user);
  const [slideInterval, setSlideInterval] = useState(6000);
  const [showControls, setShowControls] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  
  // Fullscreen specific states
  const [showFullscreenControls, setShowFullscreenControls] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const fullscreenControlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Filter and sort states
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Indica', 'Sativa', 'Hybrid']);
  const [sortBy, setSortBy] = useState<'name' | 'thc' | 'recent'>('name');
  const [minTHC, setMinTHC] = useState(0);

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Set initial auto-play state based on user status
  useEffect(() => {
    setPaused(!!user);
  }, [user]);

  // Filter and sort strains
  useEffect(() => {
    let filtered = strains.filter(strain => 
      strain.inStock && 
      selectedTypes.includes(strain.type) &&
      strain.thc >= minTHC
    );

    // Sort strains
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'thc':
          return b.thc - a.thc;
        case 'recent':
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredStrains(filtered);
    setCurrent(0);
    if (api) {
      api.scrollTo(0);
    }
  }, [strains, selectedTypes, sortBy, minTHC, api]);

  // Auto-advance logic with shuffle mode
  useEffect(() => {
    if (!filteredStrains.length || paused) return;
    const timer = setTimeout(() => {
      if (api) {
        if (shuffleMode) {
          // Random slide selection in shuffle mode
          const randomIndex = Math.floor(Math.random() * filteredStrains.length);
          api.scrollTo(randomIndex);
        } else {
          api.scrollNext();
        }
      }
    }, slideInterval);
    return () => clearTimeout(timer);
  }, [current, filteredStrains.length, paused, slideInterval, api, shuffleMode]);

  // Auto-hide controls for signed-out users
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Only auto-hide for signed-out users
    if (!user) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!paused) {
          setShowControls(false);
        }
      }, 4000);
    }
  }, [paused, user]);

  // Fullscreen controls auto-hide
  const resetFullscreenControlsTimer = useCallback(() => {
    setShowFullscreenControls(true);
    if (fullscreenControlsTimeoutRef.current) {
      clearTimeout(fullscreenControlsTimeoutRef.current);
    }
    
    fullscreenControlsTimeoutRef.current = setTimeout(() => {
      setShowFullscreenControls(false);
    }, 3000);
  }, []);

  // Handle user interaction
  const handleInteraction = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Handle fullscreen mouse movement
  const handleFullscreenMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientY, currentTarget } = e;
    const windowHeight = (currentTarget as HTMLElement).clientHeight;
    
    // Show controls when mouse is in bottom 20% of screen
    if (clientY > windowHeight * 0.8) {
      resetFullscreenControlsTimer();
    }
  }, [resetFullscreenControlsTimer]);

  // Setup carousel events
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Pause on tab blur
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Reset controls timer when paused state changes
  useEffect(() => {
    resetControlsTimer();
  }, [paused, resetControlsTimer]);

  // Auto-start showcase for signed-out users after a brief delay
  useEffect(() => {
    if (!user && filteredStrains.length > 0) {
      const startTimer = setTimeout(() => {
        setPaused(false);
      }, 2000); // Start auto-play after 2 seconds
      
      return () => clearTimeout(startTimer);
    }
  }, [user, filteredStrains.length]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl animate-pulse">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading strains...</p>
        </div>
      </div>
    );
  }

  if (!filteredStrains.length) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 px-2 md:px-4">
        {/* Main Showcase - Empty State */}
        <div className="relative">
          <div className="shadow-2xl rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 border border-green-200/50 backdrop-blur-sm overflow-hidden">
            <div className="h-64 md:h-96 flex flex-col items-center justify-center text-muted-foreground">
              <span className="text-4xl md:text-6xl mb-4 animate-bounce">🪴</span>
              <div className="text-lg md:text-xl font-medium">No strains match your filters</div>
              <div className="text-sm mt-2">Try adjusting your search criteria below</div>
            </div>
          </div>
        </div>

        {/* Always show filters when there are no results */}
        <div className="transition-all duration-500 opacity-100 transform-none">
          <ShowcaseFilters
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            sortBy={sortBy}
            setSortBy={setSortBy}
            minTHC={minTHC}
            setMinTHC={setMinTHC}
            strainCount={filteredStrains.length}
          />
        </div>
      </div>
    );
  }

  // Fullscreen mode - immersive experience
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden"
        onMouseMove={handleFullscreenMouseMove}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            skipSnaps: false,
            align: 'center',
            dragFree: false,
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
            duration: shuffleMode ? Math.random() * 20 + 10 : 25,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="-ml-1 md:-ml-2 h-full">
            {filteredStrains.map((strain, index) => (
              <CarouselItem key={strain.id} className="pl-1 md:pl-2 h-full">
                <div className="h-full flex items-center justify-center p-4">
                  <FullscreenShowcaseSlide 
                    strain={strain} 
                    isActive={index === current}
                    index={index}
                    shuffleMode={shuffleMode}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Fullscreen Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 ${
          showFullscreenControls 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}>
          <FullscreenControls
            total={filteredStrains.length}
            current={current}
            paused={paused}
            shuffleMode={shuffleMode}
            slideInterval={slideInterval}
            setPaused={setPaused}
            setShuffleMode={setShuffleMode}
            setSlideInterval={setSlideInterval}
            onNav={(index) => api?.scrollTo(index)}
            currentStrain={filteredStrains[current]}
          />
        </div>
      </div>
    );
  }

  // Normal mode - show everything
  return (
    <div 
      className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 px-2 md:px-4"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onMouseMove={handleInteraction}
    >
      {/* Main Showcase - Full Width */}
      <div className="relative">
        <div className="shadow-2xl rounded-2xl md:rounded-3xl bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 border border-green-200/50 backdrop-blur-sm overflow-hidden">
          <Carousel
            setApi={setApi}
            opts={{
              loop: true,
              skipSnaps: false,
              align: 'center',
              dragFree: false,
              containScroll: 'trimSnaps',
              slidesToScroll: 1,
              duration: 25,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {filteredStrains.map((strain, index) => (
                <CarouselItem key={strain.id} className="pl-1 md:pl-2">
                  <div className="p-2 md:p-4 lg:p-8">
                    <ShowcaseSlide 
                      strain={strain} 
                      isActive={index === current}
                      index={index}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Progress dots */}
        <div className="absolute -bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 md:gap-2">
          {filteredStrains.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                index === current 
                  ? 'bg-green-600 scale-150 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Controls - Always visible for signed-in users, auto-hide for signed-out */}
      <div className={`transition-all duration-500 ${
        user || showControls
          ? 'opacity-100 transform-none' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <ShowcaseControls
          total={filteredStrains.length}
          current={current}
          paused={paused}
          slideInterval={slideInterval}
          setPaused={setPaused}
          setSlideInterval={setSlideInterval}
          onNav={(index) => api?.scrollTo(index)}
          currentStrain={filteredStrains[current]}
        />
      </div>

      {/* Filters - Always visible for signed-in users, auto-hide for signed-out */}
      <div className={`transition-all duration-500 ${
        user || showControls
          ? 'opacity-100 transform-none' 
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <ShowcaseFilters
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          sortBy={sortBy}
          setSortBy={setSortBy}
          minTHC={minTHC}
          setMinTHC={setMinTHC}
          strainCount={filteredStrains.length}
        />
      </div>
    </div>
  );
};

export default StrainShowcase;
