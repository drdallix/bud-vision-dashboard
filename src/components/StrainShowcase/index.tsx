
import { useRef, useEffect, useCallback, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useStrainData } from '@/data/hooks/useStrainData';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseControls from './ShowcaseControls';
import ShowcaseProgress from './ShowcaseProgress';

// Showcase config
const SLIDE_INTERVAL = 8500; // ms

const StrainShowcase = () => {
  const { strains, isLoading } = useStrainData(true);
  const inStockStrains = strains.filter((s) => s.inStock);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Loop to next slide automatically
  useEffect(() => {
    if (!inStockStrains.length || paused) return;
    const t = setTimeout(() => {
      setCurrent((c) => (c + 1) % inStockStrains.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(t);
  }, [current, inStockStrains.length, paused]);

  // Pause on tab blur (mobile friendly)
  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
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
    <div className="w-full max-w-3xl mx-auto shadow-lg rounded-xl bg-background border relative p-4 sm:p-6 animate-fade-in">
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
              className={`transition-all duration-700 ease-in-out ${
                current === i
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-50 scale-90 z-0 pointer-events-none"
              }`}
              aria-hidden={current !== i}
            >
              <ShowcaseSlide strain={strain} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <ShowcaseControls
          total={inStockStrains.length}
          current={current}
          paused={paused}
          setPaused={setPaused}
          onNav={(step) => setCurrent(step)}
        />
        <ShowcaseProgress current={current} total={inStockStrains.length} />
      </Carousel>
    </div>
  );
};

export default StrainShowcase;
