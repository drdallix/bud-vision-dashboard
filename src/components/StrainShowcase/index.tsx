
import { useState, useEffect } from 'react';
import { useRealtimeStrainStore } from '@/stores/useRealtimeStrainStore';
import { Strain } from '@/types/strain';
import ShowcaseSlide from './ShowcaseSlide';
import ShowcaseProgress from './ShowcaseProgress';
import ShowcaseControls from './ShowcaseControls';
import ShowcaseFilters from './ShowcaseFilters';
import FullscreenSceneManager from './FullscreenSceneManager';
import SlideNavigation from './SlideNavigation';

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
  const [transitionMode, setTransitionMode] = useState<'fade' | 'slide'>('fade');

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

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying || filteredStrains.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredStrains.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, filteredStrains.length]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterType, sortBy]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredStrains.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + filteredStrains.length) % filteredStrains.length);
  };

  const handleStrainClick = (strain: Strain) => {
    console.log('Strain clicked in showcase:', strain.name);
    if (onStrainSelect) {
      onStrainSelect(strain);
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

  return (
    <div className="space-y-6">
      <ShowcaseFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        strainCount={filteredStrains.length}
      />

      <div className="relative">
        {isFullscreen ? (
          <FullscreenSceneManager
            strain={currentStrain}
            mode={transitionMode}
            onStrainClick={handleStrainClick}
          />
        ) : (
          <ShowcaseSlide
            strain={currentStrain}
            onStrainClick={handleStrainClick}
          />
        )}

        <ShowcaseControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFullscreen={() => setIsFullscreen(true)}
          transitionMode={transitionMode}
          onTransitionChange={setTransitionMode}
          disabled={filteredStrains.length <= 1}
        />
      </div>

      <ShowcaseProgress
        total={filteredStrains.length}
        current={currentIndex}
        onNav={(index) => setCurrentIndex(index)}
      />

      <SlideNavigation
        strains={filteredStrains}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />

      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50">
          <FullscreenSceneManager
            strain={currentStrain}
            mode={transitionMode}
            onStrainClick={handleStrainClick}
          />
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default StrainShowcase;
