
import { useState, useEffect } from 'react';
import { Strain } from '@/types/strain';
import FullscreenShowcaseSlide from '../FullscreenShowcaseSlide';
import FullscreenControls from '../FullscreenControls';
import { TransitionMode } from '../FullscreenTransitions';
import { AnimationSettings } from '../AnimationSettings';
import { loadAnimationSettings } from '@/services/animationSettingsService';

interface FullscreenViewProps {
  strains: Strain[];
  currentIndex: number;
  isPlaying: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onStrainSelect?: (strain: Strain) => void;
}

const FullscreenView = ({ 
  strains,
  currentIndex, 
  isPlaying,
  onClose,
  onNext,
  onPrevious,
  onPlayPause,
  onStrainSelect
}: FullscreenViewProps) => {
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('elegant');
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings | null>(null);
  
  const currentStrain = strains[currentIndex];

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await loadAnimationSettings();
      setAnimationSettings(settings);
      setTransitionMode(settings.transitionMode);
    };
    loadSettings();
  }, []);

  const handleNavigateToIndex = (index: number) => {
    if (index === currentIndex + 1) {
      onNext();
    } else if (index === currentIndex - 1) {
      onPrevious();
    }
  };

  if (!currentStrain) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Main fullscreen slide */}
      <div className="absolute inset-0">
        <FullscreenShowcaseSlide
          strain={currentStrain}
          isActive={true}
          index={currentIndex}
          transitionMode={transitionMode}
          animationSettings={animationSettings || undefined}
        />
      </div>

      {/* Exit button - always visible */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 z-50 transition-colors backdrop-blur-sm"
        aria-label="Exit fullscreen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Fullscreen controls */}
      <FullscreenControls
        total={strains.length}
        current={currentIndex}
        paused={!isPlaying}
        slideInterval={5000}
        setPaused={(paused) => onPlayPause()}
        setSlideInterval={() => {}} // Handled by AnimationSettings
        onNav={handleNavigateToIndex}
        currentStrain={currentStrain}
        transitionMode={transitionMode}
        setTransitionMode={setTransitionMode}
        shuffleTransitions={false}
        setShuffleTransitions={() => {}} // Handled by AnimationSettings
        shuffleMode={false}
        setShuffleMode={() => {}} // Handled by AnimationSettings
      />
    </div>
  );
};

export default FullscreenView;
