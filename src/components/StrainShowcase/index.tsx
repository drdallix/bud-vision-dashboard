
import { useRef, useEffect, useCallback, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useStrainData } from '@/data/hooks/useStrainData';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseControls from './ShowcaseControls';
import ShowcaseProgress from './ShowcaseProgress';

const StrainShowcase = () => {
  const { strains, isLoading } = useStrainData(true);
  const inStockStrains = strains.filter((s) => s.inStock);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(true); // Start paused by default
  const [slideInterval, setSlideInterval] = useState(8500); // Configurable interval

  // Auto-advance logic (only when not paused)
  useEffect(() => {
    if (!inStockStrains.length || paused) return;
    const t = setTimeout(() => {
      setCurrent((c) => (c + 1) % inStockStrains.length);
    }, slideInterval);
    return () => clearTimeout(t);
  }, [current, inStockStrains.length, paused, slideInterval]);

  // Pause on tab blur (mobile friendly)
  useEffect(() => {
    const handleVisibility = () => setPaused(true); // Always pause when tab hidden
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Keyboard navigation (left/right arrows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent((c) => c === 0 ? inStockStrains.length - 1 : c - 1);
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % inStockStrains.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inStockStrains.length]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>;
  }
  if (!inStockStrains.length) {
    return <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
      <span className="text-5xl mb-2">🪴</span>
      <div>No strains currently in stock</div>
    </div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Showcase */}
      <div className="shadow-lg rounded-xl bg-background border relative p-4 sm:p-6 animate-fade-in">
        <Carousel
          orientation="horizontal"
          opts={{
            loop: true,
            skipSnaps: true,
            align: 'center'
          }}
        >
          <CarouselContent>
            {inStockStrains.map((strain, i) => (
              <CarouselItem 
                key={strain.id} 
                className={`transition-all duration-500 ease-in-out ${
                  current === i
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute inset-0"
                }`}
                style={{ display: current === i ? 'block' : 'none' }}
              >
                <ShowcaseSlide strain={strain} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <ShowcaseProgress current={current} total={inStockStrains.length} />
      </div>

      {/* Enhanced Controls */}
      <ShowcaseControls
        total={inStockStrains.length}
        current={current}
        paused={paused}
        slideInterval={slideInterval}
        setPaused={setPaused}
        setSlideInterval={setSlideInterval}
        onNav={(step) => setCurrent(step)}
        onGoToSlide={goToSlide}
      />
    </div>
  );
};

export default StrainShowcase;
