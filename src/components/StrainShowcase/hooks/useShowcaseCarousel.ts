
import { useState, useEffect, useCallback } from 'react';
import { CarouselApi } from '@/components/ui/carousel';
import { Strain } from '@/types/strain';

interface UseShowcaseCarouselProps {
  filteredStrains: Strain[];
  isPlaying: boolean;
}

export const useShowcaseCarousel = ({ filteredStrains, isPlaying }: UseShowcaseCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

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
    
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Enhanced auto-advance logic with real-time filter refresh
  useEffect(() => {
    if (!isPlaying || filteredStrains.length <= 1) return;

    console.log('Starting carousel autoplay with', filteredStrains.length, 'strains');

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % filteredStrains.length;
        console.log('Carousel advancing from', prev, 'to', nextIndex);
        if (carouselApi) {
          carouselApi.scrollTo(nextIndex);
        }
        return nextIndex;
      });
    }, 5000);

    return () => {
      console.log('Stopping carousel autoplay');
      clearInterval(interval);
    };
  }, [isPlaying, filteredStrains.length, carouselApi]);

  // Reset index when filters change (real-time synchronization)
  useEffect(() => {
    console.log('Checking carousel index sync: currentIndex=', currentIndex, 'filteredStrains.length=', filteredStrains.length);
    
    if (filteredStrains.length === 0) {
      setCurrentIndex(0);
      return;
    }
    
    if (currentIndex >= filteredStrains.length) {
      const newIndex = 0;
      console.log('Resetting carousel index from', currentIndex, 'to', newIndex, 'due to filter change');
      setCurrentIndex(newIndex);
      if (carouselApi) {
        carouselApi.scrollTo(newIndex);
      }
    }
  }, [filteredStrains.length, carouselApi, currentIndex]);

  const handleNext = useCallback(() => {
    if (filteredStrains.length === 0) return;
    const nextIndex = (currentIndex + 1) % filteredStrains.length;
    console.log('Manual next: advancing from', currentIndex, 'to', nextIndex);
    setCurrentIndex(nextIndex);
    if (carouselApi) {
      carouselApi.scrollTo(nextIndex);
    }
  }, [currentIndex, filteredStrains.length, carouselApi]);

  const handlePrevious = useCallback(() => {
    if (filteredStrains.length === 0) return;
    const prevIndex = (currentIndex - 1 + filteredStrains.length) % filteredStrains.length;
    console.log('Manual previous: going from', currentIndex, 'to', prevIndex);
    setCurrentIndex(prevIndex);
    if (carouselApi) {
      carouselApi.scrollTo(prevIndex);
    }
  }, [currentIndex, filteredStrains.length, carouselApi]);

  const handleNavigateToIndex = useCallback((index: number) => {
    if (index < 0 || index >= filteredStrains.length) return;
    console.log('Manual navigation to index', index);
    setCurrentIndex(index);
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  }, [carouselApi, filteredStrains.length]);

  return {
    currentIndex,
    setCurrentIndex,
    carouselApi,
    setCarouselApi,
    handleNext,
    handlePrevious,
    handleNavigateToIndex
  };
};
