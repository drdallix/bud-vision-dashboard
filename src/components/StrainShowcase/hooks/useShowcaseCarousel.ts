
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

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % filteredStrains.length;
    setCurrentIndex(nextIndex);
    if (carouselApi) {
      carouselApi.scrollTo(nextIndex);
    }
  }, [currentIndex, filteredStrains.length, carouselApi]);

  const handlePrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + filteredStrains.length) % filteredStrains.length;
    setCurrentIndex(prevIndex);
    if (carouselApi) {
      carouselApi.scrollTo(prevIndex);
    }
  }, [currentIndex, filteredStrains.length, carouselApi]);

  const handleNavigateToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  }, [carouselApi]);

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
