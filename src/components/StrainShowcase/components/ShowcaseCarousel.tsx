
import { Strain } from '@/types/strain';
import ShowcaseSlide from '../ShowcaseSlide';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel';

interface ShowcaseCarouselProps {
  filteredStrains: Strain[];
  currentIndex: number;
  setCarouselApi: (api: CarouselApi) => void;
  onNavigateToIndex: (index: number) => void;
}

const ShowcaseCarousel = ({ 
  filteredStrains, 
  currentIndex, 
  setCarouselApi, 
  onNavigateToIndex 
}: ShowcaseCarouselProps) => {
  return (
    <div className="relative">
      <Carousel 
        className="w-full"
        setApi={setCarouselApi}
        opts={{
          align: "center",
          loop: true,
          duration: 20, // Smooth transition duration
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4 transition-transform duration-500 ease-in-out">
          {filteredStrains.map((strain, index) => (
            <CarouselItem 
              key={strain.id} 
              className="pl-2 md:pl-4 basis-full transform transition-all duration-500 ease-in-out"
              style={{
                transform: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                opacity: index === currentIndex ? 1 : 0.7
              }}
            >
              <div 
                className={`min-h-[600px] bg-gradient-to-br from-background to-muted/20 rounded-2xl p-4 md:p-6 shadow-lg transition-all duration-500 ease-in-out ${
                  index === currentIndex ? 'shadow-2xl scale-100' : 'shadow-md scale-95'
                }`}
              >
                <ShowcaseSlide
                  strain={strain}
                  isActive={index === currentIndex}
                  index={index}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Desktop Navigation Arrows with smooth transitions */}
        <div className="hidden md:block">
          <CarouselPrevious className="absolute -left-12 top-1/2 transition-all duration-300 hover:scale-110 hover:shadow-lg" />
          <CarouselNext className="absolute -right-12 top-1/2 transition-all duration-300 hover:scale-110 hover:shadow-lg" />
        </div>
      </Carousel>

      {/* Mobile Swipe Indicators/Dots with animations */}
      <div className="flex justify-center mt-4 space-x-2 md:hidden">
        {filteredStrains.slice(0, Math.min(10, filteredStrains.length)).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-500 ease-in-out transform ${
              index === currentIndex 
                ? 'bg-green-600 scale-150 shadow-lg' 
                : 'bg-gray-300 hover:bg-gray-400 hover:scale-125'
            }`}
            onClick={() => onNavigateToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        {filteredStrains.length > 10 && (
          <span className="text-xs text-muted-foreground ml-2 animate-fade-in">
            +{filteredStrains.length - 10}
          </span>
        )}
      </div>
    </div>
  );
};

export default ShowcaseCarousel;
