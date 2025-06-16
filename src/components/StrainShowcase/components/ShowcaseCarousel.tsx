
import { Strain } from '@/types/strain';
import ShowcaseSlide from '../ShowcaseSlide';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';

interface ShowcaseCarouselProps {
  filteredStrains: Strain[];
  currentIndex: number;
  setCarouselApi: (api: CarouselApi) => void;
  onNavigateToIndex: (index: number) => void;
  isFavorite: (strainId: string) => boolean;
  onToggleFavorite: (strain: Strain) => void;
}

const ShowcaseCarousel = ({ 
  filteredStrains, 
  currentIndex, 
  setCarouselApi, 
  onNavigateToIndex,
  isFavorite,
  onToggleFavorite
}: ShowcaseCarouselProps) => {
  return (
    <div className="relative">
      <Carousel 
        className="w-full"
        setApi={setCarouselApi}
        opts={{
          align: "center",
          loop: true,
          duration: 15, // Snappy transition
          skipSnaps: false,
          dragFree: false,
        }}
      >
        <CarouselContent className="-ml-1 md:-ml-4">
          {filteredStrains.map((strain, index) => (
            <CarouselItem 
              key={strain.id} 
              className="pl-1 md:pl-4 basis-full"
            >
              <div className="min-h-[500px] md:min-h-[600px] bg-gradient-to-br from-background to-muted/20 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md">
                <ShowcaseSlide
                  strain={strain}
                  isActive={index === currentIndex}
                  index={index}
                  isFavorite={isFavorite(strain.id)}
                  onToggleFavorite={onToggleFavorite}
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

      {/* Mobile swipe indicators - simplified and larger for one-handed use */}
      <div className="flex justify-center mt-3 space-x-1 md:hidden">
        {filteredStrains.slice(0, Math.min(8, filteredStrains.length)).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-green-600 scale-110' 
                : 'bg-gray-300 active:bg-gray-400'
            }`}
            onClick={() => onNavigateToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        {filteredStrains.length > 8 && (
          <span className="text-xs text-muted-foreground ml-2">
            +{filteredStrains.length - 8}
          </span>
        )}
      </div>
    </div>
  );
};

export default ShowcaseCarousel;
